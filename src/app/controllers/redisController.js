import {validateUsername} from "@/app/utils/authValidation.js";
import { connectRedis } from "@/app/init/redis.js";

const fetchParagraph = async (payload) => {
  const redis = await connectRedis();
  const paragraph = await redis.get(payload.key);
  return paragraph;
};

const fetchLeaderboad = async (payload) => {
  const redis = await connectRedis();
  const leaderboard = await redis.get(payload.key);
  return JSON.parse(leaderboard);
}

const fetchUsername = async (payload) => {
  if(!payload || !payload.key) {
    throw new Error('Username is required');
  }
  const validate = validateUsername(payload.key);
  if(!validate.success) {
    throw new Error(validate.message);
  }
  const redis = await connectRedis();
  const exists = await redis.exists(`username:${validate.data}`);
  return exists === 1;
}

const redisController = {
  fetchParagraph,
  fetchLeaderboad,
  fetchUsername
};

export default redisController;


