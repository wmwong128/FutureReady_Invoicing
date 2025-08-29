import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Edit, FileText, Filter, Mail, Save, Search, User, X } from "lucide-react";
import { useState, useEffect } from "react";
import useEmail from "@/hooks/useEmail";

interface MailData {
  emailHtml: string;
  clientName: string;
  invoiceId: string;
  reminderStage: "First Reminder" | "Second Reminder" | "Final Reminder" | "Due Inform";
  sentDate: string;
  sentTime: string;
  notes: string;
}

export const MailManagement = () => {
  const { emailsData, isLoading, error } = useEmail();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof MailData>("sentDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [editedNotes, setEditedNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  //const [mailData, setMailData] = useState(mockMailData);
  const itemsPerPage = 10;

  // Debug log (to check data being retrieved)
  console.log("emailsData:", emailsData);

// Use emailsData instead of mock
  const [mailData, setMailData] = useState<MailData[]>([]);
  useEffect(() => {
    if (emailsData) {
      setMailData(emailsData);
    }
  }, [emailsData]);

  if (isLoading) return <p>Loading emails...</p>;
  if (error) return <p>Error fetching emails: {String(error)}</p>;




  const getReminderStageBadge = (stage: string) => {
    const variants = {
      "First Reminder": "bg-success/10 text-success border-success/20",
      "Second Reminder": "bg-warning/10 text-warning border-warning/20",
      "Final Reminder": "bg-orange-500/10 text-orange-600 border-orange-500/20",
      "Due Inform": "bg-destructive/10 text-destructive border-destructive/20"
    };
    return <Badge variant="outline" className={variants[stage as keyof typeof variants]}>
        {stage}
      </Badge>;
  };
  const handleSort = (field: keyof MailData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const handleSaveNotes = (emailHtml: string) => {
    setMailData(prev => prev.map(mail => mail.emailHtml === emailHtml ? {
      ...mail,
      notes: editedNotes
    } : mail));
    setEditingNotes(null);
    setEditedNotes("");
  };
  const handleEditNotes = (emailHtml: string, currentNotes: string) => {
    setEditingNotes(emailHtml);
    setEditedNotes(currentNotes);
  };
  const filteredData = mailData.filter(mail => 
    mail.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    mail.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    mail.emailHtml.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);
  const SortIcon = ({
    field
  }: {
    field: keyof MailData;
  }) => {
    if (sortField !== field) return <ChevronUp className="h-4 w-4 opacity-30" />;
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  


  
  return <div className="space-y-6 p-6">
      <div className="flex flex-col items-start">
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">Track automated follow-up reminder emails sent to customers</p>
      </div>






      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mailData.length}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Reminders</CardTitle>
            <User className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mailData.filter(m => m.reminderStage === "First Reminder").length}
            </div>
            <p className="text-xs text-muted-foreground">
              60 days out
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Reminders</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mailData.filter(m => m.reminderStage === "Final Reminder").length}
            </div>
            <p className="text-xs text-muted-foreground">
              3 days before due
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Inform</CardTitle>
            <FileText className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {mailData.filter(m => m.reminderStage === "Due Inform").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Overdue notices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Follow-up Email History</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by client, invoice ID, or email ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 min-w-[300px]" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("emailHtml")}>
                    <div className="flex items-center space-x-1">
                      <span>Email Sent</span>
                      <SortIcon field="emailHtml" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("clientName")}>
                    <div className="flex items-center space-x-1">
                      <span>Client</span>
                      <SortIcon field="clientName" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("invoiceId")}>
                    <div className="flex items-center space-x-1">
                      <span>Invoice ID</span>
                      <SortIcon field="invoiceId" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("reminderStage")}>
                    <div className="flex items-center space-x-1">
                      <span>Reminder Stage</span>
                      <SortIcon field="reminderStage" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("sentDate")}>
                    <div className="flex items-center space-x-1">
                      <span>Sent Date</span>
                      <SortIcon field="sentDate" />
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("sentTime")}>
                    <div className="flex items-center space-x-1">
                      <span>Sent Time</span>
                      <SortIcon field="sentTime" />
                    </div>
                  </TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map(mail => <TableRow key={mail.emailHtml}>
                    <TableCell className="font-medium">{mail.emailHtml}</TableCell>
                    <TableCell>{mail.clientName}</TableCell>
                    <TableCell>
                      <Button variant="link" className="p-0 h-auto font-medium text-primary hover:underline">
                        {mail.invoiceId}
                      </Button>
                    </TableCell>
                    <TableCell>{getReminderStageBadge(mail.reminderStage)}</TableCell>
                    <TableCell>{mail.sentDate}</TableCell>
                    <TableCell>{mail.sentTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {editingNotes === mail.emailHtml ? <div className="flex items-center space-x-2 w-full">
                            <Input value={editedNotes} onChange={e => setEditedNotes(e.target.value)} placeholder="Add notes..." className="text-sm" />
                            <Button size="sm" variant="outline" onClick={() => handleSaveNotes(mail.emailHtml)}>
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingNotes(null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div> : <div className="flex items-center space-x-2 w-full">
                            <span className="text-sm text-muted-foreground flex-1">
                              {mail.notes || "No notes"}
                            </span>
                            <Button size="sm" variant="ghost" onClick={() => handleEditNotes(mail.emailHtml, mail.notes)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>}
                      </div>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && <div className="flex items-center justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className={cn("cursor-pointer", currentPage === 1 && "pointer-events-none opacity-50")} />
                  </PaginationItem>
                  {Array.from({
                length: totalPages
              }, (_, i) => i + 1).map(page => <PaginationItem key={page}>
                      <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                        {page}
                      </PaginationLink>
                    </PaginationItem>)}
                  <PaginationItem>
                    <PaginationNext onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className={cn("cursor-pointer", currentPage === totalPages && "pointer-events-none opacity-50")} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>}
        </CardContent>
      </Card>
    </div>;
};