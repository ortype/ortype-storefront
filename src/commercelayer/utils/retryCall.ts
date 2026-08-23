import retry from 'async-retry'

type FetchResource<T> = {
  /**
   * Data returned from the promise once it has been fulfilled.
   */
  object: T | undefined
  /**
   * Indicates if the async operation has been resolved or not.
   */
  success: boolean
  /**
   * When `true` it means that the operation has failed without attempting any retries.
   * This because the error returned matched one of the not-retriable conditions (eg: 401).
   */
  bailed?: boolean
}

const RETRIES = 3

/**
 * Tries to re-execute `n` times an async operation passed as argument, in case it's rejected.
 * @param f - The original async function we need to call
 * @returns the `FetchResource<T>` object containing the resolved data and the status of requests.
 */
export const retryCall = async <T>(
  f: () => Promise<T>,
): Promise<FetchResource<T> | undefined> => {
  return await retry(
    async (_, attempt) => {
      try {
        return {
          object: await f(),
          success: true,
        }
      } catch (error: any) {
        const isNotRetryable =
          error.status === 401 || !Object.keys(error).length

        // NEW: Handle rate limits explicitly
        if (error.status === 429) {
          const retryAfter = error.headers?.['retry-after'] || 60

          if (attempt === RETRIES + 1) {
            return {
              object: undefined,
              success: false,
              bailed: true, // Don't continue after exhausting retries on 429
            }
          }

          // Wait before next attempt
          await new Promise((resolve) =>
            setTimeout(resolve, parseInt(retryAfter) * 1000 || 2000),
          )

          throw error // Retry with delay
        }

        if (isNotRetryable) {
          return {
            object: undefined,
            success: false,
            bailed: true,
          }
        }

        if (attempt === RETRIES + 1) {
          return {
            object: undefined,
            success: false,
          }
        }

        throw error
      }
    },
    {
      retries: RETRIES,
      minTimeout: 1000,
      maxTimeout: 5000,
      factor: 2, // Exponential backoff
    },
  )
}
