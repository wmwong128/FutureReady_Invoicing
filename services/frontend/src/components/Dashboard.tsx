import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from '@/components/charts/RevenueChart'
import {
    DollarSign,
    Calendar,
    Clock,
    HandCoins,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { Badge } from "./ui/badge";
import { useDashboard } from "@/hooks/useDashboard";
import { cn } from "@/lib/utils";
import { AIChat } from "./AIChat";

export const Dashboard = () => {
    const { dashboardData } = useDashboard()

    return (
        <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background to-muted/30">
            {/* Header */}
            <div className="flex flex-col items-start justify-start space-y-0 pb-2 text-left">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">Monitor your business financial health</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-all duration-200 gap-2 justify-between">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-left">
                            Monthly Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-start">
                        <div className="text-2xl font-bold text-foreground items">
                            ${dashboardData?.dashboard?.mrr?.monthlyrevenue?.toLocaleString() ?? 0}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <div className={cn(
                                "flex items-center space-x-1", 
                                (dashboardData?.dashboard?.mrr?.percentagerevenue ?? 0) >= 0 ? "text-success" : "text-destructive"
                            )}>
                                {(dashboardData?.dashboard?.mrr?.percentagerevenue ?? 0) >= 0 ? 
                                    (<TrendingUp className="h-3 w-3" />) : (<TrendingDown className="h-3 w-3" />)
                                }
                                <span>{Math.abs(dashboardData?.dashboard?.mrr?.percentagerevenue)}%</span>
                            </div>
                            <span>vs lasth month</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-200 gap-2 justify-between">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-left">
                            AR Outstanding
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-start">
                        <div className="text-2xl font-bold text-foreground items">
                            ${dashboardData?.dashboard?.arAging?.toLocaleString() ?? 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-200 gap-2 justify-between">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-left">
                            Days Sales Outstanding
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-start">
                        <div className="text-2xl font-bold text-foreground items">
                            {dashboardData?.dashboard?.dso}
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-all duration-200 gap-2 justify-between">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground text-left">
                            Debt
                        </CardTitle>
                        <HandCoins className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-start">
                        <div className="text-2xl font-bold text-foreground items">
                            ${dashboardData?.dashboard?.debt?.toLocaleString() ?? 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-col justify-start space-y-0 pb-2 text-left">
                        <CardTitle className="text-2xl">Revenue Trend & Forecast</CardTitle>
                        <CardDescription>
                            Monthly revenue with 90-day forecast and confidence intervals
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RevenueChart />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-col justify-start space-y-0 pb-1">
                        <CardTitle className="text-2xl">Invoices</CardTitle>
                        <CardDescription>
                            Number of paid and unpaid invoices
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start space-x-2">
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">Paid</Badge>
                            <div className="flex flex-col">
                                {dashboardData?.dashboard?.invoiceStatusList?.totalpaid} invoice(s)
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Unpaid</Badge>
                            <div className="flex flex-col">
                                {dashboardData?.dashboard?.invoiceStatusList?.totalunpaid} invoice(s)
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Badge variant="destructive">Overdue</Badge>
                            <div className="flex flex-col">
                                {dashboardData?.dashboard?.invoiceStatusList?.totaloverdue} invoice(s)
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <AIChat></AIChat>
        </div>
    );
};
