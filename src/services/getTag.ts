import axios from "axios";
import { discordREST, GLOBALS, redisClient } from "..";
import { APIUser, Routes } from "discord-api-types/v10";
import { logger } from "../logger";


export const getTag = async (userId: string): Promise<string | null> => {
    let result = await redisClient.get(userId);
    if (result) logger.debug(`Found tag in redis ${result}`);

    if (!result) {
        try {
            logger.debug(`Sending request to Discord for ${userId}`);
            const user = (await discordREST.get(
                Routes.user(userId)
            )) as APIUser;
            result = `${user.username}#${user.discriminator}`;

            redisClient.set(userId, result);
            redisClient.expire(userId, GLOBALS.TAG_TTL);
        } catch (error) {}
    }

    return result;
};
