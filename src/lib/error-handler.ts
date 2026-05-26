/**
 * Enhanced error handling utilities for user feedback
 */

export interface ErrorDetails {
  title: string;
  description: string;
  code?: string;
  retry?: () => void;
}

export function getErrorMessage(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.name === 'NetworkError') {
      return {
        title: 'Connection Error',
        description:
          'Unable to connect to the server. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
      };
    }

    if (error.message.includes('timeout')) {
      return {
        title: 'Request Timeout',
        description:
          'The request took too long to complete. Please try again.',
        code: 'TIMEOUT',
      };
    }

    if (error.message.includes('unauthorized')) {
      return {
        title: 'Authentication Required',
        description:
          'Your session has expired. Please log in again to continue.',
        code: 'UNAUTHORIZED',
      };
    }

    if (error.message.includes('not found')) {
      return {
        title: 'Not Found',
        description: 'The requested resource could not be found.',
        code: 'NOT_FOUND',
      };
    }

    return {
      title: 'Error',
      description: error.message || 'An unexpected error occurred',
      code: error.name,
    };
  }

  if (typeof error === 'string') {
    return {
      title: 'Error',
      description: error,
    };
  }

  return {
    title: 'Error',
    description: 'An unexpected error occurred. Please try again.',
  };
}

export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorDetails = getErrorMessage(error);

  // In production, this would send to an error tracking service
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', errorDetails);
    if (context) {
      console.error('📋 Context:', context);
    }
  }
}
