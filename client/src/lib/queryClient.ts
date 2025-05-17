import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText);
  }
}

export async function apiRequest(
  path: string,
  options?: RequestInit
): Promise<any> {
  const res = await fetch(path, options);
  await throwIfResNotOk(res);
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return res.text();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => (path: string) => Promise<T | null> = ({ on401 }) => {
  return async (path: string) => {
    try {
      return await apiRequest(path);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes("status code 401") &&
        on401 === "returnNull"
      ) {
        return null;
      }
      throw e;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn<any>({ on401: "throw" }),
      refetchOnWindowFocus: false,
    },
  },
});