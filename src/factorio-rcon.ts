import { Rcon, RconOptions } from 'rcon-client';
import * as validators from './validation';
import * as parsers from './parser';

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

    time(): Promise<string> {
        return this.send('/time').then((v) => new parsers.StringParser(v).trim().value());
    }
}
