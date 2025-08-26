import express = require('express');
import metadata = require('./metadata');
import type { IInvoice, ICustomer, IOrder } from "./models/dbScheme";
import mailing = require('./mailing');
import Counter = require('./models/countSchema');
import expressOAuth2JWTBearer = require('express-oauth2-jwt-bearer');
import cors = require('cors');

const { auth } = expressOAuth2JWTBearer;

const name = metadata.packageData['name'] as string;
const containerPort = metadata.packageData['containerPort'] as number;
const hostPort = metadata.packageData['hostPort'] as number;

const AUTH0_AUDIENCE = process.env['AUTH0_AUDIENCE'] as string;
const AUTH0_ISSUER_BASE_URL = process.env['AUTH0_ISSUER_BASE_URL'] as string;
const FRONTEND_MAIN_URL = process.env['FRONTEND_MAIN_URL'] as string;
const NOAUTH = (process.env['NOAUTH'] ?? '') === 'true';

const app = express();
const mongoose = require('mongoose');
const { connectDB } = require("./models/database");
const { Invoice, Customer, Order } = require("./models/dbScheme");
// const { Invoice, Customer, Order } = schemas;
const { sendEmail } = mailing;
const { calculateCustomerRisk, getRiskLevel } = require("./models/threshold");

const stripe = require('stripe')(process.env.STRIPE_SECRET);

// Middleware for db
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const authOptions = {
  audience: AUTH0_AUDIENCE,
  issuerBaseURL: AUTH0_ISSUER_BASE_URL,
} as expressOAuth2JWTBearer.AuthOptions;

const errorHandler: express.ErrorRequestHandler = (err, _req, res, _next) => {
  if (err) {
    const status = (err?.status ?? 500) as number;
    const statusCode = (err?.statusCode ?? 500) as number;
    const message = (err?.message ?? 'Something bad happend.') as string;
    res.status(status).json({
      statusCode,
      message,
    });
  }
};

app.use(
  cors({
    origin: FRONTEND_MAIN_URL,
  })
);

const requireAuth = NOAUTH ? 
  (req: express.Request, res: express.Response, next: express.NextFunction) => next() : 
  auth(authOptions);

async function startServer() {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to database. Exiting.");
    process.exit(1);
  }
}

if (NOAUTH) {
  app.use((req, _res, next) => {
    req.user = { email: "abcd@gmail.com" };
    next();
  });
} else {
  app.use(requireAuth);

  // map Auth0 -> req.user
  app.use((req, _res, next) => {
    if (req.auth?.payload) {
      req.user = {
        email: req.auth.payload.email ?? undefined,
      };
    }
    next();
  });
}

// app.use((req, _res, next) => {
//   req.user = { email: "test2@gmail.com" };
//   next();
// });

app.use(errorHandler);
startServer();

app.get('/', async (req, res) => {
  try{
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const invoices = await Invoice.find({ issueremail: req.user?.email });

    let monthlyrevenue = 0;
    let lastmonthrevenue = 0;
    let aroutstanding = 0;
    let dayssalesoutstanding = 0;
    let totalpaid = 0;
    let totalunpaid = 0;
    let totaloverdue = 0;
    let percentagerevenue = 0;
    let debt = 0;

    const revenueTrend: { month: string; actual: number }[] = [];

    for (const inv of invoices) {
      if (inv.status === "PAID") {
        if (inv.invoicedate >= thirtyDaysAgo && inv.invoicedate <= now) {
          monthlyrevenue += inv.totalamount ?? 0;
        }
        if (inv.invoicedate >= sixtyDaysAgo && inv.invoicedate <= thirtyDaysAgo) {
          lastmonthrevenue += inv.totalamount ?? 0;
        }
        const percentagerevenue = lastmonthrevenue > 0 ? ((monthlyrevenue - lastmonthrevenue) / lastmonthrevenue) * 100 : 0;
        
        if (inv.invoicedate) {
          const date = new Date(inv.invoicedate);
          const monthKey = date.toLocaleString("default", { month: "short" });
          let monthEntry = revenueTrend.find((item) => item.month === monthKey);

          if (monthEntry) {
            monthEntry.actual += inv.totalamount ?? 0;
          } else {
            revenueTrend.push({ month: monthKey, actual: inv.totalamount ?? 0 });
          }
        }

        totalpaid++;
      }

      if (inv.status === "PENDING") {
        aroutstanding += inv.totalamount ?? 0;
        dayssalesoutstanding += inv.payday ?? 0;
        totalunpaid++;
      }

      if (inv.status === "OVERDUE") {
        debt += inv.totalamount ?? 0;
        totaloverdue++;
      }
    }

    const monthlyRevenueBoard = {monthlyrevenue, percentagerevenue};
    const invoiceStatusList = {totaloverdue, totalunpaid, totalpaid};

    if (totalunpaid > 0) {
      dayssalesoutstanding = Math.round(dayssalesoutstanding / totalunpaid);
    } else {
      dayssalesoutstanding = 0;
    }

    const dashboard = { 
      mrr: monthlyRevenueBoard, 
      arAging: aroutstanding, 
      dso: dayssalesoutstanding, 
      debt: debt, 
      invoiceStatusList: invoiceStatusList,
      revenuetrend: revenueTrend
    };

    res.json(dashboard);

  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong", details: err });
  }
});

