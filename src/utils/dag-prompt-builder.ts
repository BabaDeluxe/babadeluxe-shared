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

/**
 * A resolved dependency map where each key is a node ID and each value is
 * the rendered string output of that upstream node.
 *
 * Named interface (not `Record<string, string>`) so TypeScript does NOT
 * flag dot-notation access as TS4111 noPropertyAccessFromIndexSignature
 * violations — callers get clean `deps.someKey` access.
 */
export type ResolvedDeps = Record<string, string>

export type PromptNode = {
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
  render: (resolvedDeps: ResolvedDeps) => string
}

export class DagPromptBuilderError extends BaseError {}

// ---------------------------------------------------------------------------
// AdjList — directed edge storage
// ---------------------------------------------------------------------------

/**
 * Directed adjacency list for the DAG.
 *
 * An edge `dep → id` means: "node `id` depends on node `dep`",
 * i.e. when `dep` is processed, `id` becomes one step closer to unblocked.
 *
 * Responsibilities:
 *  - Store outgoing edges for every node
 *  - Return the downstream neighbours of any given node
 */
class AdjList {
  private readonly _edges = new Map<string, string[]>()

  constructor(nodes: Map<string, PromptNode>) {
    // Initialise an empty edge list for every node
    for (const id of nodes.keys()) {
      this._edges.set(id, [])
    }

    // For each dependency edge dep → id, record id as a downstream neighbour of dep
    for (const [id, node] of nodes) {
      for (const dep of node.dependsOn ?? []) {
        this._edges.get(dep)!.push(id)
      }
    }
  }

  /**
   * Returns all nodes that have `id` as a direct upstream dependency
   * (i.e. the nodes that `id` must notify when it completes).
   */
  neighbours(id: string): readonly string[] {
    return this._edges.get(id) ?? []
  }
}

// ---------------------------------------------------------------------------
// Degree — in-degree counter for Kahn's algorithm
// ---------------------------------------------------------------------------

/**
 * Tracks how many unresolved upstream dependencies each node still has.
 *
 * Responsibilities:
 *  - Count incoming edges per node (in-degree)
 *  - Expose the initial zero-in-degree seed set
 *  - Decrement a node's count and report when it reaches zero (unblocked)
 */
class Degree {
  private readonly _inDegree = new Map<string, number>()

  constructor(nodes: Map<string, PromptNode>) {
    // Every node starts with in-degree 0
    for (const id of nodes.keys()) {
      this._inDegree.set(id, 0)
    }

    // Each dep → id edge increments id's in-degree by 1
    for (const [id, node] of nodes) {
      for (const dep of node.dependsOn ?? []) {
        void dep // edge direction is dep → id; we only need to count id's side
        this._inDegree.set(id, (this._inDegree.get(id) ?? 0) + 1)
      }
    }
  }

  /** All node IDs whose in-degree is currently zero (stable: insertion order). */
  zeros(): string[] {
    const result: string[] = []
    for (const [id, deg] of this._inDegree) {
      if (deg === 0) result.push(id)
    }

    return result
  }

  /**
   * Decrements the in-degree of `id` by one.
   * Returns `true` when the node reaches zero (now fully unblocked).
   */
  decrement(id: string): boolean {
    const next = (this._inDegree.get(id) ?? 0) - 1
    this._inDegree.set(id, next)
    return next === 0
  }
}

// ---------------------------------------------------------------------------
// DagPromptBuilder
// ---------------------------------------------------------------------------

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
    const resolved: ResolvedDeps = {}
    const parts: string[] = []

    for (const id of order) {
      const node = this._nodes.get(id)!
      const deps: ResolvedDeps = {}

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
    const adj = new AdjList(this._nodes)
    const degree = new Degree(this._nodes)
    const queue = degree.zeros()
    const order: string[] = []

    while (queue.length > 0) {
      const current = queue.shift()!
      order.push(current)

      for (const neighbour of adj.neighbours(current)) {
        if (degree.decrement(neighbour)) {
          queue.push(neighbour)
        }
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
