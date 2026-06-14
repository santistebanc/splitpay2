type PostgrestErrorLike = {
  code?: string;
  message?: string;
};

/** True when Supabase/PostgREST reports a duplicate primary or unique key. */
export function isDuplicateKeyError(error: PostgrestErrorLike | null): boolean {
  if (!error) {
    return false;
  }

  if (error.code === "23505") {
    return true;
  }

  const message = error.message?.toLowerCase() ?? "";
  return (
    message.includes("duplicate key") ||
    message.includes("unique constraint") ||
    message.includes("already exists")
  );
}

/** True when PostgREST responded with HTTP 409 Conflict. */
export function isConflictStatus(status: number | undefined): boolean {
  return status === 409;
}
