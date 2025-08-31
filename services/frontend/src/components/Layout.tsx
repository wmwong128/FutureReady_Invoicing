import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Users,
  Menu,
  X,
  DollarSign,
  Mail,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth0();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'invoices', name: 'Invoices', icon: FileText },
    { id: 'clients', name: 'Clients', icon: Users },
    { id: 'email', name: 'Mail', icon: Mail },
    // { id: "settings", name: "Settings", icon: Settings },
  ];

  return (
    isAuthenticated && (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
                  <DollarSign className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-foreground">
                    Finance Copilot
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    AI Operations Assistant
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2 p-4">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start h-10',
                      activeTab === item.id &&
                        'bg-primary text-primary-foreground shadow-md'
                    )}
                    onClick={() => {
                      if (location.pathname !== '/') {
                        navigate('/');
                      }
                      onTabChange(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="flex flex-col space-y-2 p-4 border-t border-border">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <Avatar>
                    <AvatarImage
                      src={user!.picture ?? ''}
                      alt={user!.name ?? 'temp'}
                    ></AvatarImage>
                    <AvatarFallback>404</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user!.name ?? ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user!.email ?? ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top bar - UPDATED SECTION */}
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border w-full">
            <div className="flex items-center h-10 w-full">
              {/* Hamburger menu on the absolute left */}
              <div className="absolute left-0 pl-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>

              {/* Spacer to center the content if needed */}
              <div className="flex-1"></div>

              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout({
                      logoutParams: { returnTo: window.location.origin },
                    });
                  }}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="content-center">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
        </div>
      </div>
    )
  );
};
