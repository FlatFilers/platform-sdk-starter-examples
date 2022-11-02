// validation helper functions used in various examples

import { Message } from '@flatfile/configure'
import { FlatfileRecord } from '@flatfile/hooks'
import * as Ap from 'fp-ts/Apply'
import * as E from 'fp-ts/Either'
import * as NEA from 'fp-ts/NonEmptyArray'
import { constVoid, identity, pipe } from 'fp-ts/function'

/**
 * Helper function to apply reduction to FF record class.
 *
 * @example
 * fold(fn1, fn2, fn3, ...)(record)
 */
export const fold =
  (...fns: Array<(x: FlatfileRecord) => void>) =>
  (x: FlatfileRecord) =>
    fns.map((f) => f(x))

/**
 * Validation helper to accumulate error messages since
 * E.Either ap uses a flatMap and thus stops at the first error.
 *
 * @example
 * pipe(
 *   sequenceValidationsT(ensureValidEmail, ensureMaxLength),
 *   E.match(identity, constVoid),
 * );
 */
const _sequenceValidationsT = Ap.sequenceT(
  E.getApplicativeValidation(NEA.getSemigroup<Message>())
)

export type ValidationResult<T> = E.Either<NEA.NonEmptyArray<Message>, T>

/**
 * A wrapper around `sequenceValidationsT` that conforms to the FF SDK
 * `validate()` return type. Runs all validation functions and accumulates
 * the errors.
 *
 * @example
 * runValidations(fn1, fn2, fn3, ...);
 */
export const runValidations = (
  ...fns: Array<ValidationResult<any>>
): void | Array<Message> => {
  // Not interested in fighting the TS compiler here
  return pipe(
    _sequenceValidationsT(...(fns as any)),
    E.match(identity, constVoid)
  )
}
