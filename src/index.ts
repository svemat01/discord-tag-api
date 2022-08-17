import express from "express";
import { config as dotEnvConfig } from "dotenv";
import { logger } from "./logger";
import { tagRouter } from "./routers/tag";
import { createClient } from "redis";
import { REST } from "@discordjs/rest";

dotEnvConfig();

export const GLOBALS = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN!,
    REDIS_URL: process.env.REDIS_URL!,
    TAG_TTL: process.env.TAG_TTL ? parseInt(process.env.TAG_TTL) : 24 * 60 * 60,
    DEBUG: process.env.DEBUG === "true",
};
const requiredGlobals: (keyof typeof GLOBALS)[] = [
    "DISCORD_TOKEN",
    "REDIS_URL",
];

for (const value of requiredGlobals) {
    if (!GLOBALS[value]) {
        throw new Error(`Missing ENV value: ${value}`);
    }
}

export const redisClient = createClient({
    url: GLOBALS.REDIS_URL,
});

export const discordREST = new REST({ version: "10" }).setToken(
    GLOBALS.DISCORD_TOKEN
);

const app = express();

if (GLOBALS.DEBUG) {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`, req.headers);
        next();
    });
}

app.get("/", function (req, res) {
    res.send("Hello World");
});

app.use("/tag", tagRouter);

(async () => {
    logger.info("Starting redis");
    await redisClient.connect();

    logger.info("Loading express");
    app.listen(3000, () => {
        logger.info("Started Express");
    });
})();
