import { describe, expect, it } from 'vitest'
import { DagPromptBuilder, DagPromptBuilderError } from './dag-prompt-builder.js'

describe('DagPromptBuilder', () => {
  it('builds a single-node graph', () => {
    const builder = new DagPromptBuilder()
    builder.addNode({ id: 'a', render: () => 'hello' })
    expect(builder.build()).toBe('hello')
  })

  it('resolves two nodes in dependency order', () => {
    const builder = new DagPromptBuilder()
    builder.addNode({ id: 'system', render: () => 'You are helpful.' })
    builder.addNode({
      id: 'user',
      dependsOn: ['system'],
      render: (deps) => `${deps.system} Now answer: What is 2+2?`,
    })
    const result = builder.build()
    expect(result).toBe('You are helpful.\nYou are helpful. Now answer: What is 2+2?')
  })

  it('resolves a chain of three nodes in correct order', () => {
    const order: string[] = []
    const builder = new DagPromptBuilder()
    builder.addNode({ id: 'a', render: () => { order.push('a'); return 'A' } })
    builder.addNode({ id: 'b', dependsOn: ['a'], render: () => { order.push('b'); return 'B' } })
    builder.addNode({ id: 'c', dependsOn: ['b'], render: () => { order.push('c'); return 'C' } })
    builder.build()
    expect(order).toEqual(['a', 'b', 'c'])
  })

  it('handles a diamond dependency (a→b, a→c, b+c→d)', () => {
    const builder = new DagPromptBuilder()
    builder.addNode({ id: 'a', render: () => 'root' })
    builder.addNode({ id: 'b', dependsOn: ['a'], render: (d) => `b(${d.a})` })
    builder.addNode({ id: 'c', dependsOn: ['a'], render: (d) => `c(${d.a})` })
    builder.addNode({ id: 'd', dependsOn: ['b', 'c'], render: (d) => `d(${d.b}+${d.c})` })
    const result = builder.build(' | ')
    expect(result).toContain('d(b(root)+c(root))')
  })

  it('uses custom separator', () => {
    const builder = new DagPromptBuilder()
    builder.addNode({ id: 'x', render: () => 'X' })
    builder.addNode({ id: 'y', render: () => 'Y' })
    expect(builder.build(' --- ')).toBe('X --- Y')
  })

  it('throws on duplicate node id', () => {
    const builder = new DagPromptBuilder()
    builder.addNode({ id: 'dup', render: () => '' })
    expect(() => builder.addNode({ id: 'dup', render: () => '' })).toThrow(DagPromptBuilderError)
  })

  it('throws on unknown dependency', () => {
    const builder = new DagPromptBuilder()
    builder.addNode({ id: 'a', dependsOn: ['ghost'], render: () => '' })
    expect(() => builder.build()).toThrow(DagPromptBuilderError)
  })

  it('throws on a direct cycle (a→b→a)', () => {
    const builder = new DagPromptBuilder()
    // Manually bypass addNode duplicate guard to plant the cycle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(builder as any)._nodes.set('a', { id: 'a', dependsOn: ['b'], render: () => 'A' })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(builder as any)._nodes.set('b', { id: 'b', dependsOn: ['a'], render: () => 'B' })
    expect(() => builder.build()).toThrow('Cycle detected')
  })

  it('clear() resets the builder', () => {
    const builder = new DagPromptBuilder()
    builder.addNode({ id: 'a', render: () => 'A' })
    builder.clear()
    expect(builder.getNodes()).toHaveLength(0)
    expect(builder.build()).toBe('')
  })

  it('getNodes() returns all registered nodes', () => {
    const builder = new DagPromptBuilder()
    builder.addNode({ id: 'a', render: () => '' })
    builder.addNode({ id: 'b', render: () => '' })
    expect(builder.getNodes().map((n) => n.id)).toEqual(['a', 'b'])
  })
})
