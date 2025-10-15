type FNError = { type: string; error: Error };
/**
 * @description Core Result type.
 * @template T - The type of the value.
 * @template E - The type of the errors, which must extend { type: string; error: Error }.
 */
export type Result<T, E extends FNError = FNError> =
	| { success: true; value: T }
	| { success: false; errors: E[] };

/**
 * @description Creates a successful result with the provided value.
 * @template T - The type of the value.
 * @param {T} value - The value to include in the successful result.
 * @returns {Result<T, never>} - The successful result with the provided value.
 */
export function ok<T>(value: T): Result<T, never> {
	return { success: true, value };
}

/**
 * @description Creates a failed result with the provided errors.
 * @template T - The type of the value.
 * @template E - The type of the errors, which must extend { type: string; error: Error }.
 * @param {...E[]} errors - The errors to include in the failed result.
 * @returns {Result<T, E>} - The failed result with the provided errors.
 */
export function fail<T, E extends { type: string; error: Error }>(
	...errors: E[]
): Result<T, E> {
	return { success: false, errors };
}

/**
 * @description Type guard to check if an error is of a specific type.
 * @template E - The type of the errors, which must extend { type: string }.
 * @param {E} err - The error to check.
 * @param {E["type"]} type - The type to check against.
 * @returns {err is E} - True if the error is of the specified type, false otherwise.
 */
export function isErrorType<E extends { type: string }>(
	err: E,
	type: E['type'],
): err is E {
	return err.type === type;
}
