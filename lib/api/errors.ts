import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * Custom API Error class for structured error handling
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Standard error response formatter
 * Converts various error types into consistent NextResponse format
 */
export function errorResponse(error: unknown): NextResponse {
  // Handle custom APIError
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.statusCode }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    );
  }

  // Handle Postgres unique constraint violation (duplicate)
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as { code?: string; message?: string };

    // 23505 = unique_violation
    if (pgError.code === '23505') {
      return NextResponse.json(
        {
          error: 'Resource already exists',
          code: 'DUPLICATE_RESOURCE',
          details: pgError.message,
        },
        { status: 409 }
      );
    }

    // 23503 = foreign_key_violation
    if (pgError.code === '23503') {
      return NextResponse.json(
        {
          error: 'Referenced resource not found',
          code: 'FOREIGN_KEY_VIOLATION',
          details: pgError.message,
        },
        { status: 404 }
      );
    }
  }

  // Generic error
  console.error('Unexpected API error:', error);
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Common API error instances
 */
export const ApiErrors = {
  unauthorized: () => new APIError(401, 'Unauthorized - Authentication required', 'UNAUTHORIZED'),
  forbidden: (message = 'Forbidden - You do not have access to this resource') =>
    new APIError(403, message, 'FORBIDDEN'),
  notFound: (resource = 'Resource') => new APIError(404, `${resource} not found`, 'NOT_FOUND'),
  conflict: (message: string) => new APIError(409, message, 'CONFLICT'),
  validation: (message: string, details?: any) =>
    new APIError(400, message, 'VALIDATION_ERROR', details),
  unprocessable: (message: string) => new APIError(422, message, 'UNPROCESSABLE_ENTITY'),
};
