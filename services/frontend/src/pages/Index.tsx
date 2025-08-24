import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { InvoiceManagement } from "@/components/InvoiceManagement";
import { ClientManagement } from "@/components/ClientManagement";
import { Email } from "@/components/Email";

const Index = ({ overrideContent, forceTab }: {overrideContent?: React.ReactNode, forceTab?: string}) => {
  const [activeTab, setActiveTab] = useState(forceTab?? "dashboard");

  const renderContent = () => {
    if (overrideContent) return overrideContent
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "invoices":
        return <InvoiceManagement />;
      case "clients":
        return <ClientManagement />;
      case "email":
        return <Email />;
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