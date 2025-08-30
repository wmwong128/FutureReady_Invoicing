export interface DashboardResponse extends DashboardData {
    dashboard: DashboardData;
    forecast: {
        dates?: string[];
        forecast?: number[];
    }
}

export interface DashboardData {
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
    revenuetrend: RevenueTrend[];
};

export interface RevenueTrend {
    month: string;
    actual?: number;
    forecast?: number;
}