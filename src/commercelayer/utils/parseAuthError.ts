export type ParsedAuthError = {
  userMessage: string          // shown to customers
  developerMessage?: string    // sent to console/Sentry
  type: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'RATE_LIMIT' | 'NETWORK' | 'CONFIG' | 'UNKNOWN'
  status?: number
  code?: string
  retryAfter?: number          // seconds to wait before retrying (for RATE_LIMIT)
}

const userMessageMap: Record<ParsedAuthError['type'], string> = {
  INVALID_CREDENTIALS: 'The email or password you entered is incorrect.',
  ACCOUNT_LOCKED: 'Your account is locked. Please reset your password or contact support.',
  RATE_LIMIT: 'Too many attempts. Please wait a few minutes before trying again.',
  NETWORK: 'Network error — please check your connection and retry.',
  CONFIG: 'Configuration error — we are fixing this. Please try later.',
  UNKNOWN: 'Unexpected error — please retry or contact support.'
}

interface CommerceLayerError {
  title?: string
  detail?: string
  code?: string
  status?: string | number
  source?: {
    pointer?: string
  }
  meta?: unknown
}

interface ErrorResponse {
  errors?: CommerceLayerError[]
  response?: {
    status?: number
    data?: {
      errors?: CommerceLayerError[]
    }
    headers?: {
      'retry-after'?: string
    }
  }
  isAxiosError?: boolean
  status?: number
  code?: string
}

/**
 * Parses authentication errors from Commerce Layer API responses
 * and converts them into a standardized format for user display and logging.
 * 
 * @param error - The error object from Commerce Layer API or network request
 * @returns ParsedAuthError - Standardized error information
 */
export function parseAuthError(error: any): ParsedAuthError {
  // Check for network connectivity issues (no response received)
  if (!error.response && (!error.errors && !error.response?.data?.errors)) {
    return {
      userMessage: userMessageMap.NETWORK,
      developerMessage: `Network error: ${error.message || 'Unknown network error'}`,
      type: 'NETWORK',
      status: error.status
    }
  }

  // Safely extract the first error from Commerce Layer response
  const errorResponse = error as ErrorResponse
  const commerceLayerError = errorResponse.errors?.[0] || 
                           errorResponse.response?.data?.errors?.[0]

  if (!commerceLayerError) {
    return {
      userMessage: userMessageMap.UNKNOWN,
      developerMessage: `Unknown error structure: ${JSON.stringify(error)}`,
      type: 'UNKNOWN',
      status: errorResponse.response?.status || errorResponse.status
    }
  }

  const {
    code,
    detail,
    title,
    status: errorStatus
  } = commerceLayerError

  const status = typeof errorStatus === 'string' ? parseInt(errorStatus, 10) : errorStatus

  // Parse specific error types based on code and status
  if (code === 'INVALID_LOGIN' || status === 401 || title === 'invalid_grant' || code === 'BAD_REQUEST') {
    return {
      userMessage: userMessageMap.INVALID_CREDENTIALS,
      developerMessage: `Authentication failed: ${detail || title || 'Invalid credentials'}`,
      type: 'INVALID_CREDENTIALS',
      status,
      code
    }
  }

  if (code === 'LOCKED' || detail?.toLowerCase().includes('locked')) {
    return {
      userMessage: userMessageMap.ACCOUNT_LOCKED,
      developerMessage: `Account locked: ${detail || title || 'Account is locked'}`,
      type: 'ACCOUNT_LOCKED',
      status,
      code
    }
  }

  if (status === 429) {
    // Extract retry-after header if available
    const retryAfterHeader = errorResponse.response?.headers?.['retry-after']
    const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined
    
    return {
      userMessage: userMessageMap.RATE_LIMIT,
      developerMessage: `Rate limit exceeded: ${detail || title || 'Too many requests'}`,
      type: 'RATE_LIMIT',
      status,
      code,
      retryAfter
    }
  }

  if (status === 400) {
    // Check for invalid_grant which means invalid credentials
    if (title === 'invalid_grant' || detail?.includes('authorization grant is invalid')) {
      return {
        userMessage: userMessageMap.INVALID_CREDENTIALS,
        developerMessage: `Authentication failed: ${detail || title || 'Invalid credentials'}`,
        type: 'INVALID_CREDENTIALS',
        status,
        code
      }
    }
    
    // Check for configuration issues like missing/invalid scope
    const isConfigError = detail?.toLowerCase().includes('scope') ||
                         detail?.toLowerCase().includes('client') ||
                         title?.toLowerCase().includes('scope') ||
                         title?.toLowerCase().includes('client')

    if (isConfigError) {
      return {
        userMessage: userMessageMap.CONFIG,
        developerMessage: `Configuration error: ${detail || title || 'Invalid request parameters'}`,
        type: 'CONFIG',
        status,
        code
      }
    }
  }

  // Fallback to unknown error type
  return {
    userMessage: userMessageMap.UNKNOWN,
    developerMessage: `Unhandled auth error: ${detail || title || 'Unknown error'} (code: ${code}, status: ${status})`,
    type: 'UNKNOWN',
    status,
    code
  }
}

