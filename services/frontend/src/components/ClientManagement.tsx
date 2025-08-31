import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAllCustomer } from '@/hooks/useAllCustomer';
import {
  AlertTriangle,
  Building,
  DollarSign,
  Edit,
  Eye,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  TrendingUp,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { ClientForm } from './ClientForm';

export const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { customersData = [] } = useAllCustomer();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  console.log('customersData:', customersData);

  //const handleNewClient = () => {
  //  setEditingClient(null);
  //  setShowForm(true);
  //};

  //const handleEditClient = (client: any) => {
  //  setEditingClient(client);
  //  setShowForm(true);
  //};

  const handleBackToList = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const handleSaveClient = (clientData: any) => {
    // In a real app, this would save to the database
    console.log('Saving client:', clientData);
    setShowForm(false);
    setEditingClient(null);
    // You could show a toast notification here
  };

  if (showForm) {
    return (
      <ClientForm
        mode={editingClient ? 'edit' : 'new'}
        clientData={editingClient}
        onBack={handleBackToList}
        onSave={handleSaveClient}
      />
    );
  }

  const getRiskBadge = (risk?: string) => {
    if (risk === 'High Risk')
      return <Badge variant="destructive">High Risk</Badge>;
    if (risk === 'Medium Risk')
      return (
        <Badge
          variant="outline"
          className="bg-warning/10 text-warning border-warning/20"
        >
          Medium Risk
        </Badge>
      );
    return (
      <Badge
        variant="outline"
        className="bg-success/10 text-success border-success/20"
      >
        Low Risk
      </Badge>
    );
  };

  const filteredClients = useMemo(() => {
    return customersData.filter(
      (customersData) =>
        customersData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customersData.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customersData, searchTerm]);

  //  Stats
  const totalClients = customersData.length;
  const totalRevenue = customersData.reduce(
    (sum, c) => sum + (c.totalrevenue || 0),
    0
  );
  const avgPaymentDays =
    customersData.reduce((sum, c) => sum + (c.averageday || 0), 0) /
    (totalClients || 1);
  const highRisk = customersData.filter(
    (c) => c.dangerlevel === 'High Risk'
  ).length;

  return (
    <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start pb-2 text-left">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Client Management
          </h1>
          <p className="text-muted-foreground">
            Manage your client relationships and payment history
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* <Button variant="default" onClick={handleNewClient}>
                                <Plus className="mr-2 h-4 w-4" />
                                New Client
                            </Button> */}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 ">
        <Card>
          <CardContent className="space-y-1 text-left">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium text-muted-foreground">
                Total Clients
              </span>
              <Building className="h-4 w-4 ml-2" />
            </div>
            <div className="mt-2 text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Active relationships
            </p>
          </CardContent>
        </Card>

        {/* Avg Payment Days */}
        <Card>
          <CardContent className="space-y-1 text-left relative">
            <div className="absolute top-3 right-6 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Avg Payment Days
            </span>
            <div className="mt-2 text-2xl font-bold">
              {Math.round(avgPaymentDays)}
            </div>
            <p className="text-xs text-muted-foreground">-2 vs last quarter</p>
          </CardContent>
        </Card>

        {/* High Risk */}
        <Card>
          <CardContent className="space-y-1 text-left relative">
            <div className="absolute top-3 right-6 text-warning">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              High Risk
            </span>
            <div className="mt-2 text-2xl font-bold">{highRisk}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card>
          <CardContent className="space-y-1 text-left relative">
            <div className="absolute top-3 right-6">
              <DollarSign className="h-4 w-4 text-revenue" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </span>
            <div className="mt-2 text-2xl font-bold">
              ${totalRevenue.toFixed(2).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Client Directory</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Outstanding</TableHead>
                <TableHead>Avg Days</TableHead>
                <TableHead>Risk Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((customersData) => (
                <TableRow key={customersData._id} className="hover:bg-muted/50">
                  <TableCell className="text-left">
                    <div>
                      <p className="font-medium">{customersData.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customersData.customerid}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{customersData.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{customersData.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <div>
                      <p className="font-medium">
                        $
                        {customersData.totalrevenue
                          ?.toFixed(2)
                          .toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customersData.totalinvoices} invoices
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <span
                      className={
                        customersData.totaloutstanding &&
                        customersData.totaloutstanding > 0
                          ? 'text-warning font-medium'
                          : 'text-muted-foreground'
                      }
                    >
                      $
                      {customersData.totaloutstanding
                        ?.toFixed(2)
                        .toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-left">
                    <span
                      className={
                        customersData.averageday &&
                        customersData.averageday > 30
                          ? 'text-warning'
                          : 'text-success'
                      }
                    >
                      {customersData.averageday} days
                    </span>
                  </TableCell>
                  <TableCell className="text-left">
                    {getRiskBadge(customersData.dangerlevel)}
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
                        <Mail className="h-4 w-4" />
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
};
