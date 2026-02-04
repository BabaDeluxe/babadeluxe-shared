export class BaseError extends Error {
  public readonly namespace: string
  // Store the original unknown cause
  private readonly _originalCause?: unknown

  constructor(
    message: string,
    cause?: unknown,
    public readonly namespaceOverride?: string
  ) {
    const namespace = namespaceOverride ?? new.target.name.replace(/Error$/, '')

    const errorCause = cause instanceof Error ? cause : undefined

    super(`[${namespace}] ${message}`, { cause: errorCause })

    this.name = new.target.name
    this.namespace = namespace
    this._originalCause = cause
    Object.setPrototypeOf(this, new.target.prototype)
  }

  public override get cause(): unknown {
    return this._originalCause
  }

  public override toString(): string {
    let output = this.stack ?? `${this.name}: ${this.message}`

    if (this._originalCause !== undefined) {
      const causeString = this._formatCause(this._originalCause)
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
