/**
 * DAG Prompt Builder
 *
 * Composes a final prompt string from a directed acyclic graph (DAG) of
 * PromptNodes. Each node can declare dependencies on upstream nodes; the
 * builder resolves them in topological order (Kahn's algorithm) and
 * concatenates the rendered output of every node.
 *
 * Usage:
 *   const builder = new DagPromptBuilder()
 *   builder.addNode({ id: 'system',  render: () => 'You are a helpful assistant.' })
 *   builder.addNode({ id: 'context', dependsOn: ['system'], render: (ctx) => `Context: ${ctx.system}` })
 *   builder.addNode({ id: 'user',    dependsOn: ['context'], render: (ctx) => `User: ${ctx.context}\nReply:` })
 *   const prompt = builder.build()  // topologically ordered, concatenated
 */

import { BaseError } from './base-error.js'

export interface PromptNode {
  /** Unique identifier for this node. */
  id: string

  /** IDs of nodes whose output must be available before this node renders. */
  dependsOn?: string[]

  /**
   * Renders the text contribution of this node.
   *
   * @param resolvedDeps - A map of `{ [nodeId]: renderedText }` for every
   *   node listed in `dependsOn`. Empty object when there are no deps.
   */
  render: (resolvedDeps: Readonly<Record<string, string>>) => string
}

export class DagPromptBuilderError extends BaseError {}

export class DagPromptBuilder {
  private readonly _nodes = new Map<string, PromptNode>()

  /**
   * Registers a node in the graph.
   * Throws if a node with the same `id` has already been added.
   */
  addNode(node: PromptNode): this {
    if (this._nodes.has(node.id)) {
      throw new DagPromptBuilderError(
        `Node with id "${node.id}" has already been added to the graph.`
      )
    }

    this._nodes.set(node.id, node)
    return this
  }

  /**
   * Resolves the graph in topological order using Kahn's algorithm and
   * concatenates each node's rendered output separated by `separator`.
   *
   * @param separator - String inserted between adjacent node outputs.
   *   Defaults to "\n".
   * @returns The composed prompt string.
   * @throws {DagPromptBuilderError} On unknown dependency references or
   *   cycles in the graph.
   */
  build(separator = '\n'): string {
    this._validate()

    const order = this._topologicalSort()
    const resolved: Record<string, string> = {}
    const parts: string[] = []

    for (const id of order) {
      const node = this._nodes.get(id)!
      const deps: Record<string, string> = {}

      for (const dep of node.dependsOn ?? []) {
        deps[dep] = resolved[dep]!
      }

      const output = node.render(deps)
      resolved[id] = output
      parts.push(output)
    }

    return parts.join(separator)
  }

  /**
   * Returns all currently registered nodes (insertion order).
   */
  getNodes(): PromptNode[] {
    return [...this._nodes.values()]
  }

  /**
   * Removes all nodes, resetting the builder for re-use.
   */
  clear(): this {
    this._nodes.clear()
    return this
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Validates that every declared dependency ID actually exists. */
  private _validate(): void {
    for (const [id, node] of this._nodes) {
      for (const dep of node.dependsOn ?? []) {
        if (!this._nodes.has(dep)) {
          throw new DagPromptBuilderError(`Node "${id}" depends on unknown node "${dep}".`)
        }
      }
    }
  }

  /** Kahn's algorithm — returns node IDs in a valid topological order. */
  private _topologicalSort(): string[] {
    const inDegree = new Map<string, number>()
    const adjList = new Map<string, string[]>()

    for (const id of this._nodes.keys()) {
      inDegree.set(id, 0)
      adjList.set(id, [])
    }

    for (const [id, node] of this._nodes) {
      for (const dep of node.dependsOn ?? []) {
        adjList.get(dep)!.push(id)
        inDegree.set(id, (inDegree.get(id) ?? 0) + 1)
      }
    }

    // Seed queue with all zero-in-degree nodes (stable: insertion order)
    const queue: string[] = []
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id)
    }

    const order: string[] = []

    while (queue.length > 0) {
      const current = queue.shift()!
      order.push(current)

      for (const neighbour of adjList.get(current) ?? []) {
        const newDeg = inDegree.get(neighbour)! - 1
        inDegree.set(neighbour, newDeg)
        if (newDeg === 0) queue.push(neighbour)
      }
    }

    if (order.length !== this._nodes.size) {
      throw new DagPromptBuilderError(
        'Cycle detected in the prompt DAG. Ensure there are no circular dependencies.'
      )
    }

    return order
  }
}
