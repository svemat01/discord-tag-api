import axios from "axios";
import { discordREST, GLOBALS, redisClient } from "..";
import { APIUser, Routes } from "discord-api-types/v10";
import { logger } from "../logger";
import { DiscordAPIError } from "@discordjs/rest";

const redisKey = "discord_tag:";

export const getTag = async (
    userId: string
): Promise<
    | {
          status: "not found" | "error";
      }
    | {
          status: "found";
          tag: string;
      }
> => {
    let tag = await redisClient.get(redisKey + userId);

    if (tag) logger.debug(`Found tag in redis ${tag}`);

    if (tag === "NOT_FOUND") {
        return { status: "not found" };
    }

    if (!tag) {
        try {
            logger.debug(`Sending request to Discord for ${userId}`);
            const user = (await discordREST.get(
                Routes.user(userId)
            )) as APIUser;

            tag = `${user.username}#${user.discriminator}`;

            redisClient.set(redisKey + userId, tag);
            redisClient.expire(redisKey + userId, GLOBALS.TAG_TTL);
        } catch (error) {
            if (error instanceof DiscordAPIError) {
                if (error.code === 10013) {
                    redisClient.set(redisKey + userId, "NOT_FOUND");
                    redisClient.expire(redisKey + userId, GLOBALS.TAG_TTL);
                    return {
                        status: "not found",
                    };
                }

                logger.error("Discord API error", error);
            } else {
                logger.error({ error });
            }
        }
    }

    if (!tag) return { status: "error" };

    return {
        status: "found",
        tag,
    };
};
