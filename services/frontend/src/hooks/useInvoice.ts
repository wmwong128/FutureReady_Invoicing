import type { Invoice, InvoiceDetailsResponse, InvoiceReponse, InvoiceStats } from "@/data/types/Invoice";
import useMachine from "./useMachine";
import { useCallback } from "react";
import useMachineMutation from "./useMachineMutation";
import type { UseM2MAuthOptions } from "./useM2MAuth";
import useM2MAuth from "./useM2MAuth";
import { useAuth0 } from "@auth0/auth0-react";

const BASE_URL = `${import.meta.env.VITE_BACKEND_MAIN_URL}/invoice`;

export function useInvoiceManagement() {
    const { user } = useAuth0()
    const query = useMachine({
        url: `${BASE_URL}/${user?.email}`,
        queryOptions: {
            queryKey: ["invoiceManagement", user?.email],
        }
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
        url: id ? `${BASE_URL}/${id}` : "",
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
    const { user } = useAuth0()
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
                `${BASE_URL}/${user?.email}/${id}/stripepreview`,
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

export function useCreateInvoice() {
    const { user } = useAuth0()
    const createInvoice = useMachineMutation({
        url: `${BASE_URL}/${user?.email}`,
        method: "POST",
    });

    return { createInvoice };
}

export function useUpdateInvoice(id?: string) {
    const { user } = useAuth0()
    const updateInvoice = useMachineMutation({
        url: `${BASE_URL}/${user?.email}/${id}`,
        method: "PATCH",
    });

    return { updateInvoice };
}

export function useSendInvoice(id?: string) {
    const { user } = useAuth0()
    const sendInvoice = useMachineMutation({
        url: `${BASE_URL}/${user?.email}/${id}/send`,
        method: "POST",
    });

    return { sendInvoice };
}

export function useDeleteInvoice(id?: string) {
    const { user } = useAuth0();
    const deleteInvoice = useMachineMutation({
        url: `${BASE_URL}/${user?.email}/${id}`,
        method: "DELETE",
    })

    return { deleteInvoice };
}