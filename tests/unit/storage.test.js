import { afterEach, describe, expect, it, vi } from 'vitest'
import { read, write } from '../../src/lib/storage.js'

describe('storage', () => {
  afterEach(() => vi.restoreAllMocks())

  it('round-trips JSON', () => {
    write('t', { a: [1, 2] })
    expect(read('t', null)).toEqual({ a: [1, 2] })
  })

  it('falls back when storage throws (private mode, blocked cookies)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(() => write('x', 1)).not.toThrow()
    expect(read('x', 'fallback')).toBe('fallback')
  })

  it('falls back on corrupted values', () => {
    window.localStorage.setItem('jcs:bad', '{not json')
    expect(read('bad', 7)).toBe(7)
  })
})