app.use(errorHandler);

app.listen(containerPort, () => {
  console.log(`${name} is listening on port ${hostPort}:${containerPort}`);
});

// Invoice dashboard
app.get('/invoice', async (req, res) => {
  try {
    const allInvoicesRaw  = await Invoice.find({issueremail: req.user?.email});
    const allInvoices: any[] = [];

    for (const invoice of allInvoicesRaw) {
      const order = await Order.findOne({ ordernumber: invoice.ordernumber });
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      const customer = await Customer.findOne({ customerid: order.customerid });
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const invObj = invoice.toObject() as any;
      invObj.client = customer.name; 
      invObj.riskscore = customer.riskscore;
      invObj.risk = customer.dangerlevel;
      allInvoices.push(invObj);
    }
    
    // Filter invoices by status
    const nonDraftInvoices = allInvoices.filter(invoice => invoice.status !== "DRAFT");
    const draftInvoices = allInvoices.filter(invoice => invoice.status === "DRAFT");
    
    // Calculate outstanding invoices 
    const outstandingInvoices = allInvoices.filter(invoice => 
      invoice.status !== "DRAFT" && invoice.status !== "OVERDUE" && invoice.status !== "PAID"
    );
    const totalOutstanding = outstandingInvoices.reduce((sum, invoice) => 
      sum + (invoice.totalamount || 0), 0
    );
    const countOutstanding = outstandingInvoices.length;
    
    // Calculate overdue invoices
    const overdueInvoices = allInvoices.filter(invoice => invoice.status === "OVERDUE");
    const totalOverdue = overdueInvoices.reduce((sum, invoice) => 
      sum + (invoice.totalamount || 0), 0
    );
    const countOverdue = overdueInvoices.length;
    
    // Calculate this month paid invoices
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const thisMonthPaidInvoices = allInvoices.filter(invoice => {
      if (invoice.status !== "PAID" || !invoice.payday) return false;
      const payDate = new Date(invoice.payday);
      return payDate.getMonth() === currentMonth && payDate.getFullYear() === currentYear;
    });
    
    const thisMonthPaid = thisMonthPaidInvoices.reduce((sum, invoice) => 
      sum + (invoice.totalamount || 0), 0
    );
    
    // Calculate average DSO (Days Sales Outstanding)
    const paidInvoices = allInvoices.filter(invoice => 
      invoice.status === "PAID" && invoice.payday
    );
    
    let averageDSO = 0;
    if (paidInvoices.length > 0) {
      const totalDSO = paidInvoices.reduce((sum, invoice) => {
        return sum + (invoice.payday || 0);
      }, 0);
      averageDSO = Math.round(totalDSO / paidInvoices.length);
    }

    const inv = {
      totalinvoices: allInvoices.length,
      totalOutstanding,
      countOutstanding,
      totalOverdue,
      countOverdue,
      thisMonthPaid,
      averageDSO,
      invoices: nonDraftInvoices,
      draftInvoices: draftInvoices
    };
    
    res.json(inv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong", details: err });
  }
});

// Invoice new form
app.get("/invoice/new", (_req,res) => {
  try {
    // Render new client form
    res.json("new invoice form");
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err });
  }
});

