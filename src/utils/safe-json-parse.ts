import { err, ok, Result } from 'neverthrow'
import { BaseError } from './base-error'

export class JsonParseError extends BaseError {}

/* @__NO_SIDE_EFFECTS__ */
export function safeJsonParse(body: string): Result<Record<string, unknown>, JsonParseError> {
  const parseResult = Result.fromThrowable(
    JSON.parse,
    (error: unknown) =>
      new JsonParseError(error instanceof Error ? error.message : 'JSON.parse failed')
  )(body)

  if (parseResult.isErr()) return /* @__PURE__ */ err(parseResult.error)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { value } = parseResult
  return /* @__PURE__ */ ok(value as Record<string, unknown>)
}
