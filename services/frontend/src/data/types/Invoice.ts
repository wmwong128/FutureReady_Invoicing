export interface Invoice {
    _id: string;
    invoicenumber: string;
    status: string;
    subtotal: number;
    totalamount: number;
    invoicedate: string;
    duedate: string;
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