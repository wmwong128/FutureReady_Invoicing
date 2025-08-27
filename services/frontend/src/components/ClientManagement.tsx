import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  MoreHorizontal, 
  Search, 
  Eye, 
  Edit, 
  Mail,
  Phone,
  Building,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useCustomer } from "@/hooks/useCustomer";


export const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { customersData = [], isLoading } = useCustomer();

  const getRiskBadge = (risk?: string) => {
    if (risk === "High Risk")
      return <Badge variant="destructive">High Risk</Badge>;
    if (risk === "Medium Risk")
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

  // ✅ Stats
  const totalClients = customersData.length;
  const totalRevenue = customersData.reduce(
    (sum, c) => sum + (c.totalrevenue || 0),
    0
  );
  const avgPaymentDays =
    customersData.reduce((sum, c) => sum + (c.averageday || 0), 0) /
    (totalClients || 1);
  const highRisk = customersData.filter(
    (c) => c.dangerlevel === "High Risk"
  ).length;

  if (isLoading) return <p className="p-6">Loading...</p>;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col items-start">
        <h1 className="text-3xl font-bold tracking-tight">
          Client Management
        </h1>
        <p className="text-muted-foreground">
          Manage your client relationships and payment history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Total Clients
              </span>
            </div>
            <div className="text-2xl font-bold">{totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Active relationships
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Avg Payment Days
              </span>
            </div>
            <div className="text-2xl font-bold">
              {Math.round(avgPaymentDays)}
            </div>
            <p className="text-xs text-muted-foreground">
              -2 vs last quarter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-sm font-medium text-muted-foreground">
                High Risk
              </span>
            </div>
            <div className="text-2xl font-bold">{highRisk}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-revenue rounded-full" />
              <span className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </span>
            </div>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((customersData) => (
                <TableRow
                  key={customersData._id}
                  className="hover:bg-muted/50"
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{customersData.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {customersData.customerid}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
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
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        ${customersData.totalrevenue?.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customersData.totalinvoices} invoices
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        customersData.totaloutstanding && customersData.totaloutstanding > 0
                          ? "text-warning font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      ${customersData.totaloutstanding?.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        customersData.averageday && customersData.averageday > 30
                          ? "text-warning"
                          : "text-success"
                      }
                    >
                      {customersData.averageday} days
                    </span>
                  </TableCell>
                  <TableCell>{getRiskBadge(customersData.dangerlevel)}</TableCell>
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


//  export const ClientManagement = () => {

//   const [searchTerm, setSearchTerm] = useState("");

//   const clients = [
//     {
//       id: "CLI-001",
//       name: "TechCorp Solutions",
//       email: "billing@techcorp.com",
//       phone: "+1 (555) 123-4567",
//       totalInvoices: 8,
//       totalAmount: 45600,
//       outstanding: 12500,
//       riskScore: 87,
//       lastPayment: "2023-12-15",
//       avgPaymentDays: 35
//     },
//     {
//       id: "CLI-002", 
//       name: "Global Industries",
//       email: "finance@globalinc.com",
//       phone: "+1 (555) 234-5678",
//       totalInvoices: 12,
//       totalAmount: 78900,
//       outstanding: 8750,
//       riskScore: 42,
//       lastPayment: "2024-01-20",
//       avgPaymentDays: 25
//     },
//     {
//       id: "CLI-003",
//       name: "StartupXYZ",
//       email: "admin@startupxyz.com",
//       phone: "+1 (555) 345-6789",
//       totalInvoices: 4,
//       totalAmount: 18200,
//       outstanding: 0,
//       riskScore: 23,
//       lastPayment: "2024-01-25",
//       avgPaymentDays: 18
//     },
//     {
//       id: "CLI-004",
//       name: "Enterprise Ltd",
//       email: "ap@enterprise.com",
//       phone: "+1 (555) 456-7890",
//       totalInvoices: 15,
//       totalAmount: 89400,
//       outstanding: 15600,
//       riskScore: 35,
//       lastPayment: "2024-01-10",
//       avgPaymentDays: 28
//     },
//     {
//       id: "CLI-005",
//       name: "Innovation Corp",
//       email: "billing@innovationcorp.com",
//       phone: "+1 (555) 567-8901",
//       totalInvoices: 6,
//       totalAmount: 32100,
//       outstanding: 9800,
//       riskScore: 28,
//       lastPayment: "2024-01-18",
//       avgPaymentDays: 22
//     }
//   ];

//   const getRiskBadge = (score: number) => {
//     if (score >= 70) return <Badge variant="destructive">High Risk</Badge>;
//     if (score >= 40) return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Medium Risk</Badge>;
//     return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Low Risk</Badge>;
//   };

//   const filteredClients = clients.filter(client =>
//     client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     client.email.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="space-y-6 p-6">
//       {/* Header */}
//       <div className="flex flex-col items-start">
//           <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
//           <p className="text-muted-foreground">Manage your client relationships and payment history</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-2">
//               <Building className="h-4 w-4 text-muted-foreground" />
//               <span className="text-sm font-medium text-muted-foreground">Total Clients</span>
//             </div>
//             <div className="text-2xl font-bold">{clients.length}</div>
//             <p className="text-xs text-muted-foreground">Active relationships</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-2">
//               <TrendingUp className="h-4 w-4 text-muted-foreground" />
//               <span className="text-sm font-medium text-muted-foreground">Avg Payment Days</span>
//             </div>
//             <div className="text-2xl font-bold">26</div>
//             <p className="text-xs text-muted-foreground">-2 vs last quarter</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-2">
//               <AlertTriangle className="h-4 w-4 text-warning" />
//               <span className="text-sm font-medium text-muted-foreground">High Risk</span>
//             </div>
//             <div className="text-2xl font-bold">1</div>
//             <p className="text-xs text-muted-foreground">Requires attention</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center space-x-2">
//               <div className="w-3 h-3 bg-revenue rounded-full" />
//               <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
//             </div>
//             <div className="text-2xl font-bold">$264K</div>
//             <p className="text-xs text-muted-foreground">All time</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Clients Table */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <CardTitle>Client Directory</CardTitle>
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search clients..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-9 w-64"
//               />
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Client</TableHead>
//                 <TableHead>Contact</TableHead>
//                 <TableHead>Total Revenue</TableHead>
//                 <TableHead>Outstanding</TableHead>
//                 <TableHead>Avg Days</TableHead>
//                 <TableHead>Risk Level</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredClients.map((client) => (
//                 <TableRow key={client.id} className="hover:bg-muted/50">
//                   <TableCell>
//                     <div>
//                       <p className="font-medium">{client.name}</p>
//                       <p className="text-xs text-muted-foreground">{client.id}</p>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="space-y-1">
//                       <div className="flex items-center space-x-1">
//                         <Mail className="h-3 w-3 text-muted-foreground" />
//                         <span className="text-xs">{client.email}</span>
//                       </div>
//                       <div className="flex items-center space-x-1">
//                         <Phone className="h-3 w-3 text-muted-foreground" />
//                         <span className="text-xs">{client.phone}</span>
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div>
//                       <p className="font-medium">${client.totalAmount.toLocaleString()}</p>
//                       <p className="text-xs text-muted-foreground">{client.totalInvoices} invoices</p>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <span className={client.outstanding > 0 ? "text-warning font-medium" : "text-muted-foreground"}>
//                       ${client.outstanding.toLocaleString()}
//                     </span>
//                   </TableCell>
//                   <TableCell>
//                     <span className={client.avgPaymentDays > 30 ? "text-warning" : "text-success"}>
//                       {client.avgPaymentDays} days
//                     </span>
//                   </TableCell>
//                   <TableCell>
//                     {getRiskBadge(client.riskScore)}
//                   </TableCell>
//                   <TableCell className="text-right">
//                     <div className="flex items-center justify-end space-x-1">
//                       <Button variant="ghost" size="icon" className="h-8 w-8">
//                         <Eye className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon" className="h-8 w-8">
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon" className="h-8 w-8">
//                         <Mail className="h-4 w-4" />
//                       </Button>
//                       <Button variant="ghost" size="icon" className="h-8 w-8">
//                         <MoreHorizontal className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }; 