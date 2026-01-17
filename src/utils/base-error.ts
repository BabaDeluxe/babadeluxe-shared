export class BaseError extends Error {
  public readonly namespace: string

  constructor(
    message: string,
    public override readonly cause?: Error,
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

    if (this.cause) {
      const causeString = String(this.cause)
      output += `\n\nCaused by:\n${causeString}`
    }

    return output
  }
}
