import type { Invoice, InvoiceDetailsResponse, InvoiceReponse, InvoiceStats, NewInvoiceRequest } from "@/data/types/Invoice";
import useMachine from "./useMachine";
import { useCallback } from "react";
// import useMachineMutation from "./useMachineMutation";
import type { UseM2MAuthOptions } from "./useM2MAuth";
import useM2MAuth from "./useM2MAuth";
export function useInvoiceManagement() {
    const query = useMachine({
        url: `${import.meta.env.VITE_BACKEND_MAIN_URL}/invoice`,
    });
    const data = query.data as InvoiceReponse;

    const stats: InvoiceStats = data;
    const invoices: Invoice[] = data?.invoices ?? [];
    const draftInvoices: Invoice[] = data?.draftInvoices ?? [];

    return {
        stats,
        invoices,
        draftInvoices,
    }
}

export function useInvoice(id?: string) {
    const query = useMachine({
        url: id ? `${import.meta.env.VITE_BACKEND_MAIN_URL}/invoice/${id}` : "",
        queryOptions: {
            queryKey: ["invoice", id],
            enabled: !!id,
        },
    });

    const invoiceDetails: InvoiceDetailsResponse = query.data as InvoiceDetailsResponse;
    const detailsError = query.error;
    const detailsLoading = query.isLoading
    return { invoiceDetails, detailsError, detailsLoading };
}

export function useInvoiceStripeView(m2mAuthOptions?: UseM2MAuthOptions) {
    const authResult = useM2MAuth(m2mAuthOptions);
      const authResultData =
        typeof authResult.data === 'object' ? (authResult.data as object) : null;
      const accessToken =
        authResultData && 'access_token' in authResultData
          ? (authResultData['access_token'] as string)
          : null;
      const tokenType =
        authResultData && 'token_type' in authResultData
          ? (authResultData['token_type'] as string)
          : null;
    
    const viewInvoicePDF = useCallback(async (id: string) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_MAIN_URL}/invoice/${id}/stripepreview`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/pdf",
                        authorization: `${tokenType} ${accessToken}`,
                    },
                }
            );
            if (!response.ok) throw new Error("Failed to fetcg PDF");

            const blob = await response.blob();
            const pdfURL = URL.createObjectURL(blob);
            window.open(pdfURL, "_blank");
        } catch (error) {
            console.error(error);
            alert("Unable to load PDF");
        }
    }, []);
    return { viewInvoicePDF };
}

// export function useCreateInvoice() {
//     const createInvoice = useMachineMutation({
//         url: `${import.meta.env.VITE_BACKEND_MAIN_URL}/invoice`,
//         method: "POST",
//     });

//     return { createInvoice };
// }