// Invoice manual create
app.post('/invoice', async (req, res) => {
  let stripeInvoice = null;
  let stripeCustomer = null;
  let createdInvoiceItems = [];

  interface InvoiceOrderLine {
  productline: string;
  productcode?: number;
  quantityordered: number;
  priceeach: number;
}

interface InvoiceData {
  invoicenumber: string;
  issueremail: string;
  client: string;
  invoicedate: string;
  duedate: string;
  orderlines: InvoiceOrderLine[];
}
  const session = await mongoose.startSession();
  
  try {
    const invoiceData: InvoiceData = req.body;
    
    // Start transaction
    await session.startTransaction();

    // Add new order
    async function getNextOrderNumber() {
      const counter = await Counter.findOneAndUpdate(
        { name: "ordernumber" },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      return counter.value;
    }

    const nextOrderNumber = await getNextOrderNumber();
    const invoiceDate = new Date(invoiceData.invoicedate);
    const invoiceDue = new Date(invoiceData.duedate);

    const invoiceCustomer = await Customer.findOne({ name: invoiceData.client }).session(session);
    if (!invoiceCustomer){
      return res.status(404).json({ error: "Customer not found" });
    }

    const orderlines = invoiceData.orderlines.map((line: InvoiceOrderLine, index: number) => ({
      orderlinenumber: index + 1,
      productline: line.productline,
      productcode: line.productcode ?? 1234,
      quantityordered: line.quantityordered,
      priceeach: line.priceeach,
      sales: line.quantityordered * line.priceeach,
      msrp: line.priceeach
    }));

    const newOrder = new Order({
      ordernumber: nextOrderNumber,
      orderdate: invoiceDate,
      status: "IN PROCESS",
      qtr_id: Math.ceil((invoiceDate.getMonth() + 1) / 3),
      month_id: invoiceDate.getMonth() + 1,
      year_id: invoiceDate.getFullYear(),
      customerid: invoiceCustomer.customerid,
      dealsize: "MEDIUM",
      orderlines
    });

    await newOrder.save({ session });

    // Finish adding order and retriving the order to use in invoice creation
    const order = newOrder;
    
    let customer = await Customer.findOne({ customerid: order.customerid }).session(session);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    
    // Creating new invoice in db
    const newInvoiceData: Partial<IInvoice> = {
      ordernumber: order.ordernumber,
      invoicenumber: invoiceData.invoicenumber,
      invoicedate: invoiceDate,
      issueremail: req.user?.email ?? "",
      duedate: invoiceDue
    };

    let subtotal = 0;
    order.orderlines.forEach((line: any) => {
      subtotal += line.priceeach * line.quantityordered;
    });

    newInvoiceData.subtotal = subtotal;
    newInvoiceData.taxamount = (newInvoiceData.subtotal * (newInvoiceData.taxrate || 0)) / 100;
    newInvoiceData.totalamount = newInvoiceData.subtotal + newInvoiceData.taxamount;
    const riskScore = await calculateCustomerRisk(customer.customerid);
    const riskLevel = getRiskLevel(riskScore);

    // Update the danger level of the customer
    await Customer.findOneAndUpdate(
      { customerid: order.customerid },
      { 
        $set: { 
          totalrevenue: (customer.totalrevenue || 0) + (newInvoiceData.totalamount || 0),
          totaloutstanding: (customer.totaloutstanding || 0) + (newInvoiceData.totalamount || 0),
          riskscore: riskScore,
          dangerlevel: riskLevel
        }, 
        $inc: { totalinvoices: 1 }
      },
      { new: true, session }
    );
    
    // Cheak whether the customer has stripe customer id or not (create one)
    if (!customer.stripeCustomerId) {
      stripeCustomer = await stripe.customers.create({
        name: customer.name,
        email: customer.email, 
        phone: customer.phone, 
        metadata: {
          customerid: customer.customerid
        }
      });

      customer = await Customer.findOneAndUpdate(
        { customerid: order.customerid },
        { 
          $set: { 
            stripeCustomerId: stripeCustomer.id,
          }, 
        },
        { new: true, session }
      );
      
      if (!customer) {
        throw new Error("Failed to update customer with Stripe ID");
      }
    }

    // Create new invoice in db
    const newInvoice = new Invoice(newInvoiceData);
    await newInvoice.save({ session });

    // Create new invoice in stripe
    stripeInvoice = await stripe.invoices.create({
      customer: customer.stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 90,
      currency: 'myr', 
      description: newInvoice.notes || `Invoice for Order ${newInvoice.ordernumber}`,
      custom_fields: [
        {
          name: "Order Line Number",
          value: order.orderlines.length.toString()
        }
      ],
      footer: "Any questions? Contact us at Whatsapp +60123456789",
      metadata: {
        invoicenumber: newInvoice.invoicenumber,
        ordernumber: newInvoice.ordernumber.toString(),
        customerid: customer.customerid
      },
      auto_advance: newInvoice.status !== 'DRAFT'
    });

    for (const orderLine of order.orderlines) {
      const invoiceItem = await stripe.invoiceItems.create({
        customer: customer.stripeCustomerId,
        invoice: stripeInvoice.id,
        currency: 'myr',
        unit_amount_decimal: (orderLine.priceeach * 100).toFixed(0),
        quantity: orderLine.quantityordered,
        description: `${orderLine.productline} - ${orderLine.productcode}`,
        metadata: {
          productcode: orderLine.productcode,
          productline: orderLine.productline,
          orderlinenumber: orderLine.orderlinenumber.toString()
        }
      });
      createdInvoiceItems.push(invoiceItem.id);
    }

    if (newInvoice.taxamount && newInvoice.taxamount > 0) {
      const taxItem = await stripe.invoiceItems.create({
        customer: customer.stripeCustomerId,
        invoice: stripeInvoice.id,
        amount: Math.round(newInvoice.taxamount * 100),
        currency: 'myr',
        description: `Tax (${newInvoice.taxrate}%)`,
        metadata: {
          type: 'tax',
          rate: (newInvoice.taxrate ?? 0).toString()
        }
      });
      createdInvoiceItems.push(taxItem.id);
    }

    // if (newInvoice.status !== 'DRAFT') {
    //   await stripe.invoices.finalizeInvoice(stripeInvoice.id);
    // }

    // After get the stripe id, update in db
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      newInvoice._id,
      { $set: { stripeinvoiceid: stripeInvoice.id } },
      { new: true, session }
    );

    if (!updatedInvoice) {
      throw new Error("Failed to update invoice with Stripe ID");
    }

    await session.commitTransaction();

    res.status(200).json({ 
      message: "Invoice created successfully!",
      invoice: updatedInvoice,
      stripeInvoiceId: stripeInvoice.id
    });

  } catch (err) {
    console.error('Invoice creation error:', err);
    
    // Rollback transaction
    await session.abortTransaction();
    
    // Cleanup Stripe
    if (stripeInvoice) {
      try {
        console.log("Cleaning up Stripe invoice due to error");
        
        for (const itemId of createdInvoiceItems) {
          try {
            await stripe.invoiceItems.del(itemId);
          } catch (itemErr) {
            console.error(`Failed to delete invoice item ${itemId}:`, itemErr);
          }
        }
        
        if (stripeInvoice.status === 'draft') {
          await stripe.invoices.del(stripeInvoice.id);
        } else {
          await stripe.invoices.voidInvoice(stripeInvoice.id);
        }
      } catch (cleanupErr) {
        console.error("CRITICAL: Failed to cleanup Stripe invoice:", cleanupErr);
      }
    }
    
    if (stripeCustomer) {
      try {
        console.log("Cleaning up Stripe customer due to error");
        await stripe.customers.del(stripeCustomer.id);
      } catch (customerCleanupErr) {
        console.error("Failed to cleanup Stripe customer:", customerCleanupErr);
      }
    }
    
    res.status(500).json({ 
      error: "Failed to create invoice",
      details: err instanceof Error ? err.message : 'Unknown error'
    });
    
  } finally {
    await session.endSession();
  }
});

