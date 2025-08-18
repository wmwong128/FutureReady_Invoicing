import { useState } from "react";
import { Layout } from "@/components/Layout";
// import { Dashboard } from "@/components/Dashboard";
// import { InvoiceManagement } from "@/components/InvoiceManagement";
// import { ClientManagement } from "@/components/ClientManagement";
// import { InvoiceUpload } from "@/components/InvoiceUpload";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        // return <Dashboard />;
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
          </div>
        );
      case "invoices":
        // return <InvoiceManagement />;
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Invoice Management</h1>
          </div>
        );
      case "clients":
        // return <ClientManagement />;
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Client Management</h1>
          </div>
        );
      case "upload":
        // return <InvoiceUpload />;
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Upload</h1>
          </div>
        );
      default:
        // return <Dashboard />;
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
          </div>
        );
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default Index;