import mongoose = require('mongoose');
const { Schema, model, Document } = mongoose;

// Enums for better type safety
enum OrderStatus {
  SHIPPED = 'SHIPPED',
  IN_PROCESS = 'IN PROCESS',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ONHOLD',
  RESOLVED = 'RESOLVED'
}

enum DealSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE'
}

enum DangerLevel {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH'
}

enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CASH = 'cash',
  PAYPAL = 'paypal'
}

// Interface definitions
interface IInvoice extends Document {
  invoicenumber: string;
  stripeinvoiceid?: string;
  issueremail: string;
  ordernumber: number; 
  invoicedate: Date;
  duedate: Date;
  status: InvoiceStatus;
  subtotal?: number;
  taxrate?: number;
  taxamount?: number;
  totalamount?: number;
  paymentmethod?: PaymentMethod;
  paymentdate?: Date;
  payday?: number;
  followupdate?: Date;
  followupstage?: number;
  emailhtml?: string;
  notes?: string;
}

interface IOrderLine extends Document {
  orderlinenumber: number;
  productcode: string;
  productline: string;
  quantityordered: number;
  priceeach: number;
  sales: number;
  msrp: number;
}

interface IOrder extends Document {
  ordernumber: number;
  orderdate: Date;
  status: OrderStatus; 
  qtr_id: number;
  month_id: number;
  year_id: number;
  customerid: string; // Reference to Customer collection
  dealsize: DealSize; 
  orderlines: IOrderLine[];
}

interface ICustomer extends Document {
  customerid: string;
  stripeCustomerId ?: string;
  name: string;
  phone: string;
  email: string;
  addressline1: string;
  addressline2?: string;
  city: string;
  state: string;
  postalcode: number;
  country: string;
  territory: string;
  contactlastname: string;
  contactfirstname: string;
  riskscore?: number;
  dangerlevel: DangerLevel;
  totalrevenue: number;
  totalinvoices: number;
  totaloutstanding: number;
  averageday: number;
}

// Helper function for price formatting
const formatPrice = (v: number): number => Number(v.toFixed(2));

// Schema definitions
const customersSchema = new Schema<ICustomer>(
  {
    customerid: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    stripeCustomerId: {
      type: String,
      required: false,
      unique: true,
      index: {
        unique: true,
        partialFilterExpression: { stripeCustomerId: { $type: "string" } } // only enforce uniqueness when it's a string
      },
      sparse: true
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    // IMPROVED: Structured address
    addressline1: {
      type: String,
      required: true,
      trim: true
    },
    addressline2: {
      type: String,
      required: false,
      trim: true,
      default: null
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    postalcode: {
      type: Number,
      required: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    territory: {
      type: String,
      required: true,
      trim: true
    },
    contactlastname: {
      type: String,
      required: true,
      trim: true
    },
    contactfirstname: {
      type: String,
      required: true,
      trim: true
    },
    riskscore: {
      type: Number,
      required: true,
      default: 0
    },
    dangerlevel: {
      type: String,
      required: true,
      enum: Object.values(DangerLevel),
      default: DangerLevel.NORMAL
    },
    totalrevenue: {
      type: Number,
      required: true,
      default: 0,
      get: formatPrice,
      set: formatPrice
    },
    totalinvoices: {
      type: Number,
      required: true,
      default: 0
    },
    totaloutstanding: {
      type: Number,
      required: true,
      default: 0,
      get: formatPrice,
      set: formatPrice
    },
    averageday: {
      type: Number,
      required: true,
    }
  },
  { 
    versionKey: false,
    timestamps: true
  }
);

const ordersSchema = new Schema<IOrder>(
  {
    ordernumber: {
      type: Number,
      required: true,
      unique: true
    },
    orderdate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus)
    },
    qtr_id: {
      type: Number,
      required: true
    },
    month_id: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      validate: {
        validator: Number.isInteger,
        message: 'Month must be an integer between 1-12'
      }
    },
    year_id: {
      type: Number,
      required: true
    },
    customerid: {
      type: String,
      required: true,
      ref: 'Customer' // Reference to Customer collection
    },
    dealsize: {
      type: String,
      required: true,
      enum: Object.values(DealSize)
    },
    // Order line items as subdocuments
    orderlines: [{
      orderlinenumber: {
        type: Number,
        required: true
      },
      productcode: {
        type: String,
        required: true
      },
      productline: {
        type: String,
        required: true
      },
      quantityordered: {
        type: Number,
        required: true
      },
      priceeach: {
        type: Number,
        required: true,
        get: formatPrice,
        set: formatPrice
      },
      sales: {
        type: Number,
        required: true,
        get: formatPrice,
        set: formatPrice
      },
      msrp: {
        type: Number,
        required: true,
        get: formatPrice,
        set: formatPrice
      }
    }]
  },
  { 
    versionKey: false,
    timestamps: true
  }
);

