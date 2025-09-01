import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEmail } from '@/hooks/useEmail';
import { cn } from '@/lib/utils';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Calendar,
  DollarSign,
  Edit,
  FileText,
  Mail,
  Network,
  Save,
  User,
  X,
} from 'lucide-react';
import { useState } from 'react';

export const MailManagement = () => {
  const { user } = useAuth0()
  const { data, stats } = useEmail(user?.email);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [editedNotes, setEditedNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const itemsPerPage = 10;

  // // Debugging
  // useEffect(() => {
  //   console.log("MailManagement - Full data:", data);
  //   console.log("MailManagement - Stats:", stats);
  //   if (error) {
  //     console.error("MailManagement - Error:", error);
  //     setNetworkError(error);
  //   }
  // }, [data, stats, error]);

  const getReminderStageBadge = (stage: string) => {
    const variants = {
      'First Reminder': 'bg-success/10 text-success border-success/20',
      'Second Reminder': 'bg-warning/10 text-warning border-warning/20',
      'Final Reminder': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      'Due Inform': 'bg-destructive/10 text-destructive border-destructive/20',
    };
    return (
      <Badge
        variant="outline"
        className={variants[stage as keyof typeof variants]}
      >
        {stage}
      </Badge>
    );
  };

  const handleSaveNotes = (_id: string) => {
    // optionally call backend to persist notes
    setEditingNotes(null);
    setEditedNotes('');
  };

  const handleEditNotes = (id: string, currentNotes: string) => {
    setEditingNotes(id);
    setEditedNotes(currentNotes || '');
  };

  const toggleExpandRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100); // Assuming amount is in cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-start justify-start space-y-0 pb-2 text-left">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Email Management
          </h1>
          <p className="text-muted-foreground">
            Track automated follow-up reminder emails sent to customers
          </p>
        </div>
      </div>

      {/* Network Error Banner */}
      {networkError && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Network className="h-5 w-5 text-destructive mr-2" />
                <div>
                  <p className="font-medium text-destructive">Network Error</p>
                  <p className="text-sm text-destructive/80">{networkError}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNetworkError(null)}
                className="text-destructive border-destructive/50 hover:bg-destructive/10"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className=" text-left relative">
            <div className="text-2xl font-bold">{stats.totalEmail}</div>
            <p className="text-xs text-muted-foreground">All reminders sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">
              First Reminders
            </CardTitle>
            <User className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent className="text-left">
            <div className="text-2xl font-bold text-success">
              {stats.firstReminder}
            </div>
            <p className="text-xs text-muted-foreground">60 days out</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">
              Final Reminders
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="text-left">
            <div className="text-2xl font-bold text-orange-600">
              {stats.finalReminder}
            </div>
            <p className="text-xs text-muted-foreground">3 days before due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-sm font-medium">Due Inform</CardTitle>
            <FileText className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent className="text-left">
            <div className="text-2xl font-bold text-destructive">
              {stats.dueInform}
            </div>
            <p className="text-xs text-muted-foreground">Overdue notices</p>
          </CardContent>
        </Card>
      </div>

      {/* Show message if no data
      {data.length === 0 && !isLoading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32 space-y-2">
            <p className="text-muted-foreground">No email data found</p>
            <p className="text-sm text-muted-foreground">
              This could mean no emails have been sent yet or there's an issue with the API connection.
            </p>
            <Button onClick={testApiConnection} size="sm" variant="outline">
              <RefreshCw className="h-3 w-3 mr-1" />
              Test API Connection
            </Button>
          </CardContent>
        </Card>
      )} */}

      {/* Table */}
      {data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-left">Follow-up Email History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table className="text-left">
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice Details</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Reminder Stage</TableHead>
                    <TableHead>Sent Date/Time</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.map((mail) => (
                    <>
                      <TableRow
                        key={mail._id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleExpandRow(mail._id)}
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {mail.invoicenumber}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Order: {mail.ordernumber}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{mail.client}</TableCell>
                        <TableCell>
                          {mail.reminderstage
                            ? getReminderStageBadge(mail.reminderstage)
                            : 'No stage'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{mail.sentDate}</span>
                            <span className="text-sm text-muted-foreground">
                              {mail.sentTime}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              mail.risk === 'High' || mail.risk === 'HIGH'
                                ? 'bg-destructive/10 text-destructive border-destructive/20'
                                : mail.risk === 'Medium' ||
                                  mail.risk === 'MEDIUM'
                                ? 'bg-warning/10 text-warning border-warning/20'
                                : 'bg-success/10 text-success border-success/20'
                            }
                          >
                            {mail.risk} ({mail.riskscore})
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {mail.totalamount
                            ? formatCurrency(mail.totalamount)
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {editingNotes === mail._id ? (
                              <div className="flex items-center space-x-2 w-full">
                                <Input
                                  value={editedNotes}
                                  onChange={(e) =>
                                    setEditedNotes(e.target.value)
                                  }
                                  placeholder="Add notes..."
                                  className="text-sm"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSaveNotes(mail._id)}
                                >
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingNotes(null)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 w-full">
                                <span className="text-sm text-muted-foreground flex-1">
                                  {mail.notes || 'No notes'}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditNotes(mail._id, mail.notes || '');
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRow === mail._id && (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-muted/30">
                            <div className="grid grid-cols-2 gap-4 p-4">
                              <div>
                                <h4 className="font-medium mb-2 flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  Invoice Details
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Invoice Date:
                                    </span>
                                    <span>
                                      {mail.invoicedate
                                        ? formatDate(mail.invoicedate)
                                        : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Due Date:
                                    </span>
                                    <span>
                                      {mail.duedate
                                        ? formatDate(mail.duedate)
                                        : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Status:
                                    </span>
                                    <Badge
                                      variant={
                                        mail.status === 'PENDING'
                                          ? 'destructive'
                                          : 'default'
                                      }
                                    >
                                      {mail.status || 'N/A'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2 flex items-center">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Payment Details
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Subtotal:
                                    </span>
                                    <span>
                                      {mail.subtotal
                                        ? formatCurrency(mail.subtotal)
                                        : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Tax:
                                    </span>
                                    <span>
                                      {mail.taxamount
                                        ? formatCurrency(mail.taxamount)
                                        : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Total:
                                    </span>
                                    <span className="font-medium">
                                      {mail.totalamount
                                        ? formatCurrency(mail.totalamount)
                                        : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Payment Method:
                                    </span>
                                    <span>
                                      {mail.paymentmethod || 'Not specified'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="col-span-2">
                                <h4 className="font-medium mb-2 flex items-center">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Email Content
                                </h4>
                                <div className="bg-muted p-3 rounded-md text-sm">
                                  {mail.emailhtml ? (
                                    <div
                                      dangerouslySetInnerHTML={{
                                        __html: mail.emailhtml,
                                      }}
                                    />
                                  ) : (
                                    'No email content available'
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        className={cn(
                          'cursor-pointer',
                          currentPage === 1 && 'pointer-events-none opacity-50'
                        )}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        className={cn(
                          'cursor-pointer',
                          currentPage === totalPages &&
                            'pointer-events-none opacity-50'
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
