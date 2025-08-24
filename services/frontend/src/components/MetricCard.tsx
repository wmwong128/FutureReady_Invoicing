import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string;
    change: number;
    period: string;
    icon: LucideIcon;
    trend: "up" | "down";
}

export const MetricCard = ({ title, value, change, period, icon: Icon, trend }: MetricCardProps) => {
    const isPositive = change > 0;
    const trendIcon = trend === "up" ? TrendingUp : TrendingDown;
    const TrendIcon = trendIcon;

    return (
        <Card className="hover:shadow-md transition-all duration-200 gap-2 justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground text-left">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-start">
                <div className="text-2xl font-bold text-foreground items">{value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <div className={cn(
                        "flex items-center space-x-1",
                        isPositive && trend === "up" ? "text-success" :
                            !isPositive && trend === "down" ? "text-success" : "text-destructive"
                    )}>
                        <TrendIcon className="h-3 w-3" />
                        <span>{Math.abs(change)}%</span>
                    </div>
                    <span>{period}</span>
                </div>
            </CardContent>
        </Card>
    );
};