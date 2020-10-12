import { Rcon, RconOptions } from 'rcon-client';
import * as validators from './validation';
import * as parsers from './parser';
import { PlayerEntry } from './types';

export const Defaults = {
    HOST: 'localhost',
    PORT: 25575,
    TIMEOUT: 5000,
    PASSWORD: '',
};

export class FactorioRcon extends Rcon {
    constructor(options: RconOptions) {
        const {
            host = Defaults.HOST,
            port = Defaults.PORT,
            timeout = Defaults.TIMEOUT,
            password = Defaults.PASSWORD,
            ...rest
        } = options;

        super({
            host,
            port,
            timeout,
            password,
            ...rest,
        });
    }

    static async connect(config: RconOptions): Promise<FactorioRcon> {
        const factorioRcon = new FactorioRcon(config);
        return factorioRcon.connect();
    }

    /**
     * Send a command or chat message to the server without any modification of the request and response.
     * Commands must be prefixed with a slash (eg. /time) or else they will be sent as a chat message.
     */
    raw(command: string): Promise<string> {
        return this.send(command);
    }

    help(): Promise<string> {
        return this.send('/help');
    }

    save(name: string): Promise<string> {
        validators.validateUsername(name);
        return this.send(`/save ${name}`);
    }

    promote(name: string): Promise<string> {
        validators.validateUsername(name);
        return this.send(`/promote ${name}`);
    }

    seed(): Promise<string> {
        return this.send('/seed');
    }

    /** Returns server elapsed time as a duration string such as "10 seconds" */
    time(): Promise<string> {
        // todo parse and return as a numeric duration
        return this.send('/time').then((v) => new parsers.StringParser(v).trim().value());
    }

    /**
     * Get player list.
     *
     * sample:
     *
     * ```
     * Players (1):
     *   Dicez (online)
     *   Dimez
     * ```
     */
    players(): Promise<PlayerEntry[]> {
        return this.send('/players').then((str) =>
            str
                .split('\n')
                .slice(1) // first string contains player count
                .filter(Boolean)
        );
    }
}
