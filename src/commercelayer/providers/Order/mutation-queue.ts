/**
 * Order-level serialized mutation queue.
 *
 * Every Commerce Layer write for the cart (commit a font, remove a font,
 * reprice, write license metadata) toggles `autorefresh` on the *same order*
 * and refetches it, so two of them must never run concurrently. This queue runs
 * tasks one at a time, in order.
 *
 * `enqueueCoalesced(key, task)`: if a task with the same key is queued but has
 * not started yet, it is replaced by the newer task ("latest wins") and both
 * callers receive the replacement's result. Rapid edits to one font therefore
 * collapse into a single write of the final intent.
 */

type Listener = () => void

interface QueuedTask {
  key?: string
  run: () => Promise<unknown>
  started: boolean
  waiters: { resolve: (v: unknown) => void; reject: (e: unknown) => void }[]
}

export interface MutationQueue {
  enqueue: <T>(task: () => Promise<T>) => Promise<T>
  enqueueCoalesced: <T>(key: string, task: () => Promise<T>) => Promise<T>
  /** Resolves once every queued and running task has settled */
  idle: () => Promise<void>
  /** Queued + running task count */
  size: () => number
  /** Subscribe to size changes; returns an unsubscribe function */
  subscribe: (listener: Listener) => () => void
}

export function createMutationQueue(): MutationQueue {
  const pending: QueuedTask[] = []
  const listeners = new Set<Listener>()
  let running: QueuedTask | null = null
  let idleWaiters: (() => void)[] = []

  const size = () => pending.length + (running ? 1 : 0)
  const notify = () => listeners.forEach((l) => l())

  const settleIdle = () => {
    if (size() > 0) return
    const waiters = idleWaiters
    idleWaiters = []
    waiters.forEach((resolve) => resolve())
  }

  const pump = async () => {
    if (running) return
    const next = pending.shift()
    if (!next) {
      settleIdle()
      return
    }
    running = next
    next.started = true
    notify()
    try {
      const result = await next.run()
      next.waiters.forEach((w) => w.resolve(result))
    } catch (error) {
      next.waiters.forEach((w) => w.reject(error))
    } finally {
      running = null
      notify()
      void pump()
    }
  }

  const add = (task: QueuedTask) => {
    pending.push(task)
    notify()
    void pump()
  }

  return {
    enqueue: <T>(run: () => Promise<T>) =>
      new Promise<T>((resolve, reject) => {
        add({
          run,
          started: false,
          waiters: [{ resolve: resolve as (v: unknown) => void, reject }],
        })
      }),

    enqueueCoalesced: <T>(key: string, run: () => Promise<T>) =>
      new Promise<T>((resolve, reject) => {
        const waiter = { resolve: resolve as (v: unknown) => void, reject }
        const existing = pending.find((t) => t.key === key && !t.started)
        if (existing) {
          existing.run = run
          existing.waiters.push(waiter)
          return
        }
        add({ key, run, started: false, waiters: [waiter] })
      }),

    idle: () =>
      size() === 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => idleWaiters.push(resolve)),

    size,

    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
