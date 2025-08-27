export interface Customer {
    _id?: string;
    customerid: string;
    stripeCustomerId?: string;
    name?: string;
    phone?: string;
    email?: string;
    addressline1?: string;
    addressline2?: string;
    city?: string;
    state?: string;
    postalcode?: string;
    country?: string;
    territory?: string;
    contactlastname?: string;
    contactfirstname?: string;
    dangerlevel?: string;
    totalrevenue: number;
    totalinvoices: number;
    totaloutstanding: number;
    averageday: number;
    updatedAt?: string;
}