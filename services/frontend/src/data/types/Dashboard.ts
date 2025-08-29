export interface DashboardResponse {
    dashboard: {
        mrr: {
            monthlyrevenue: number;
            percentagerevenue: number;
        }
        arAging: number;
        dso: number;
        debt: 0;
        invoiceStatusList: {
            totaloverdue: number;
            totalunpaid: number;
            totalpaid: number;
        },
        revenueTrend: RevenueTrend[];
    };
    forecast: unknown;     // Temporary
}

interface RevenueTrend {
    month: string;
    actual: number;
}