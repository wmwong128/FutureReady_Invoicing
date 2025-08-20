import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from '@/components/MetricCard';
import { RevenueChart } from '@/components/charts/RevenueChart'
import {
    DollarSign,
    Calendar,
    Clock,
    HandCoins,
    AlertTriangle,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const Dashboard = () => {
    // Mock data for the dashboard
    const metrics = {
        mrr: { value: 45680, change: 12.5, period: 'vs last month' },
        arAging: { value: 23450, change: -5.2, period: 'total outstanding' },
        dso: { value: 28, change: -3, period: 'days' },
        debt: { value: 14000, change: -2.1, period: 'total debt' },
    };
    const risk_levels = {
        high: [ "TechCorp", "HappyMart" ],
        medium: [ "Global Inc" ],
        low: [ "StartupXYZ" ],
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
                    <CardHeader className="flex flex-col justify-start space-y-0 pb-1 text-left">
                        <CardTitle className="text-2xl">AR Aging Analysis</CardTitle>
                        <CardDescription>
                            Outstanding invoices by age bucket
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* <ARAgingChart /> */}
                    </CardContent>
                </Card>

                <Card className="col-start-1 md:col-end-3 lg:col-end-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-base font-medium">Risk Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-start space-x-2">
                            <Badge variant="destructive">High</Badge>
                            <div className="flex flex-col">
                                {risk_levels.high.map((item, index) => (
                                    <span key={index} className="text-sm text-left">{item}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-start space-x-2">
                            <Badge variant="outline">Medium</Badge>
                            <div className="flex flex-col">
                                {risk_levels.medium.map((item, index) => (
                                    <span key={index} className="text-sm text-left">{item}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge variant="outline">Low</Badge>
                            <div className="flex flex-col">
                                {risk_levels.low.map((item, index) => (
                                    <span key={index} className="text-sm text-left">{item}</span>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
};
