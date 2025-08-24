import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from '@/components/MetricCard';
import { RevenueChart } from '@/components/charts/RevenueChart'
import {
    DollarSign,
    Calendar,
    Clock,
    HandCoins,
} from 'lucide-react';
import { Badge } from "./ui/badge";

export const Dashboard = () => {
    // Mock data for the dashboard
    const metrics = {
        mrr: { value: 45680, change: 12.5, period: 'vs last month' },
        arAging: { value: 23450, change: -5.2, period: 'total outstanding' },
        dso: { value: 28, change: -3, period: 'days' },
        debt: { value: 14000, change: -2.1, period: 'total debt' },
    };
    const invoices_num = {
        paid: 10,
        unpaid: 11,
    }

    return (
        <div className="flex-1 space-y-6 p-6 bg-gradient-to-br from-background to-muted/30">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Dashboard
                    </h1>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Monthly Revenue"
                    value={`$${metrics.mrr.value.toLocaleString()}`}
                    change={metrics.mrr.change}
                    period={metrics.mrr.period}
                    icon={DollarSign}
                    trend="up"
                />
                <MetricCard
                    title="AR Outstanding"
                    value={`$${metrics.arAging.value.toLocaleString()}`}
                    change={metrics.arAging.change}
                    period={metrics.arAging.period}
                    icon={Clock}
                    trend="down"
                />
                <MetricCard
                    title="Days Sales Outstanding"
                    value={`${metrics.dso.value}`}
                    change={metrics.dso.change}
                    period={metrics.dso.period}
                    icon={Calendar}
                    trend="down"
                />
                <MetricCard
                    title="Debt"
                    value={`$${metrics.debt.value.toLocaleString()}`}
                    change={metrics.debt.change}
                    period={metrics.debt.period}
                    icon={HandCoins}
                    trend="down"
                />
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
                                {invoices_num.paid} invoice(s)
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Badge variant="destructive">Unpaid</Badge>
                            <div className="flex flex-col">
                                {invoices_num.unpaid} invoice(s)
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
};
