import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { InvoiceManagement } from "@/components/InvoiceManagement";
import { ClientManagement } from "@/components/ClientManagement";
import { InvoiceUpload } from "@/components/Email";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "invoices":
        return <InvoiceManagement />;
      case "clients":
        return <ClientManagement />;
      case "upload":
        return <InvoiceUpload />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default Index;