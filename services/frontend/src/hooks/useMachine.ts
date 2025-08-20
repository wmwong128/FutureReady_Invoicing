import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import useM2MAuth, { type UseM2MAuthOptions } from './useM2MAuth';

export interface UseMachineOptions {
  url: string;
  init?: RequestInit;
  m2mAuthOptions?: UseM2MAuthOptions;
  queryOptions?: UseQueryOptions;
}

export default function useMachine(options: UseMachineOptions) {
  const authResult = useM2MAuth(options.m2mAuthOptions);
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

  return useQuery({
    queryKey: ['backend'],
    queryFn: async ({}) => {
      const response = await fetch(options.url, {
        method: 'GET',
        headers: {
          authorization: `${tokenType} ${accessToken}`,
        },
        ...options.init,
      });

      if (!response.ok) {
        throw new Error('Unable to connect.');
      }

      return response.json();
    },
    ...options.queryOptions,
    enabled: !!(accessToken && tokenType),
  });
}
