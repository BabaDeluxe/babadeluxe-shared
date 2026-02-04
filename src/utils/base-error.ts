export class BaseError extends Error {
  public readonly namespace: string

  constructor(
    message: string,
    public override readonly cause?: unknown,
    public readonly namespaceOverride?: string
  ) {
    const namespace = namespaceOverride ?? new.target.name.replace(/Error$/, '')
    super(`[${namespace}] ${message}`)
    this.name = new.target.name
    this.namespace = namespace
    Object.setPrototypeOf(this, new.target.prototype)
  }

  public override toString(): string {
    let output = this.stack ?? `${this.name}: ${this.message}`

    if (this.cause !== undefined) {
      const causeString = this._formatCause(this.cause)
      output += `\n\nCaused by:\n${causeString}`
    }

    return output
  }

  private _formatCause(cause: unknown): string {
    if (cause instanceof Error) {
      return cause.stack ?? `${cause.name}: ${cause.message}`
    }

    if (typeof cause === 'string') {
      return cause
    }

    if (typeof cause === 'object' && cause !== null) {
      try {
        return JSON.stringify(cause, null, 2)
      } catch {
        return '[Unserializable Object]'
      }
    }

    // Primitives: number, boolean, undefined, null, symbol, bigint
    return typeof cause === 'symbol' ? cause.toString() : String(cause)
  }
}
