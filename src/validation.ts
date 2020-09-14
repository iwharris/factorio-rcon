/** Validates an argument, throwing an Error if it does not pass validation. */
type Validator<T> = (arg: T) => void;

export const validateUsername: Validator<string> = (name: string) => {
    if (/s/.test(name)) throw new Error(`Name "${name}" contains whitespace`);
};
