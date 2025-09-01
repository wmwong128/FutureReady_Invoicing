import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Edit,
  Eye,
  Plus,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/lib/utils';
import {
  useDeleteInvoice,
  useInvoiceManagement,
  useInvoiceStripeView,
  useSendInvoice,
} from '@/hooks/useInvoice';
import { useQueryClient } from '@tanstack/react-query';

export const InvoiceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermDraft, setSearchTermDraft] = useState('');
  const [sendInvoiceId, setSendInvoiceId] = useState<string>('');
  const [sendClientEmail, setSendClientEmail] = useState<string>('');
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string>('');
  const navigate = useNavigate();

  const { stats, invoices, draftInvoices } = useInvoiceManagement();
  const { viewInvoicePDF } = useInvoiceStripeView();
  const { sendInvoice } = useSendInvoice(sendInvoiceId, sendClientEmail);
  const { deleteInvoice } = useDeleteInvoice(deleteInvoiceId);
  const queryClient = useQueryClient();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/20"
          >
            Paid
          </Badge>
        );
      case 'OVERDUE':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'PENDING':
        return (
          <Badge
            variant="outline"
            className="bg-warning/10 text-warning border-warning/20"
          >
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getRiskBadge = (score: number, riskstatus: string) => {
    switch (riskstatus) {
      case 'NORMAL':
        return (
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/20"
          >
            Normal ({score})
          </Badge>
        );
      case 'HIGH':
        return <Badge variant="destructive">High ({score})</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredInvoices =
    invoices?.filter(
      (invoice) =>
        (invoice.client ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (invoice.invoicenumber ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    ) ?? [];
  const filteredDraftInvoices =
    draftInvoices?.filter(
      (invoice) =>
        (invoice.client ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (invoice.invoicenumber ?? '')
          .toLowerCase()
          .includes(searchTermDraft.toLowerCase())
    ) ?? [];

  function handleInvoiceSend(id: string, clientemail: string) {
    setSendInvoiceId(id);
    setSendClientEmail(clientemail)
    sendInvoice.mutate(
      {},
      {
        onSuccess: () => {
          alert(`Invoice sent`);
          setSendInvoiceId('');
          queryClient.invalidateQueries({ queryKey: ['invoiceManagement'] });
        },
      }
    );
  }

  function handleInvoiceDelete(id: string) {
    setDeleteInvoiceId(id);
    deleteInvoice.mutate(
      {},
      {
        onSuccess: () => {
          alert(`Invoice deleted`);
          setDeleteInvoiceId('');
          queryClient.invalidateQueries({ queryKey: ['invoiceManagement'] });
        },
      }
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start pb-2 text-left">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Invoice Management
          </h1>
          <p className="text-muted-foreground">Track your clients' invoice</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button> */}
          <Button variant="default" onClick={() => navigate('/new-invoice')}>
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
              <span className="text-sm font-medium text-muted-foreground">
                Total Outstanding
              </span>
            </div>
            <div className="text-2xl font-bold">
              ${stats?.totalOutstanding?.toFixed(2).toLocaleString() ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {stats?.countOutstanding} invoice(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-6 text-left">
            <div className="flex items-center space-x-2 pb-2">
              <div className="w-3 h-3 bg-destructive rounded-full" />
              <span className="text-sm font-medium text-muted-foreground">
                Overdue
              </span>
            </div>
            <div className="text-2xl font-bold">
              ${stats?.totalOverdue?.toFixed(2).toLocaleString() ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.countOverdue} invoice(s)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-6 text-left">
            <div className="flex items-center space-x-2 pb-2">
              <div className="w-3 h-3 bg-success rounded-full" />
              <span className="text-sm font-medium text-muted-foreground">
                This Month
              </span>
            </div>
            <div className="text-2xl font-bold">
              ${stats?.thisMonthPaid?.toFixed(2).toLocaleString() ?? 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-6 text-left">
            <div className="flex items-center space-x-2 pb-2">
              <div className="w-3 h-3 bg-warning rounded-full" />
              <span className="text-sm font-medium text-muted-foreground">
                Avg DSO
              </span>
            </div>
            <div className="text-2xl font-bold">{stats?.averageDSO} days</div>
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
              {/* <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button> */}
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice._id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-left">
                    {invoice.invoicenumber}
                  </TableCell>
                  <TableCell className="text-left">{invoice.client}</TableCell>
                  <TableCell className="font-medium text-left">
                    ${invoice.totalamount?.toFixed(2).toLocaleString() ?? 0}
                  </TableCell>
                  <TableCell className="text-left">
                    {getStatusBadge(invoice.status)}
                  </TableCell>
                  <TableCell className="text-left">
                    {formatDate(invoice.duedate)}
                  </TableCell>
                  <TableCell className="text-left">
                    {getRiskBadge(invoice.riskscore ?? 0, invoice.risk ?? '')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => viewInvoicePDF(invoice._id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Drafts</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoice drafts..."
                  value={searchTermDraft}
                  onChange={(e) => setSearchTermDraft(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              {/* <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button> */}
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
                <TableHead>Due Date</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDraftInvoices.map((invoice) => {
                const isDisable = deleteInvoiceId === invoice._id;
                return (
                  <TableRow key={invoice._id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-left">
                      {invoice.invoicenumber}
                    </TableCell>
                    <TableCell className="text-left">
                      {invoice.client}
                    </TableCell>
                    <TableCell className="font-medium text-left">
                      ${invoice.totalamount?.toFixed(2).toLocaleString() ?? 0}
                    </TableCell>
                    <TableCell className="text-left">
                      {formatDate(invoice.duedate)}
                    </TableCell>
                    <TableCell className="text-left">
                      {getRiskBadge(invoice.riskscore ?? 0, invoice.risk ?? '')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isDisable}
                          onClick={() =>
                            navigate(`/invoice/${invoice._id}/view`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isDisable}
                          onClick={() =>
                            navigate(`/invoice/${invoice._id}/edit`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isDisable}
                          onClick={() => handleInvoiceDelete(invoice._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isDisable}
                          onClick={() => handleInvoiceSend(invoice._id)}
                        ></Button> */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isDisable}
                          onClick={() => handleInvoiceDelete(invoice._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isDisable}
                          onClick={() => handleInvoiceSend(invoice._id, invoice.clientemail ?? "")}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
