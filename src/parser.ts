/* Utility functions to parse text responses from the server */

interface Chainable<T> {
    value: () => T;
}

abstract class BaseChainer<T = any> implements Chainable<T> {
    protected v: T;

    constructor(val: T) {
        this.v = val;
    }

    protected get type() {
        return typeof this.v;
    }

    value(): T {
        return this.v;
    }
}

export class ArrayParser<T = any> extends BaseChainer<T[]> {
    constructor(val: T[]) {
        super(val);
        if (!Array.isArray(this.v)) {
            throw new Error(`Tried to create an ArrayParser with a "${this.type}"`);
        }
    }

    map<OutputType>(
        callback: (i: T, idx: number, array: T[]) => OutputType
    ): ArrayParser<OutputType> {
        return new ArrayParser<OutputType>(this.v.map(callback));
    }

    filter(callback: (i: T, idx: number, array: T[]) => boolean): ArrayParser<T> {
        return new ArrayParser<T>(this.v.filter(callback));
    }
}

export class StringParser extends BaseChainer<string> {
    trim(): StringParser {
        return new StringParser(this.v.trim());
    }

    split(splitOn: string = '\n'): ArrayParser<string> {
        return new ArrayParser<string>(this.v.split(splitOn));
    }
}