const invoicesSchema = new Schema<IInvoice>(
  {
    invoicenumber: {
      type: String,
      required: true,
      unique: true
    },
    stripeinvoiceid: {
      type: String,
      required: false,
      unique: true,
      default: null,
      sparse: true
    },
    issueremail: {
      type: String,
      required: true,
    },
    ordernumber: {
      type: Number,
      required: true,
      ref: 'Order' // Reference to the Orders collection
    },
    invoicedate: {
      type: Date,
      required: true,
      default: Date.now
    },
    duedate: {
      type: Date,
      required: true,
      default: function () {
        return new Date(this.invoicedate.getTime() + 90 * 24 * 60 * 60 * 1000);
      }
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(InvoiceStatus), 
      default: InvoiceStatus.DRAFT
    },
    subtotal: {
      type: Number,
      required: false,
      default: 0,
      get: formatPrice,
      set: formatPrice
    },
    taxrate: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
      max: 100 // Assuming percentage (1 = 1%)
    },
    taxamount: {
      type: Number,
      required: false,
      default: 0,
      get: formatPrice,
      set: formatPrice
    },
    totalamount: {
      type: Number,
      required: false,
      default: 0,
      get: formatPrice,
      set: formatPrice
    },
    paymentmethod: {
      type: String,
      required: false,
      default: null,
      enum: Object.values(PaymentMethod)
    },
    paymentdate: {
      type: Date,
      required: false,
      default: null
    },
    payday: {
      type: Number,
      required: false,
      default: 0
    },
    followupdate: {
      type: Date,
      required: false,
      default: null
    },
    followupstage: {
      type: Number,
      required: false,
      default: 0
    },
    emailhtml: {
      type: String,
      required: false,
      default: null
    },
    notes: {
      type: String,
      required: false,
      default: null
    }
  },
  { 
    versionKey: false,
    timestamps: true
  }
);

// invoicesSchema.pre("save", async function (next) {
//   try {
//     const order = await Order.findOne({ ordernumber: this.ordernumber });
//     if (!order) {
//       throw new Error(`Order ${this.ordernumber} not found`);
//     }

//     let subtotal = 0;
//     order.orderlines.forEach((line: any) => {
//       subtotal += line.priceeach * line.quantityordered;
//     });

//     this.subtotal = subtotal;
//     this.taxamount = (this.subtotal * (this.taxrate || 0)) / 100;
//     this.totalamount = this.subtotal + this.taxamount;

//     next();
//   } catch (err) {
//     next(err as any);
//   }
// });

// Create models
const Customer = model<ICustomer>('Customer', customersSchema);
const Order = model<IOrder>('Order', ordersSchema);
const Invoice = model<IInvoice>('Invoice', invoicesSchema);

// // Export
// export = {
//   Invoice,
//   Customer,
//   Order,
//   OrderStatus,
//   DealSize,
//   DangerLevel,
//   InvoiceStatus,
//   PaymentMethod
// };

// For backward compatibility with CommonJS
module.exports = {
  Invoice,
  Customer,
  Order,
  OrderStatus,
  DealSize,
  DangerLevel,
  InvoiceStatus,
  PaymentMethod
};

export type { IInvoice, ICustomer, IOrder, IOrderLine };