import type { DashboardData, DashboardResponse, RevenueTrend } from "@/data/types/Dashboard";
import useMachine from "./useMachine";
import { useAuth0 } from "@auth0/auth0-react";
import useMachineMutation from "./useMachineMutation";

export function useDashboard() {
    const { user } = useAuth0()
    const query = useMachine({
        url: `${import.meta.env.VITE_BACKEND_MAIN_URL}/?issueremail=${user?.email}`,
    });
    const data = query.data as DashboardResponse;

    if (!data || !data.dashboard) {
        return { dashboardData: {} as DashboardData }
    }

    const lastMonthWithActual = data.dashboard.revenuetrend[data.dashboard.revenuetrend.length - 1].month

    const temp: RevenueTrend[] = [...data.dashboard.revenuetrend];
    const dates = data?.forecast?.dates ?? []
    const forecast = data?.forecast?.forecast ?? []
    dates.forEach((dateStr, index) => {
        const date = new Date(dateStr);
        const monthKey = date.toLocaleString("en-US", { month: "short" });
        const existingIndex = temp.findIndex((item) => item.month === monthKey);
        const forecastValue = forecast[index] ?? 0;

        if (existingIndex !== -1) {
            const updatedEntry = {
                ...temp[existingIndex],
                forecast: (temp[existingIndex].forecast ?? 0 + forecastValue),
            }
            temp[existingIndex] = updatedEntry;
        } else {
            temp.push({ month: monthKey, forecast: forecastValue });
        }
    });
    const revenueForecast = temp.map((item) => {
        if (item.actual && item.forecast) {
            item.forecast += item.actual
        }
        if (item.forecast) {
            item.forecast = parseFloat(item.forecast.toFixed(2))
        }
        return item
    })

    const dashboardData: DashboardData = data.dashboard

    return {
        dashboardData,
        revenueForecast,
        lastMonthWithActual,
    }
}

export function useChatBot() {
    const askChatBot = useMachineMutation({
        url: `${import.meta.env.VITE_AI_MAIN_URL}/chat`,
        method: "POST",
    })

    return { askChatBot };
}