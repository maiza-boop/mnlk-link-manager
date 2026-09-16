import { createServerFn } from "@tanstack/react-start";

/**
 * Public resolver used by the short-link redirect route.
 * Uses the publishable key + a security-definer database function, so no
 * private link data is ever exposed.
 */
export const resolveLink = createServerFn({ method: "GET" })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"]!;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;

    let userAgent: string | null = null;
    let referer: string | null = null;
    try {
      const { getRequest } = await import("@tanstack/react-start/server");
      const request = getRequest();
      userAgent = request.headers.get("user-agent");
      referer = request.headers.get("referer");
    } catch {
      // headers unavailable (client-side navigation) - click is still recorded
    }

    const client = createClient(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const { data: destination, error } = await client.rpc("resolve_link", {
      _code: data.code,
      _user_agent: userAgent,
      _referer: referer,
    });

    if (error) {
      console.error("resolve_link failed", error);
      return { url: null as string | null };
    }

    return { url: (destination as string | null) ?? null };
  });
