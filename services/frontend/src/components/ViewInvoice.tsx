import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useInvoice } from "@/hooks/useInvoice";
import { type InvoiceDetailsResponse } from "@/data/types/Invoice";

const ViewInvoice = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { invoiceDetails, detailsError } = useInvoice(id);
    const [invoice, setInvoice] = useState<InvoiceDetailsResponse | null>(null) 

    if (detailsError) {
        alert("Invoice not found");
        navigate("/");
    }

    useEffect(() => {
        if (id && invoiceDetails) {
            setInvoice(invoiceDetails)
            if (invoiceDetails.invoice.status !== "DRAFT") {
                navigate("/");
            }
        }
    }, [id, invoiceDetails, navigate]);

    return (
        <div className="min-h-screen bg-background">
            <div className="container p-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate("/")}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Invoices
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => navigate(`/invoice/${id}/edit`)}
                                    className="gap-2"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Invoice
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-baseline pt-4">
                            <CardTitle className="text-3xl font-bold px-2">Invoice Details</CardTitle>
                            <Badge variant="outline">
                                Draft
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Invoice Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Invoice Number
                                </label>
                                <p className="text-lg font-semibold">{invoice?.invoice.invoicenumber}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Invoice Date
                                </label>
                                <p className="text-lg">{invoice?.invoice.invoicedate.split('T')[0]}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                    Due Date
                                </label>
                                <p className="text-lg">{invoice?.invoice.duedate.split('T')[0]}</p>
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-3">Client Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Client Name
                                    </label>
                                    <p className="text-lg">{invoice?.customer.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                        Client Email
                                    </label>
                                    <p className="text-lg">{invoice?.customer.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-3">Line Items</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Item</th>
                                            <th className="text-center p-3 font-medium">Quantity</th>
                                            <th className="text-right p-3 font-medium">Unit Price</th>
                                            <th className="text-right p-3 font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(invoice?.order.orderlines ?? []).map((item) => (
                                            <tr key={item.orderlinenumber} className="border-t">
                                                <td className="p-3">{item.productline}</td>
                                                <td className="text-center p-3">{item.quantityordered}</td>
                                                <td className="text-right p-3">${(item.priceeach ?? 0).toFixed(2)}</td>
                                                <td className="text-right p-3 font-semibold">
                                                    ${(item.sales ?? 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-muted">
                                        <tr>
                                            <td colSpan={3} className="text-right p-3 font-semibold">
                                                Total Amount:
                                            </td>
                                            <td className="text-right p-3 text-xl font-bold text-primary">
                                                ${(invoice?.invoice.totalamount ?? 0).toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ViewInvoice;