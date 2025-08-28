import { useMutation, type UseMutationOptions } from "@tanstack/react-query";
import type { UseM2MAuthOptions } from "./useM2MAuth";
import useM2MAuth from "./useM2MAuth";

export interface UseMachineMutationOptions<TData = unknown, TVariables = unknown> {
    url: string;
    method?: "POST" | "PATCH" | "DELETE";
    m2mAuthOptions?: UseM2MAuthOptions;
    mutationOptions?: UseMutationOptions<TData, unknown, TVariables>;
}

export default function useMachineMutation<TData = unknown, TVariables = unknown>({
    url,
    method = "POST",
    m2mAuthOptions,
    mutationOptions,
}: UseMachineMutationOptions<TData, TVariables>) {
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
    
    return useMutation<TData, unknown, TVariables>({
        mutationFn: async (variables: TVariables) => {

            const response = await fetch(url, {
                method,
                headers: {
                    authorization: `${tokenType} ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(variables),
            });

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            return (await response.json()) as TData;
        },
        ...mutationOptions,
    });
}