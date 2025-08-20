import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Download, Edit, Eye, Filter, MoreHorizontal, Plus, Search, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

export const InvoiceManagement = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    const handleNewInvoice = () => {
        navigate("/new-invoice");
    }

    // Mockup Data
    const stats = {
        total_outstanding: 51850,
        active_invoice: 4,
        total_overdue_amount: 12500,
        overdue_invoice: 1,
        m_paid_invoice_amount: 5200,
        m_paid_invoice: 1,
    }
    const invoices = [
        {
            id: "INV-001",
            client: "TechCorp Solutions",
            amount: 12500,
            status: "overdue",
            dueDate: "2024-01-15",
            issueDate: "2023-12-15",
            daysOverdue: 12,
            riskScore: 87
        },
        {
            id: "INV-002",
            client: "Global Industries",
            amount: 8750,
            status: "pending",
            dueDate: "2024-02-01",
            issueDate: "2024-01-01",
            daysOverdue: 0,
            riskScore: 42
        },
        {
            id: "INV-003",
            client: "StartupXYZ",
            amount: 5200,
            status: "paid",
            dueDate: "2024-01-20",
            issueDate: "2023-12-20",
            daysOverdue: 0,
            riskScore: 23
        },
        {
            id: "INV-004",
            client: "Enterprise Ltd",
            amount: 15600,
            status: "sent",
            dueDate: "2024-02-15",
            issueDate: "2024-01-15",
            daysOverdue: 0,
            riskScore: 35
        },
        {
            id: "INV-005",
            client: "Innovation Corp",
            amount: 9800,
            status: "draft",
            dueDate: "2024-02-20",
            issueDate: "2024-01-20",
            daysOverdue: 0,
            riskScore: 28
        }
    ];

    const getStatusBadge = (status: string, daysOverdue: number) => {
        switch (status) {
            case "paid":
                return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Paid</Badge>;
            case "overdue":
                return <Badge variant="destructive">Overdue ({daysOverdue}d)</Badge>;
            case "pending":
                return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
            case "sent":
                return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Sent</Badge>;
            default:
                return <Badge variant="outline">Draft</Badge>;
        }
    };

    const getRiskBadge = (score: number) => {
        if (score >= 70) return <Badge variant="destructive">High</Badge>;
        if (score >= 40) return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Med</Badge>;
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Low</Badge>;
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background to-muted/30">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Invoice Management</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button variant="default" onClick={handleNewInvoice}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Invoice
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="px-6 text-left">
                        <div className="flex items-center space-x-2 pb-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Total Outstanding</span>
                        </div>
                        <div className="text-2xl font-bold">${stats.total_outstanding.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Across {stats.active_invoice} invoice(s)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="px-6 text-left">
                        <div className="flex items-center space-x-2 pb-2">
                            <div className="w-3 h-3 bg-destructive rounded-full" />
                            <span className="text-sm font-medium text-muted-foreground">Overdue</span>
                        </div>
                        <div className="text-2xl font-bold">${stats.total_overdue_amount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{stats.overdue_invoice} invoice(s)</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="px-6 text-left">
                        <div className="flex items-center space-x-2 pb-2">
                            <div className="w-3 h-3 bg-success rounded-full" />
                            <span className="text-sm font-medium text-muted-foreground">This Month</span>
                        </div>
                        <div className="text-2xl font-bold">${stats.m_paid_invoice_amount.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{stats.m_paid_invoice} invoice(s) paid</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="px-6 text-left">
                        <div className="flex items-center space-x-2 pb-2">
                            <div className="w-3 h-3 bg-warning rounded-full" />
                            <span className="text-sm font-medium text-muted-foreground">Avg DSO</span>
                        </div>
                        <div className="text-2xl font-bold">28 days</div>
                        <p className="text-xs text-muted-foreground">-3 vs last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Invoices</CardTitle>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search invoices..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 w-64"
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Risk Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredInvoices.map((invoice) => (
                                <TableRow key={invoice.id} className="hover:bg-muted/50">
                                    <TableCell className="font-medium">{invoice.id}</TableCell>
                                    <TableCell>{invoice.client}</TableCell>
                                    <TableCell className="font-medium">
                                        ${invoice.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(invoice.status, invoice.daysOverdue)}
                                    </TableCell>
                                    <TableCell>
                                        <div className={invoice.status === "overdue" ? "text-destructive" : ""}>
                                            {invoice.dueDate}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getRiskBadge(invoice.riskScore)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Send className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}