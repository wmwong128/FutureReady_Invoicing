import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Edit, Save } from "lucide-react";
import { useState } from "react";

export const InvoiceUpload = () => {
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

  const handleFileUpload = () => {
    // Simulate OCR processing
    setTimeout(() => {
      setUploadStep('extracted');
    }, 2000);
  };

  const handleReview = () => {
    setUploadStep('review');
  };

  const handleSave = () => {
    // Simulate saving
    alert('Invoice saved successfully!');
    setUploadStep('upload');
  };

  if (uploadStep === 'upload') {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email forwarding</h1>
          <p className="text-muted-foreground">Forward emails for automated processing</p>
        </div>

        <div className="flex justify-center">
          {/* Email Forward */}
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Email Forwarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Forward invoices to:</p>
                <code className="text-sm bg-background p-2 rounded border">
                  invoices@financecopilot.ai
                </code>
              </div>
              <div className="space-y-2">
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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Number</Label>
                  <Input value={extractedData.invoiceNumber} readOnly />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input value={extractedData.currency} readOnly />
                </div>
                <div>
                  <Label>Issue Date</Label>
                  <Input value={extractedData.issueDate} readOnly />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input value={extractedData.dueDate} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Client Name</Label>
                <Input value={extractedData.clientName} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={extractedData.clientEmail} readOnly />
              </div>
            </CardContent>
          </Card>

          {/* Amount Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Amount Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subtotal</Label>
                  <Input value={`$${extractedData.amount}`} readOnly />
                </div>
                <div>
                  <Label>Tax</Label>
                  <Input value={`$${extractedData.tax}`} readOnly />
                </div>
              </div>
              <div className="pt-2 border-t">
                <Label>Total Amount</Label>
                <Input 
                  value={`$${(parseFloat(extractedData.amount.replace(',', '')) + parseFloat(extractedData.tax.replace(',', ''))).toLocaleString()}`} 
                  readOnly 
                  className="font-bold"
                />
              </div>
            </CardContent>
          </Card>

          {/* Confidence Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Extraction Confidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { field: "Invoice Number", confidence: 98 },
                { field: "Client Name", confidence: 95 },
                { field: "Amount", confidence: 92 },
                { field: "Due Date", confidence: 88 },
                { field: "Line Items", confidence: 85 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{item.field}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full" 
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{item.confidence}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {extractedData.lineItems.map((item, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 p-3 border rounded-lg">
                  <div className="col-span-2">
                    <Label className="text-xs">Description</Label>
                    <p className="text-sm">{item.description}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Qty × Rate</Label>
                    <p className="text-sm">{item.quantity} × ${item.rate}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Amount</Label>
                    <p className="text-sm font-medium">${item.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      
      {/* Editable form would go here - simplified for demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <span>Review Mode</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            In the full implementation, this would be an editable form allowing users to correct any extraction errors before saving the invoice to the database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};