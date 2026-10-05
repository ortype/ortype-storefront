/**
 * Run with: npx tsx --test src/commercelayer/providers/Order/mutation-queue.test.ts
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { createMutationQueue } from './mutation-queue'

const tick = () => new Promise((r) => setTimeout(r, 0))

describe('createMutationQueue', () => {
  it('runs tasks one at a time, in order', async () => {
    const queue = createMutationQueue()
    const log: string[] = []
    let active = 0
    let maxActive = 0
    const task = (name: string) => async () => {
      active++
      maxActive = Math.max(maxActive, active)
      log.push(`start ${name}`)
      await tick()
      log.push(`end ${name}`)
      active--
      return name
    }

    const results = await Promise.all([
      queue.enqueue(task('a')),
      queue.enqueue(task('b')),
      queue.enqueue(task('c')),
    ])

    assert.deepEqual(results, ['a', 'b', 'c'])
    assert.equal(maxActive, 1)
    assert.deepEqual(log, [
      'start a',
      'end a',
      'start b',
      'end b',
      'start c',
      'end c',
    ])
  })

  it('keeps running after a task rejects', async () => {
    const queue = createMutationQueue()
    const failing = queue.enqueue(async () => {
      throw new Error('boom')
    })
    const next = queue.enqueue(async () => 'ok')
    await assert.rejects(failing, /boom/)
    assert.equal(await next, 'ok')
  })

  it('coalesces queued tasks with the same key (latest wins)', async () => {
    const queue = createMutationQueue()
    const ran: string[] = []

    // Occupies the queue so the keyed tasks stay pending
    const blocker = queue.enqueue(async () => {
      await tick()
      ran.push('blocker')
    })
    const first = queue.enqueueCoalesced('font-a', async () => {
      ran.push('first')
      return 'first'
    })
    const second = queue.enqueueCoalesced('font-a', async () => {
      ran.push('second')
      return 'second'
    })
    const other = queue.enqueueCoalesced('font-b', async () => {
      ran.push('other')
      return 'other'
    })

    await blocker
    // Both callers for font-a get the replacement's result
    assert.deepEqual(await Promise.all([first, second, other]), [
      'second',
      'second',
      'other',
    ])
    assert.deepEqual(ran, ['blocker', 'second', 'other'])
  })

  it('does not coalesce into a task that has already started', async () => {
    const queue = createMutationQueue()
    const ran: string[] = []
    const first = queue.enqueueCoalesced('font-a', async () => {
      await tick()
      ran.push('first')
    })
    // `first` started synchronously (queue was idle)
    const second = queue.enqueueCoalesced('font-a', async () => {
      ran.push('second')
    })
    await Promise.all([first, second])
    assert.deepEqual(ran, ['first', 'second'])
  })

  it('idle() resolves when everything has settled and size() reflects work', async () => {
    const queue = createMutationQueue()
    assert.equal(queue.size(), 0)
    await queue.idle()

    const sizes: number[] = []
    const unsubscribe = queue.subscribe(() => sizes.push(queue.size()))
    queue.enqueue(async () => tick())
    queue.enqueue(async () => tick())
    assert.equal(queue.size(), 2)
    await queue.idle()
    assert.equal(queue.size(), 0)
    unsubscribe()
    assert.equal(sizes[sizes.length - 1], 0)
  })
})
