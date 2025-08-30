import type { Customer } from "./Customer";

export interface Invoice {
    _id: string;
    invoicenumber: string;
    status: string;
    subtotal: number;
    totalamount: number;
    invoicedate: string;
    duedate: string;
    client?: string;
    riskscore?: number;
    risk?: string;
    taxrate?: number;
}

export interface InvoiceStats {
    totalinvoices: number;
    totalOutstanding: number;
    countOutstanding: number;
    totalOverdue: number;
    countOverdue: number;
    thisMonthPaid: number;
    averageDSO: number;
}

export interface InvoiceReponse extends InvoiceStats {
    invoices: Invoice[];
    draftInvoices: Invoice[];
}

export interface InvoiceDetailsResponse {
    invoice: Invoice;
    order: Order;
    customer: Customer;
}

export interface Order {
    _id?: string;
    ordernumber?: number;
    orderdate?: string;
    status?: string;
    qtr_id?: number;
    month_id?: number;
    year_id?: number;
    customerid?: string;
    dealsize?: string;
    orderlines?: OrderLine[];
    updatedAt?: string;
}

export interface OrderLine {
    _id?: string;
    orderlinenumber?: number;
    productcode?: string;
    productline?: string;
    quantityordered?: number;
    priceeach?: number;
    sales?: number;
    msrp?: number;
}

export interface NewInvoiceRequest {
    client: string;
    invoicenumber: string;
    invoicedate: string;
    duedate: string;
    orderlines: OrderLine[];
    issueremail: string;
}