import { createClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/clerk-react";
import { useMemo } from "react";

export function useSupabaseClient() {
  const { session } = useSession();

  const supabase = useMemo(() => {
    return createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await session?.getToken();
            const headers = new Headers(options?.headers);
            headers.set("Authorization", `Bearer ${clerkToken}`);
            return fetch(url, { ...options, headers });
          },
        },
      },
    );
  }, [session]);

  return supabase;
}
