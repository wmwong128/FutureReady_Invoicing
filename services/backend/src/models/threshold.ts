const { Invoice, Customer, Order } = require("./dbScheme");

/**
 * Calculate the risk score of a customer
 * @param customerId The customer ID
 * @returns Risk score between 0 and 100
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

  // Step 3: Count outstanding and overdue invoices
  const outstandingInvoices = invoices.filter((inv: any) => inv.status === "PENDING").length;
  const overdueInvoices = invoices.filter((inv: any) => inv.status === "OVERDUE").length;

  // Step 4: Calculate outstanding amount (PENDING + OVERDUE)
  const outstandingAmount = invoices
    .filter((inv: any) => inv.status === "PENDING" || inv.status === "OVERDUE")
    .reduce((sum: number, inv: any) => sum + (inv.totalamount || 0), 0);

  // Step 5: Simple scoring system
  let riskScore = 0;
  
  // Outstanding invoices: +15 points each
  riskScore += outstandingInvoices * 15;
  
  // Overdue invoices: +50 points each
  riskScore += overdueInvoices * 50;
  
  // Outstanding amount: +1 point per 1000
  riskScore += Math.floor(outstandingAmount / 1000);

  // Cap at 100
  return Math.min(riskScore, 100);
}

/**
 * Get risk level (normal, high)
 */
function getRiskLevel(score: number): "NORMAL" | "HIGH" {
  if (score < 60) return "NORMAL";
  return "HIGH";
}

module.exports = {
  calculateCustomerRisk,
  getRiskLevel,
};