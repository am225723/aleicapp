import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/query-client";

async function getAuthHeaders(): Promise<HeadersInit> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  return headers;
}

async function apiGet<T>(endpoint: string): Promise<T> {
  const headers = await getAuthHeaders();
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Request failed");
  }

  return response.json();
}

async function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Request failed");
  }

  return response.json();
}

async function apiPut<T>(endpoint: string, data?: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "PUT",
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Request failed");
  }

  return response.json();
}

async function apiDelete<T>(endpoint: string): Promise<T> {
  const headers = await getAuthHeaders();
  const baseUrl = getApiUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Request failed");
  }

  return response.json();
}

export function useApi<T>(endpoint: string, options?: { enabled?: boolean }) {
  return useQuery<T>({
    queryKey: [endpoint],
    queryFn: async () => {
      return await apiGet<T>(endpoint);
    },
    ...options,
  });
}

interface MutationOptions<TData, TVariables> {
  invalidateQueries?: string[];
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error) => void;
}

export function useApiMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  method: "post" | "put" | "delete" = "post",
  options?: MutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();

  const apiFn = method === "post" ? apiPost : method === "put" ? apiPut : apiDelete;

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data: TVariables) => {
      return await apiFn<TData>(endpoint, data);
    },
    onSuccess: (data, variables) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
      if (options?.onSuccess) {
        options.onSuccess(data, variables);
      }
    },
    onError: options?.onError,
  });
}

export { apiGet, apiPost, apiPut, apiDelete };
