"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSingleFileConfig = exports.main = void 0;
exports.run = run;
const path_1 = require("path");
const zod_1 = require("zod");
const createNodeFileSystem_1 = require("../../vfs/createNodeFileSystem");
const createVirtualFileSystem_1 = require("../../vfs/createVirtualFileSystem");
const interpreter_1 = require("../../optimizer/interpreter");
const types_1 = require("../../types/types");
const parseConfig_1 = require("../../config/parseConfig");
const arg_parser_1 = require("../arg-parser");
const error_schema_1 = require("./error-schema");
const logger_1 = require("../logger");
const arg_consumer_1 = require("../arg-consumer");
const tricks_1 = require("../../utils/tricks");
const logger_2 = require("../../context/logger");
const build_1 = require("../../pipeline/build");
const stdlib_1 = __importDefault(require("../../stdlib/stdlib"));
const process_1 = require("process");
const version_1 = require("../version");
const watch_1 = require("./watch");
const main = async () => {
    const Log = (0, logger_1.CliLogger)();
    const Errors = (0, error_schema_1.CliErrors)(Log.log);
    try {
        const argv = process.argv.slice(2);
        await processArgs(Errors, argv);
    }
    catch (e) {
        Errors.unexpected(e);
    }
    if (Log.hadErrors()) {
        // https://nodejs.org/docs/v20.12.1/api/process.html#exit-codes
        process.exit(30);
    }
};
exports.main = main;
const processArgs = async (Errors, argv) => {
    const Parser = (0, arg_parser_1.ArgParser)(Errors);
    const getArgs = ArgSchema(Parser);
    const match = getArgs(argv);
    if (match.kind === "ok") {
        const Args = (0, arg_consumer_1.ArgConsumer)(Errors, match.value);
        await parseArgs(Errors, Args);
    }
    else {
        await showHelp();
    }
};
const ArgSchema = (Parser) => {
    return Parser.tokenizer
        .add(Parser.string("config", "c", "CONFIG"))
        .add(Parser.string("project", "p", "NAME"))
        .add(Parser.boolean("quiet", "q"))
        .add(Parser.boolean("with-decompilation", undefined))
        .add(Parser.boolean("func", undefined))
        .add(Parser.boolean("check", undefined))
        .add(Parser.string("eval", "e", "EXPRESSION"))
        .add(Parser.boolean("version", "v"))
        .add(Parser.boolean("help", "h"))
        .add(Parser.string("output", "o", "DIR"))
        .add(Parser.boolean("watch", "w"))
        .add(Parser.immediate).end;
};
const showHelp = async () => {
    console.log(`Usage
$ tact [...flags] (--config CONFIG | FILE)

Flags
  -c, --config CONFIG         Specify path to config file (tact.config.json)
  -p, --project ...names      Build only the specified project name(s) from the config file
  -q, --quiet                 Suppress compiler log output
  --with-decompilation        Full compilation followed by decompilation of produced binary code
  --func                      Output intermediate FunC code and exit
  --check                     Perform syntax and type checking, then exit
  -e, --eval EXPRESSION       Evaluate a Tact expression and exit
  -o, --output DIR            Specify output directory for compiled files
  -v, --version               Print Tact compiler version and exit
  -h, --help                  Display this text and exit
  -w, --watch                 Watch for changes and recompile

Examples
  $ tact --version
  ${await (0, version_1.getVersion)()}

Learn more about Tact:        https://docs.tact-lang.org
Join Telegram group:          https://t.me/tactlang
Follow X/Twitter account:     https://twitter.com/tact_language`);
};
const parseArgs = async (Errors, Args) => {
    if (Args.single("help")) {
        if (await noUnknownParams(Errors, Args)) {
            await showHelp();
        }
        return;
    }
    if (Args.single("version")) {
        if (await noUnknownParams(Errors, Args)) {
            console.log(await (0, version_1.getVersion)());
            (0, version_1.showCommit)();
        }
        return;
    }
    const expression = Args.single("eval");
    if (expression) {
        if (await noUnknownParams(Errors, Args)) {
            evaluate(expression);
        }
        return;
    }
    const configPath = Args.single("config");
    if (configPath) {
        const normalizedConfigPath = (0, path_1.normalize)((0, path_1.resolve)((0, process_1.cwd)(), configPath));
        const normalizedDirPath = (0, path_1.normalize)((0, path_1.resolve)((0, process_1.cwd)(), (0, path_1.dirname)(configPath)));
        const Fs = (0, createNodeFileSystem_1.createNodeFileSystem)(normalizedDirPath, false);
        if (!Fs.exists(normalizedConfigPath)) {
            Errors.configNotFound(configPath);
            return;
        }
        const configText = Fs.readFile(normalizedConfigPath).toString("utf-8");
        const config = parseConfigSafe(Errors, normalizedConfigPath, configText);
        if (!config) {
            return;
        }
        if (Args.single("watch")) {
            await (0, watch_1.watchAndCompile)(Args, Errors, Fs, config, normalizedDirPath, compile);
        }
        else {
            await compile(Args, Errors, Fs, config);
        }
        return;
    }
    const filePath = Args.single("immediate");
    if (filePath) {
        const normalizedPath = (0, path_1.resolve)((0, process_1.cwd)(), (0, path_1.dirname)(filePath));
        const Fs = (0, createNodeFileSystem_1.createNodeFileSystem)(normalizedPath, false);
        // Handle output directory flag
        const outputDir = Args.single("output");
        const relativeOutputDir = outputDir
            ? (0, path_1.normalize)((0, path_1.join)((0, path_1.dirname)(filePath), outputDir))
            : "./";
        const config = (0, exports.createSingleFileConfig)((0, path_1.basename)(filePath), relativeOutputDir);
        if (Args.single("watch")) {
            await (0, watch_1.watchAndCompile)(Args, Errors, Fs, config, normalizedPath, compile);
        }
        else {
            await compile(Args, Errors, Fs, config);
        }
        return;
    }
    if (await noUnknownParams(Errors, Args)) {
        await showHelp();
    }
};
const parseConfigSafe = (Errors, configPath, configText) => {
    try {
        return (0, parseConfig_1.parseConfig)(configText);
    }
    catch (e) {
        if (!(e instanceof zod_1.ZodError)) {
            throw e;
        }
        Errors.configError(configPath, e.toString());
        return;
    }
};
const createSingleFileConfig = (fileName, outputDir) => ({
    projects: [
        {
            name: fileName,
            path: ensureExtension(fileName),
            output: outputDir,
            options: {
                debug: true,
                external: true,
                ipfsAbiGetter: false,
                interfacesGetter: false,
                safety: {
                    nullChecks: true,
                },
            },
            mode: "full",
        },
    ],
});
exports.createSingleFileConfig = createSingleFileConfig;
const ensureExtension = (path) => {
    return path.endsWith(".tact") ? path : `${path}.tact`;
};
const compile = async (Args, Errors, Fs, rawConfig) => {
    const config = filterConfig(Errors, rawConfig, Args.multiple("project") ?? []);
    if (!config) {
        return;
    }
    const suppressLog = Args.single("quiet") ?? false;
    const logger = new logger_2.Logger(suppressLog ? logger_2.LogLevel.ERROR : logger_2.LogLevel.INFO);
    const flags = (0, tricks_1.entries)({
        checkOnly: Args.single("check"),
        funcOnly: Args.single("func"),
        fullWithDecompilation: Args.single("with-decompilation"),
    });
    const setFlags = flags.filter(([, value]) => value);
    if (setFlags.length > 1) {
        Errors.incompatibleFlags();
    }
    const mode = flags.find(([, value]) => value)?.[0];
    const options = {};
    if (mode) {
        options.mode = mode;
    }
    setConfigOptions(config, options);
    const stdlib = (0, createVirtualFileSystem_1.createVirtualFileSystem)("@stdlib", stdlib_1.default);
    if (await noUnknownParams(Errors, Args)) {
        // TODO: all flags on the cli should take precedence over flags in the config
        // Make a nice model for it instead of the current mess
        // Consider making overwrites right here or something.
        const result = await run({
            logger,
            config,
            project: Fs,
            stdlib,
        });
        if (!result.ok) {
            Errors.setHadErrors();
        }
    }
};
async function run(args) {
    // Resolve projects
    const projects = args.config.projects;
    // Compile
    let success = true;
    let errorMessages = [];
    for (const config of projects) {
        args.logger.info(`💼 Compiling project ${config.name} ...`);
        const built = await (0, build_1.build)({
            config,
            project: args.project,
            stdlib: args.stdlib,
            logger: args.logger,
        });
        success = success && built.ok;
        if (!built.ok && built.error.length > 0) {
            errorMessages = [...errorMessages, ...built.error];
        }
    }
    return { ok: success, error: errorMessages };
}
const filterConfig = (Errors, config, projectNames) => {
    if (projectNames.length === 0) {
        return config;
    }
    // Check that all project names are valid
    for (const name of projectNames) {
        if (!config.projects.find((v) => v.name === name)) {
            Errors.noSuchProject(name);
            return;
        }
    }
    // Filter by names
    return {
        ...config,
        projects: config.projects.filter((v) => projectNames.includes(v.name)),
    };
};
const setConfigOptions = (config, options) => {
    for (const project of config.projects) {
        Object.assign(project, options);
    }
};
const noUnknownParams = async (Errors, Args) => {
    const leftoverArgs = Args.leftover();
    if (leftoverArgs.length === 0) {
        return true;
    }
    for (const argument of leftoverArgs) {
        Errors.unexpectedArgument(argument);
    }
    await showHelp();
    return false;
};
const evaluate = (expression) => {
    const result = (0, interpreter_1.parseAndEvalExpression)(expression);
    switch (result.kind) {
        case "ok":
            console.log((0, types_1.showValue)(result.value));
            process.exit(0);
            break;
        case "error": {
            console.log(result.message);
            process.exit(30);
        }
    }
};
