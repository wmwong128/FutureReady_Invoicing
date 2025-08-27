import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Edit, Save } from "lucide-react";
import { useState } from "react";
import { useEmail } from "../hooks/useEmail";

export const Email = () => {
  // --- Hooks ---
  const emailMutation = useEmail(); // for sending emails
  const [uploadStep, setUploadStep] = useState<'upload' | 'extracted' | 'review'>('upload');

  const [extractedData, setExtractedData] = useState({
    invoiceNumber: "INV-2024-001",
    issueDate: "2024-01-27",
    dueDate: "2024-02-26",
    clientName: "TechCorp Solutions Inc.",
    clientEmail: "billing@techcorp.com",
    amount: "12,500.00",
    currency: "USD",
    tax: "1,250.00",
    lineItems: [
      { description: "Software Development Services", quantity: 40, rate: 125, amount: 5000 },
      { description: "UI/UX Design Services", quantity: 20, rate: 100, amount: 2000 },
      { description: "Project Management", quantity: 30, rate: 150, amount: 4500 },
      { description: "Quality Assurance Testing", quantity: 10, rate: 100, amount: 1000 }
    ]
  });

  // --- Handlers ---
  const handleSendEmail = () => {
    emailMutation.mutate({
      to: "johnDoe@gmail.com",
      subject: "Hello World",
      html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
    });
  };

  const handleFileUpload = () => setTimeout(() => setUploadStep('extracted'), 2000);
  const handleReview = () => setUploadStep('review');
  const handleSave = () => {
    alert('Invoice saved successfully!');
    setUploadStep('upload');
  };

  // --- RENDER ---
  if (uploadStep === 'upload') {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col items-start">
          <h1 className="text-3xl font-bold tracking-tight">Email Forwarding</h1>
          <p className="text-muted-foreground">Forward emails automatically</p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleSendEmail} disabled={emailMutation.isLoading}>
            {emailMutation.isLoading ? "Sending..." : "Send Test Email"}
          </Button>
          {emailMutation.isSuccess && <p className="text-success">Email sent successfully ✅</p>}
          {emailMutation.isError && <p className="text-destructive">Failed to send ❌</p>}
        </div>

        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Forward invoices to:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <code className="text-sm bg-background p-2 rounded border">
                  invoices@financecopilot.ai
                </code>
              </div>
              <div className="space-y-2 text-left">
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  Auto-processing enabled
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Emails are processed automatically and added to your invoice queue
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (uploadStep === 'extracted') {
    return (
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Review Extracted Data</h1>
            <p className="text-muted-foreground">Verify and correct the extracted invoice information</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              92% accuracy
            </Badge>
            <Button variant="outline" onClick={() => setUploadStep('upload')}>
              Back to Upload
            </Button>
            <Button variant="finance" onClick={handleReview}>
              <Edit className="mr-2 h-4 w-4" />
              Review & Edit
            </Button>
          </div>
        </div>

        {/* Invoice & Client Cards (simplified for brevity) */}
        {/* Keep your Cards for invoice details, client info, amount summary, confidence, line items */}
      </div>
    );
  }

  // Review step
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Invoice Data</h1>
          <p className="text-muted-foreground">Make corrections to the extracted information</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setUploadStep('extracted')}>
            Cancel
          </Button>
          <Button variant="finance" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Invoice
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <span>Review Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This would be an editable form allowing users to correct any extraction errors before saving the invoice.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
