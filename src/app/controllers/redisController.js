import { validateUsername } from "@/app/utils/authValidation.js";
import { connectRedis } from "@/app/init/redis.js";
import { env } from "@/app/init/env.js";

const fetchParagraph = async (payload) => {
  const redis = await connectRedis();
  const paragraph = await redis.get(payload.key);
  return paragraph;
};

const fetchLeaderboad = async (payload) => {
  const redis = await connectRedis();
  const key = (payload?.key && payload.key !== "leaderboard") ? payload.key : env.redis.leaderboardKey;
  const leaderboard = await redis.get(key);
  if (!leaderboard) return [];
  try {
    return JSON.parse(leaderboard);
  } catch (e) {
    return [];
  }
};

const fetchUsername = async (payload) => {
  if(!payload || !payload.key) {
    throw new Error('Username is required');
  }
  const validate = validateUsername(payload.key);
  if(!validate.success) {
    throw new Error(validate.message);
  }
  const redis = await connectRedis();
  const prefix = env.redis.usernameKeyPrefix || 'typo:username:';
  const exists = await redis.exists(`${prefix}${validate.data}`);
  return {
    available: !(exists === 1)
  };
};


const redisController = {
  fetchParagraph,
  fetchLeaderboad,
  fetchUsername
};

export default redisController;


