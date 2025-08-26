export interface DashboardResponse {
    mrr: Mrr,
    arAging: number,
    dso: number,
    debt: 0,
    invoiceStatusList: InvoiceStatusList,
    revenueTrend: RevenueTrend[],
}

interface Mrr {
    monthlyrevenue: number,
    percentagerevenue: number,
}

interface InvoiceStatusList {
    totaloverdue: number,
    totalunpaid: number,
    totalpaid: number,
}

interface RevenueTrend {
    month: string,
    actual: number,
}