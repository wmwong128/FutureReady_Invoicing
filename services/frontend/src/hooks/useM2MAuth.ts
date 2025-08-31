import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

export interface UseM2MAuthOptions extends Partial<UseQueryOptions> {}

export default function useM2MAuth(options?: UseM2MAuthOptions) {
  return useQuery({
    queryKey: ['m2m_auth'],
    queryFn: async ({}) => {
      const response = await fetch(
        `https://${import.meta.env.VITE_AUTH0_DOMAIN}/oauth/token`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            client_id: import.meta.env.VITE_AUTH0_API_CLIENT_ID,
            client_secret: import.meta.env.VITE_AUTH0_API_CLIENT_SECRET,
            audience: import.meta.env.VITE_AUTH0_API_AUDIENCE,
            grant_type: 'client_credentials',
          }),
        }
      );

      if (!response.ok) {
        return Promise.reject(new Error('Unable to fetch JWT.'));
      }

      const result = await response.json();
      return result;
    },
    ...options,
  });
}
