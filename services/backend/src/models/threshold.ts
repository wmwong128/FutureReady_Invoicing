import mongoose = require("mongoose");
import schemas = require("./dbScheme");

const { Invoice, Order } = schemas;

/**
 * Calculate the risk score of a customer
 * @param customerId The customer ID
 * @returns Risk score between 0 and 1
 */
async function calculateCustomerRisk(customerId: string): Promise<number> {
  // Step 1: Find all orders for this customer
  const orders = await Order.find({ customerid: customerId }).select("ordernumber");

  if (orders.length === 0) {
    return 0; // No orders → No invoices → No risk
  }

  const orderNumbers = orders.map((o: any) => o.ordernumber);

  // Step 2: Find all invoices linked to those orders
  const invoices = await Invoice.find({ ordernumber: { $in: orderNumbers } });

  if (invoices.length === 0) {
    return 0; // No invoices for this customer
  }

  // Step 3: Aggregate values
  const totalInvoices = invoices.length;
  const totalInvoiceAmount = invoices.reduce(
    (sum: number, inv: any) => sum + (inv.totalamount || 0),
    0
  );
  const totalOutstanding = invoices.reduce(
    (sum: number, inv: any) =>
      sum + (inv.status === "PENDING" || inv.status === "OVERDUE" ? inv.totalamount || 0 : 0),
    0
  );
  const overdueInvoices = invoices.filter((inv: any) => inv.status === "OVERDUE").length;
  const overdueAmount = invoices
    .filter((inv: any) => inv.status === "OVERDUE")
    .reduce((sum: number, inv: any) => sum + (inv.totalamount || 0), 0);

  // Step 4: Ratios
  const IOR = overdueInvoices / totalInvoices; // Overdue invoice ratio
  const OR =
    totalInvoiceAmount > 0 ? totalOutstanding / totalInvoiceAmount : 0; // Outstanding ratio
  const OAR = totalOutstanding > 0 ? overdueAmount / totalOutstanding : 0; // Overdue share

  // Step 5: Weighted risk formula
  const riskScore = 0.5 * IOR + 0.3 * OR + 0.2 * OAR;

  return parseFloat(riskScore.toFixed(3));
}

/**
 * Get risk level (low, medium, high)
 */
function getRiskLevel(score: number): "NORMAL" | "HIGH" {
  if (score < 0.6) return "NORMAL";
  return "HIGH";
}

module.exports = {
  calculateCustomerRisk,
  getRiskLevel,
};
