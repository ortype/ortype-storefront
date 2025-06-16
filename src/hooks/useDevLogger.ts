export function useDevLogger() {
  return (scope: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error(scope, ...args)
    }
  }
}

