"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.watchAndCompile = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const createNodeFileSystem_1 = require("../../vfs/createNodeFileSystem");
const logger_1 = require("../../context/logger");
const parseConfig_1 = require("../../config/parseConfig");
const zod_1 = require("zod");
let abortController = null;
async function processWatchEvent(event, logger, Args, Errors, Fs, config, watchPath, compile) {
    // Only handle .tact or tact.config.json changes
    if (!event.filename ||
        (!event.filename.endsWith(".tact") &&
            event.filename !== "tact.config.json")) {
        return;
    }
    logger.info(`🔄 Change detected in ${event.filename}, rebuilding...`);
    // Cancel previous compilation if it's still running
    if (abortController) {
        abortController.abort();
    }
    abortController = new AbortController();
    // Small delay to batch up rapid-fire changes
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
        // Create a fresh file system instance each time
        const freshFs = (0, createNodeFileSystem_1.createNodeFileSystem)(Fs.root, false);
        // Check if the changed file still exists
        const changedFilePath = (0, path_1.join)(watchPath, event.filename);
        if (!freshFs.exists(changedFilePath)) {
            logger.error(`❌ File not found after change: ${event.filename}`);
            return;
        }
        // If it's the config file, parse a new config
        if (event.filename === "tact.config.json") {
            const configText = freshFs
                .readFile(changedFilePath)
                .toString("utf-8");
            try {
                config = (0, parseConfig_1.parseConfig)(configText);
            }
            catch (e) {
                if (e instanceof zod_1.ZodError) {
                    logger.error(`❌ Config error: ${e.toString()}`);
                }
                else {
                    throw e;
                }
                return;
            }
        }
        // Run the compile process
        await compile(Args, Errors, freshFs, config, abortController.signal);
        logger.info("✅ Build completed successfully");
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.name === "AbortError" || error.message === "AbortError") {
                logger.info("🛑 Build cancelled");
            }
            else {
                logger.error(`❌ Build failed: ${error.message}`);
            }
        }
        else {
            logger.error("❌ Build failed with unknown error");
        }
    }
}
const watchAndCompile = async (Args, Errors, Fs, config, watchPath, compile) => {
    const logger = new logger_1.Logger(Args.single("quiet") ? logger_1.LogLevel.NONE : logger_1.LogLevel.INFO);
    logger.info("👀 Watching for changes...");
    try {
        // Start watching the directory
        const watcher = (0, promises_1.watch)(watchPath, { recursive: true });
        // Perform an initial compilation
        await compile(Args, Errors, Fs, config);
        logger.info("✅ Initial build completed successfully");
        // Process events as they come in
        for await (const event of watcher) {
            await processWatchEvent(event, logger, Args, Errors, Fs, config, watchPath, compile);
        }
    }
    catch (error) {
        if (error instanceof Error) {
            logger.error(`❌ Watch mode error: ${error.message}`);
        }
        else {
            logger.error("❌ Watch mode error: Unknown error occurred");
        }
        process.exit(1);
    }
};
exports.watchAndCompile = watchAndCompile;
