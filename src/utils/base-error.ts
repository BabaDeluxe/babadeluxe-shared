export class BaseError extends Error {
  public readonly namespace: string
  public readonly originalCause?: unknown

  constructor(
    message: string,
    cause?: unknown,
    public readonly namespaceOverride?: string
  ) {
    const namespace = namespaceOverride ?? new.target.name.replace(/Error$/, '')
    const options = cause instanceof Error ? { cause } : undefined

    super(`[${namespace}] ${message}`, options)

    this.name = new.target.name
    this.namespace = namespace
    this.originalCause = cause

    Object.setPrototypeOf(this, new.target.prototype)
  }

  public override toString(): string {
    let output = this.stack ?? `${this.name}: ${this.message}`

    if (this.originalCause !== undefined) {
      const causeString = this._formatCause(this.originalCause)
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

    return typeof cause === 'symbol' ? cause.toString() : String(cause)
  }
}
