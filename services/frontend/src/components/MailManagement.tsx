import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEmail } from "@/hooks/useEmail";
import { cn } from "@/lib/utils";
import { Edit, FileText, Mail, Save, User, X } from "lucide-react";
import { useState } from "react";

export const MailManagement = () => {
  // replace with actual issuer email (can pass from props or context)
  const issuerEmail = "halo%40gmail.com"; 
  const { data: mailData = [] } = useEmail(issuerEmail);

    console.log("mailData:", mailData);


  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [editedNotes, setEditedNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getReminderStageBadge = (stage: string) => {
    const variants = {
      "First Reminder": "bg-success/10 text-success border-success/20",
      "Second Reminder": "bg-warning/10 text-warning border-warning/20",
      "Final Reminder": "bg-orange-500/10 text-orange-600 border-orange-500/20",
      "Due Inform": "bg-destructive/10 text-destructive border-destructive/20"
    };
    return (
      <Badge variant="outline" className={variants[stage as keyof typeof variants]}>
        {stage}
      </Badge>
    );
  };

  const handleSaveNotes = (emailhtml: string) => {
    // optionally call backend to persist notes
    setEditingNotes(null);
    setEditedNotes("");
  };

  const handleEditNotes = (emailhtml: string, currentNotes: string) => {
    setEditingNotes(emailhtml);
    setEditedNotes(currentNotes);
  };

  const totalPages = Math.ceil(mailData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = mailData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">
            Track automated follow-up reminder emails sent to customers
          </p>
        </div>
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
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Reminders</CardTitle>
            <User className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mailData.filter((m) => m.reminderStage === "First Reminder").length}
            </div>
            <p className="text-xs text-muted-foreground">60 days out</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Reminders</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mailData.filter((m) => m.reminderStage === "Final Reminder").length}
            </div>
            <p className="text-xs text-muted-foreground">3 days before due</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Inform</CardTitle>
            <FileText className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {mailData.filter((m) => m.reminderStage === "Due Inform").length}
            </div>
            <p className="text-xs text-muted-foreground">Overdue notices</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Follow-up Email History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email Sent</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Reminder Stage</TableHead>
                  <TableHead>Sent Date</TableHead>
                  <TableHead>Sent Time</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((mail) => (
                  <TableRow key={mail.emailhtml}>
                    <TableCell className="font-medium">{mail.emailhtml}</TableCell>
                    <TableCell>{mail.client}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-primary hover:underline"
                      >
                        {mail.invoicenumber}
                      </Button>
                    </TableCell>
                    <TableCell>{mail.reminderStage}</TableCell>
                    <TableCell>{mail.sentDate}</TableCell>
                    <TableCell>{mail.sentTime}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {editingNotes === mail.emailhtml ? (
                          <div className="flex items-center space-x-2 w-full">
                            <Input
                              value={editedNotes}
                              onChange={(e) => setEditedNotes(e.target.value)}
                              placeholder="Add notes..."
                              className="text-sm"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveNotes(mail.emailhtml)}
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
                              {mail.notes || "No notes"}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditNotes(mail.emailhtml, mail.notes)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
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
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={cn(
                        "cursor-pointer",
                        currentPage === 1 && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={cn(
                        "cursor-pointer",
                        currentPage === totalPages && "pointer-events-none opacity-50"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
