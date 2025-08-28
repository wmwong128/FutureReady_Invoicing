import { ArrowLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate, useParams } from "react-router-dom"
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Separator } from "@radix-ui/react-separator";
import { Label } from "./ui/label";
import { useEffect, useState } from "react";
import { ClientCombobox } from "./ClientCombobox";
import { InvoiceLineItem, type LineItem } from "./InvoiceLineItem";
import type { NewInvoiceRequest, OrderLine } from "@/data/types/Invoice";
import { useCreateInvoice, useInvoice, useUpdateInvoice } from "@/hooks/useInvoice";
import type { Customer } from "@/data/types/Customer";
import { useAuth0 } from "@auth0/auth0-react";

export const InvoiceForm = () => {
    const { id } = useParams<{ id: string }>();
    const { invoiceDetails } = useInvoice(id);
    const { createInvoice } = useCreateInvoice();
    const { updateInvoice } = useUpdateInvoice(id);
    const { user } = useAuth0();
    const navigate = useNavigate();
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState("");
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { id: "1", name: "", quantity: 1, unitPrice: 0 }
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(false)

    // Calculate due date (90 days after invoice date)
    useEffect(() => {
        if (invoiceDate) {
            const invoiceDateObj = new Date(invoiceDate);
            const dueDateObj = new Date(invoiceDateObj);
            dueDateObj.setDate(dueDateObj.getDate() + 90);
            setDueDate(dueDateObj.toISOString().split('T')[0]);
        }
    }, [invoiceDate]);

    useEffect(() => {
        if(id && invoiceDetails) {
            setIsEdit(true);
            if (invoiceDetails.invoice.status !== "DRAFT") {
                navigate("/");
            } else {
                setSelectedClient(invoiceDetails.customer);
                setInvoiceNumber(invoiceDetails.invoice.invoicenumber);
                setInvoiceDate(invoiceDetails.invoice.invoicedate.split('T')[0]);
                const tempLineItems: LineItem[] = invoiceDetails.order.orderlines?.map((line: OrderLine, index: number) => ({
                        id: line.orderlinenumber?.toString() ?? (index + 1).toString(),
                        name: line.productline ?? "",
                        quantity: line.quantityordered ?? 0,
                        unitPrice: line.priceeach ?? 0,
                    })) ?? lineItems;
                setLineItems(tempLineItems)
            }
            
        }
    }, [id, invoiceDetails, navigate]);

    const addLineItem = () => {
        const newItem: LineItem = {
            id: (lineItems.length + 1).toString(),
            name: "",
            quantity: 1,
            unitPrice: 0
        };
        setLineItems([...lineItems, newItem]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length > 1) {
            setLineItems(
                lineItems.filter(item => item.id !== id)
                    .map((item, index) => ({
                        ...item,
                        id: (index + 1).toString(),
                    }))
            );
        }
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
        setLineItems(lineItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const calculateLineTotal = (item: LineItem) => {
        return item.quantity * item.unitPrice;
    };

    const calculateInvoiceTotal = () => {
        return lineItems.reduce((total, item) => total + calculateLineTotal(item), 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) {
            alert("Please select a client");
            return;
        }
        setIsLoading(true)
        if (!isEdit && !!user?.email) {
            const payload: NewInvoiceRequest = {
                client: selectedClient.name ?? "",
                invoicenumber: invoiceNumber,
                invoicedate: invoiceDate,
                duedate: dueDate,
                orderlines: lineItems.map((item) => ({
                    productline: item.name,
                    quantityordered: item.quantity,
                    priceeach: item.unitPrice,
                })),
                issueremail: user.email,
            }
            createInvoice.mutate(
                payload,
                {
                    onSuccess: () => {
                        setIsLoading(false);
                        alert(`Invoice created`);
                        navigate("/");
                    }
                }
            );
        } else {
            const payload = {
                invoicenumber: invoiceNumber,
                ordernumber: invoiceDetails.order.ordernumber,
                taxrate: invoiceDetails.invoice.taxrate,
                dealsize: invoiceDetails.order.dealsize,
                order: {
                    qtr_id: invoiceDetails.order.qtr_id,
                    month_id: invoiceDetails.order.month_id,
                    orderlines: lineItems.map((item, index) => ({
                        orderlinenumber: index + 1,
                        productline: item.name,
                        quantityordered: item.quantity,
                        priceeach: item.unitPrice,
                    }))
                }
            }
            console.log(payload)
            updateInvoice.mutate(
                payload,
                {
                    onSuccess: () => {
                        setIsLoading(false);
                        alert("Invoice updated");
                        navigate("/");
                    }
                }
            )
        }
    };

    return (
        <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background to-muted/30">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
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
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        { isEdit? "Edit Invoice" : "New Invoice"}
                    </h1>
                </div>
            </div>

            <Card>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Invoice Header */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="client" className="pb-1">Client</Label>
                                    <ClientCombobox
                                        selectedClient={selectedClient}
                                        onClientSelect={setSelectedClient}
                                        disabled={isEdit || isLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="invoice-number" className="pb-2">Invoice Number</Label>
                                    <Input
                                        id="invoice-number"
                                        value={invoiceNumber}
                                        onChange={(e) => setInvoiceNumber(e.target.value)}
                                        placeholder="INV-001"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="invoice-date" className="pb-2">Invoice Date</Label>
                                    <Input
                                        id="invoice-date"
                                        type="date"
                                        value={invoiceDate}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="due-date" className="pb-2">Due Date</Label>
                                    <Input
                                        id="due-date"
                                        type="date"
                                        value={dueDate}
                                        readOnly
                                        className="bg-muted cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Line Items */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">Items</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addLineItem}
                                    disabled={isLoading || isEdit}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {lineItems.map((item, index) => (
                                    <InvoiceLineItem
                                        key={item.id}
                                        item={item}
                                        onUpdate={updateLineItem}
                                        onRemove={removeLineItem}
                                        canRemove={lineItems.length > 1}
                                        lineTotal={calculateLineTotal(item)}
                                        disabled={isLoading}
                                    />
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Total */}
                        <div className="flex justify-end">
                            <div className="w-64">
                                <div className="flex justify-between items-center text-xl font-bold">
                                    <span>Total:</span>
                                    <span className="text-success">
                                        ${calculateInvoiceTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-4">
                            <Button type="submit" disabled={isLoading}>
                                {isEdit? "Save Changes" : "Create Invoice"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}