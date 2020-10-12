import commander from 'commander';
import { FactorioRcon, Defaults } from './factorio-rcon';
import { Rcon } from 'rcon-client/lib';

const { FACTORIO_RCON_VERSION = '' } = process.env;

const parseString = (val: string) => val;
const parseNumber = (val: string) => Number(val);

interface CommandDefinition {
    cmd?: string;
    desc?: string;
    opts?: commander.ExecutableCommandOptions;
}

type RconCommand = keyof Omit<FactorioRcon, keyof Rcon>;

const commandDefinitions: { [P in RconCommand]?: CommandDefinition } = {
    help: {
        desc: 'Prints help on the server',
    },
    promote: {
        desc: 'Promotes a user',
    },
};

/**
 * Enumerates all class functions in FactorioRcon, not including functions inherited from the parent
 * class.
 *
 * Returns an array of strings.
 */
const enumerateCommands = (rcon: FactorioRcon): RconCommand[] => {
    const propNames = Object.getOwnPropertyNames(rcon) as RconCommand[];

    return propNames.filter((name) => {
        if ((name as string) === 'constructor') return false;
        return typeof rcon[name] === 'function';
    });
};

const parseArgs = (args: string[]) => {
    const program = commander
        .version(FACTORIO_RCON_VERSION)
        .description(`A command-line wrapper around Factorio's RCON commands`)
        .option<string>(
            '--host <host>',
            'Hostname or IP of the Factorio server',
            parseString,
            Defaults.HOST
        )
        .option<number>('--port <port>', 'TCP port for Factorio RCON', parseNumber, Defaults.PORT)
        .option<number>(
            '-t, --timeout <timeout>',
            'Connection timeout',
            parseNumber,
            Defaults.TIMEOUT
        )
        .option<string>(
            '-p, --password <password>',
            'RCON password (overrides the FACTORIO_RCON_PASSWORD env variable)',
            parseString,
            process.env.FACTORIO_RCON_PASSWORD
        );

    enumerateCommands(FactorioRcon.prototype).forEach((name: RconCommand) => {
        const def = commandDefinitions[name] || {};
        const { cmd = `${name} [args...]`, desc, opts } = def;

        const command = program.command(cmd, opts);
        if (desc) command.description(desc);

        command.action(() => {
            program.selectedAction = name;
        });
    });

    return program.parse(args);
};

const main = async () => {
    const program = parseArgs(process.argv);

    const { host, port, timeout, password } = program;
    const args = program.args.slice(1);

    const rcon = new FactorioRcon({ host, port, timeout, password });

    const rconCommand = program.selectedAction as RconCommand;

    await rcon.connect();

    console.log(`EXECUTE ${rconCommand} ${args.join(' ')}`);
    const fn = rcon[rconCommand];
    const result = await fn.call<FactorioRcon, any[], Promise<any>>(rcon, ...args);

    console.log(result);
};

main()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error(`Exiting on uncaught error:`, err.message);
        process.exit(err.exitCode || 1);
    });