// Invoice read/view (id)
app.get("/invoice/:id", async (req, res) => {
  try {
    const invoiceId = req.params.id; 
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    };
    const order = await Order.findOne({ ordernumber: invoice.ordernumber });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const customer = await Customer.findOne({ customerid: order.customerid });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    const invoiceData = {
      invoice: invoice,
      order: order,
      customer: customer
    };  
    res.json(invoiceData);
  } catch (err) {
    console.error("Error fetching invoice:", err);
    res.status(500).json({ error: "Something went wrong", details: err });
  }
});

// Invoice update (id, draft)
app.patch("/invoice/:id", async (req, res) => {
  let stripeInvoice = null;
  let createdInvoiceItems = [];
  let deletedStripeInvoiceId = null;
  const session = await mongoose.startSession();
  
  try {
    const invoiceId = req.params.id;
    const updateData = req.body;

    // Start transaction
    await session.startTransaction();

    const existingInvoice = await Invoice.findById(invoiceId).session(session);
    if (!existingInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    if (!existingInvoice.totalamount) {
      return res.status(400).json({ error: "Invoice total amount is missing or invalid" });
    }
    if (existingInvoice.status !== "DRAFT") {
      return res.status(403).json({ 
        error: "Invoice cannot be updated", 
        message: "Only invoices with draft status can be updated" 
      });
    }

    const order = await Order.findOne({ ordernumber: existingInvoice.ordernumber }).session(session);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const customer = await Customer.findOne({ customerid: order.customerid }).session(session);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    if (!customer.stripeCustomerId) {
      return res.status(400).json({ error: "Customer does not have a Stripe customer ID" });
    }

    // Separate order data from invoice data
    const { order: orderUpdateData, ...invoiceUpdateData } = updateData;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { $set: invoiceUpdateData },
      { new: true, runValidators: true, session }
    );

    if (!updatedInvoice) {
      throw new Error("Invoice update failed");
    }

    let updatedOrder = null;

    if (orderUpdateData.orderlines) {
      for (const line of orderUpdateData.orderlines) {
        const setObj: { [key: string]: any } = {};
        if (line.quantityordered !== undefined) setObj["orderlines.$.quantityordered"] = line.quantityordered;
        if (line.priceeach !== undefined) setObj["orderlines.$.priceeach"] = line.priceeach;
        if (line.sales !== undefined) setObj["orderlines.$.sales"] = line.sales;
        if (line.msrp !== undefined) setObj["orderlines.$.msrp"] = line.msrp;
        if (line.productline !== undefined) setObj["orderlines.$.productline"] = line.productline;
        if (line.productcode !== undefined) setObj["orderlines.$.productcode"] = line.productcode;

        const orderLineUpdate = await Order.updateOne(
          { _id: order._id, "orderlines.orderlinenumber": line.orderlinenumber },
          { $set: setObj },
          { session }
        );

        if (orderLineUpdate.matchedCount === 0) {
          throw new Error(`Order line ${line.orderlinenumber} not found`);
        }
      }

      const refreshedOrder = await Order.findById(order._id).session(session);
      if (!refreshedOrder) {
        throw new Error("Failed to refresh order after updates");
      }

      let subtotal = 0;
      refreshedOrder.orderlines.forEach((line: any) => {
        subtotal += line.priceeach * line.quantityordered;
      });

      invoiceUpdateData.subtotal = subtotal;
      invoiceUpdateData.taxamount = (subtotal * (invoiceUpdateData.taxrate || 0)) / 100;
      invoiceUpdateData.totalamount = subtotal + invoiceUpdateData.taxamount;

      await Invoice.findByIdAndUpdate(
        invoiceId,
        { $set: invoiceUpdateData },
        { new: true, runValidators: true, session }
      );

      const riskScore = await calculateCustomerRisk(customer.customerid);
      const riskLevel = getRiskLevel(riskScore);

      const oldAmount = Number(existingInvoice.totalamount || 0);
      const newAmount = Number(invoiceUpdateData.totalamount || 0);
      const delta = newAmount - oldAmount;

      await Customer.findOneAndUpdate(
        { customerid: customer.customerid },
        {
          $inc: {
            totalrevenue: delta,
            totaloutstanding: delta
          },
          $set: { 
            riskscore: riskScore,
            dangerlevel: riskLevel }
        },
        { new: true, session }
      );

      delete orderUpdateData.orderlines;

      if (Object.keys(orderUpdateData).length > 0) {
        updatedOrder = await Order.findByIdAndUpdate(
          order._id,
          { $set: orderUpdateData },
          { new: true, runValidators: true, session }
        );

        if (!updatedOrder) {
          throw new Error("Order update failed");
        }
      }
    }

    const orderToUse = updatedOrder ?? order;

    stripeInvoice = await stripe.invoices.create({
      customer: customer.stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: 90,
      currency: 'myr',
      description: updatedInvoice.notes || `Invoice for Order ${updatedInvoice.ordernumber}`,
      custom_fields: [
        {
          name: "Order Line Number",
          value: orderToUse.orderlines.length.toString()
        }
      ],
      footer: "Any questions? Contact us at Whatsapp +60123456789",
      metadata: {
        invoicenumber: updatedInvoice.invoicenumber,
        ordernumber: updatedInvoice.ordernumber.toString(),
        customerid: customer.customerid
      },
      auto_advance: updatedInvoice.status !== 'DRAFT'
    });

    for (const orderLine of orderToUse.orderlines) {
      const invoiceItem = await stripe.invoiceItems.create({
        customer: customer.stripeCustomerId,
        invoice: stripeInvoice.id,
        currency: 'myr',
        unit_amount_decimal: (orderLine.priceeach * 100).toFixed(0),
        quantity: orderLine.quantityordered,
        description: `${orderLine.productline} - ${orderLine.productcode}`,
        metadata: {
          productcode: orderLine.productcode,
          productline: orderLine.productline,
          orderlinenumber: orderLine.orderlinenumber.toString()
        }
      });
      createdInvoiceItems.push(invoiceItem.id);
    }

    if (updatedInvoice.taxamount && updatedInvoice.taxamount > 0) {
      const taxItem = await stripe.invoiceItems.create({
        customer: customer.stripeCustomerId,
        invoice: stripeInvoice.id,
        amount: Math.round(updatedInvoice.taxamount * 100),
        currency: 'myr',
        description: `Tax (${updatedInvoice.taxrate}%)`,
        metadata: {
          type: 'tax',
          rate: (updatedInvoice.taxrate ?? 0).toString()
        }
      });
      createdInvoiceItems.push(taxItem.id);
    }

    const finalInvoice = await Invoice.findByIdAndUpdate(
      updatedInvoice._id,
      { $set: { stripeinvoiceid: stripeInvoice.id } },
      { new: true, session }
    );

    if (!finalInvoice) {
      throw new Error("Failed to update invoice with new Stripe ID");
    }

    // Commit transaction
    await session.commitTransaction();

    if (existingInvoice.stripeinvoiceid && existingInvoice.stripeinvoiceid !== stripeInvoice.id) {
      try {
        const existingStripeInvoice = await stripe.invoices.retrieve(existingInvoice.stripeinvoiceid);
        if (existingStripeInvoice.status === 'draft') {
          await stripe.invoices.del(existingInvoice.stripeinvoiceid);
          console.log(`Successfully deleted old Stripe invoice: ${existingInvoice.stripeinvoiceid}`);
        }
      } catch (deleteErr) {
        console.error("Warning: Failed to delete old Stripe invoice:", deleteErr);
      }
    }

    res.json({
      message: "Invoice updated successfully",
      invoice: finalInvoice,
      ...(updatedOrder && { order: updatedOrder })
    });
    
  } catch (err) {
    console.error("Error updating invoice:", err);
    
    // Rollback transaction
    await session.abortTransaction();
    
    // Cleanup Stripe
    if (stripeInvoice) {
      try {
        console.log("Cleaning up new Stripe invoice due to error");
        
        for (const itemId of createdInvoiceItems) {
          try {
            await stripe.invoiceItems.del(itemId);
          } catch (itemErr) {
            console.error(`Failed to delete invoice item ${itemId}:`, itemErr);
          }
        }
        
        if (stripeInvoice.status === 'draft') {
          await stripe.invoices.del(stripeInvoice.id);
        } else {
          await stripe.invoices.voidInvoice(stripeInvoice.id);
        }
      } catch (cleanupErr) {
        console.error("CRITICAL: Failed to cleanup new Stripe invoice:", cleanupErr);
      }
    }
    
    if (deletedStripeInvoiceId && !stripeInvoice) {
      // Unfortunately, once a Stripe invoice is deleted, it cannot be restored
      console.error(`CRITICAL: Original Stripe invoice ${deletedStripeInvoiceId} was deleted but cannot be restored due to error:`, err);
    }
    
    res.status(500).json({ 
      error: "Failed to update invoice", 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
    
  } finally {
    await session.endSession();
  }
});

// Invoice delete (id, draft)
app.delete("/invoice/:id", async (req, res) => {
  const session = await mongoose.startSession();
  let deletedInvoice = null;
  
  try {
    const invoiceId = req.params.id;
    
    // Start transaction
    await session.startTransaction();

    const invoice = await Invoice.findById(invoiceId).session(session);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    };
    if (!invoice.totalamount) {
      return res.status(400).json({ error: "Invoice total amount is missing or invalid" });
    }
    
    if (invoice.status !== "DRAFT") {
      return res.status(403).json({ 
        error: "Invoice cannot be deleted", 
        message: "Only invoices with draft status can be deleted" 
      });
    };

    const order = await Order.findOne({ ordernumber: invoice.ordernumber }).session(session);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    };

    const customer = await Customer.findOne({ customerid: order.customerid }).session(session);
    if (!customer) { 
      return res.status(404).json({ error: "Customer not found" });
    };

    const riskScore = await calculateCustomerRisk(customer.customerid);
    const riskLevel = getRiskLevel(riskScore);

    await Customer.findOneAndUpdate(
      { customerid: customer.customerid },
      { 
        $inc: { 
          totaloutstanding: -invoice.totalamount,
          totalrevenue: -invoice.totalamount,
          totalinvoices: -1
        },
        $set: { 
          riskscore: riskScore,
          dangerlevel: riskLevel 
        }
      },
      { new: true, session }
    );

    if (invoice.stripeinvoiceid) {
      try {
        const existingStripeInvoice = await stripe.invoices.retrieve(invoice.stripeinvoiceid);
        if (existingStripeInvoice.status !== 'draft') {
          throw new Error(`Invoice ${invoice.stripeinvoiceid} is already finalized and cannot be deleted.`);
        }
      } catch (stripeErr) {
        console.error("Stripe validation failed:", stripeErr);
        throw stripeErr;
      }
    }

    deletedInvoice = await Invoice.findByIdAndDelete(invoiceId, { session });
    if (!deletedInvoice) {
      throw new Error("Failed to delete invoice from database");
    }

    await session.commitTransaction();

    if (invoice.stripeinvoiceid) {
      try {
        await stripe.invoices.del(invoice.stripeinvoiceid);
        console.log(`Successfully deleted Stripe invoice: ${invoice.stripeinvoiceid}`);
      } catch (stripeErr) {
        console.error("Warning: Failed to delete Stripe invoice (DB already committed):", stripeErr);
      }
    }

    res.json({ 
      message: "Invoice deleted successfully",
      deletedInvoice: {
        id: invoiceId,
        invoicenumber: deletedInvoice.invoicenumber,
        stripeinvoiceid: deletedInvoice.stripeinvoiceid
      }
    });

  } catch (err) {
    console.error("Error deleting invoice:", err);
    
    // Rollback transaction if still active
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    
    res.status(500).json({ 
      error: "Failed to delete invoice", 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
    
  } finally {
    await session.endSession();
  }
});

// Get Stripe invoice view
app.get("/invoice/:id/stripepreview", async (req, res) => {
  try {
    const invoiceId = req.params.id;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const stripeInvoiceId = invoice.stripeinvoiceid;
    if (!stripeInvoiceId) {
      return res.status(400).json({ 
        error: "No Stripe invoice ID found",
        localInvoiceId: invoiceId 
      });
    }

    const stripeInvoice = await stripe.invoices.retrieve(stripeInvoiceId);
    if (!stripeInvoice.invoice_pdf) {
      return res.status(404).json({ error: "PDF not available" });
    }

    const response = await fetch(stripeInvoice.invoice_pdf);
    if (!response.ok) {
      throw new Error('Failed to fetch PDF');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="invoice.pdf"');
    
    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err: any) { 
    if (err.code === 'resource_missing') {
      console.log("Invoice not found in Stripe. Checking if we can find it another way...");
      
      const invoice = await Invoice.findById(req.params.id);
      console.log("Failed Stripe ID:", invoice?.stripeinvoiceid);
      
      return res.status(404).json({ 
        error: "Invoice not found in Stripe",
        stripeInvoiceId: invoice?.stripeinvoiceid,
        suggestion: "Check if this invoice exists in your Stripe dashboard"
      });
    }
    
    console.error("Error fetching Stripe invoice:", err);
    res.status(500).json({ error: "Failed to fetch invoice preview", details: err.message });
  }
});

app.post("/invoice/:id/send", async (req, res) => {
  let stripeInvoice = null;
  const session = await mongoose.startSession();
  
  try {
    const invoiceId = req.params.id;

    // Transaction rollback
    await session.startTransaction();

    const dbInvoice = await Invoice.findById(invoiceId).session(session);
    if (!dbInvoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    if (!dbInvoice.stripeinvoiceid) {
      return res.status(400).json({ error: "No Stripe invoice ID found" });
    }

    stripeInvoice = await stripe.invoices.finalizeInvoice(dbInvoice.stripeinvoiceid);

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      { $set: { status: "PENDING" } },
      { new: true, runValidators: true, session }
    );

    if (!updatedInvoice) {
      throw new Error("Invoice update failed");
    }

    try {
      await sendEmail({
        payload: {
          to: 'tengstc@gmail.com', 
          subject: `Invoice ${updatedInvoice.invoicenumber}`,
          html: `<p>Hello, your invoice <strong>${updatedInvoice.invoicenumber}</strong> is ready.<br/>
                  View Stripe Invoice <a href="${stripeInvoice.invoice_pdf}">here</a>.</p>`,
        },
      });
    } catch (emailErr) {
      console.error("Failed to send email:", emailErr);
    }

    await session.commitTransaction();
    
    res.json({
      message: "Invoice finalized on Stripe and status updated",
      invoice: updatedInvoice,
      stripeInvoice
    });

  } catch (err) {
    // Rollback transaction
    await session.abortTransaction();
    
    if (stripeInvoice) {
      try {
        console.log("Attempting to void Stripe invoice due to DB failure");
        await stripe.invoices.voidInvoice(stripeInvoice.id);
      } catch (voidErr) {
        console.error("Failed to void Stripe invoice:", voidErr);
      }
    }
    
    console.error("Error finalizing invoice:", err);
    res.status(500).json({ error: "Failed to finalize invoice", details: err });
  } finally {
    await session.endSession();
  }
});

app.get("/customers", async (req, res) => {
  const customers = await Customer.find({}, "_id name email");
  res.json(customers);
});

app.get('/client', async (_req, res) => {
  try {
    // Render
    const allCustomers: ICustomer[] = await Customer.find({}) as ICustomer[];
    const cus = {
      totalclients: allCustomers.length,
      averagepaymentdays: allCustomers.reduce((acc: number, cur: ICustomer) => acc + cur.averageday, 0) / allCustomers.length,
      highriskcounts: allCustomers.filter((c: ICustomer) => c.dangerlevel === 'HIGH').length,
      allrevenue: allCustomers.reduce((acc: number, cur: ICustomer) => acc + cur.totalrevenue, 0),
      customers: allCustomers
    };
    res.json(cus); 
  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err });
  }
});

app.get('/client/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (err) {
    console.error("Error fetching customer:", err);
    res.status(500).json({ error: "Something went wrong", details: err });
  }
});

app.patch('/client/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const updateData = req.body;

    const existingCustomer = await Customer.findById(customerId);
    if (!existingCustomer) { 
      return res.status(404).json({ error: "Customer not found" });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.json({
      message: "Customer updated successfully",
      customer: updatedCustomer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong", details: err });
  }
});

app.get(/(.*)/, (_req, res) => {
    res.status(404).send("Page not found. Please check your URL.");
});