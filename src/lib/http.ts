import { ZodError } from "zod";

export function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, init);
}

export function errorResponse(error: unknown, status = 500): Response {
  if (error instanceof ZodError) {
    return jsonResponse(
      {
        error: "Validation failed",
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    return jsonResponse(
      {
        error: error.message,
      },
      { status },
    );
  }

  return jsonResponse(
    {
      error: "Unexpected error",
    },
    { status },
  );
}
