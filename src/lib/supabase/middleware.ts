import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Rafraichit la session Supabase et renvoie l utilisateur courant. */
export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...(options as Record<string, unknown>),
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production"
            })
          );
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { user, supabase };
}
