export type AuthorizationResult =
  | { authorized: true }
  | {
      authorized: false;
      code: "UNAUTHENTICATED" | "FORBIDDEN" | "DATABASE_ERROR";
      message: string;
    };

export type SupabaseError = {
  code?: string | null;
  message?: string | null;
};

export type ErrorLogger = (event: {
  operation: string;
  category: string;
  providerCode: string;
  providerMessage: string;
}) => void;

export function logSupabaseError(
  logError: ErrorLogger,
  operation: string,
  category: string,
  error: SupabaseError,
) {
  logError({
    operation,
    category,
    providerCode: error.code || "UNKNOWN",
    providerMessage: error.message || "Unknown Supabase error",
  });
}

export async function authorizePostMutation(
  sessionEmail: string | null | undefined,
  lookupAdmin: (email: string) => Promise<{
    data: { id: string } | null;
    error: SupabaseError | null;
  }>,
  logError: ErrorLogger = console.error,
): Promise<AuthorizationResult> {
  if (!sessionEmail) {
    return {
      authorized: false,
      code: "UNAUTHENTICATED",
      message: "Tu sesión expiró. Inicia sesión de nuevo.",
    };
  }

  const { data, error } = await lookupAdmin(
    sessionEmail.toLowerCase().trim(),
  );

  if (error) {
    logSupabaseError(logError, "posts.authorize", "database", error);
    return {
      authorized: false,
      code: "DATABASE_ERROR",
      message: "No se pudo verificar tu acceso. Inténtalo de nuevo.",
    };
  }

  if (!data) {
    return {
      authorized: false,
      code: "FORBIDDEN",
      message: "Tu cuenta no tiene permisos para gestionar publicaciones.",
    };
  }

  return { authorized: true };
}
