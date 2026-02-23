"use server";

import redisController from "@/app/controllers/redisController";

export async function fetchParagraphAction(payload) {
  try {
    const data =  await redisController.fetchParagraph(payload);
    return {
      success: true,
      statusCode: 200,
      data:data
    };
  } 
  catch (err) {
    return {
      success: false,
      statusCode: err.statusCode || 500,
      message: err.message || "An error occurred"
    };
  }
}

export async function fetchLeaderboardAction(payload) {
    try {
        const data =  await redisController.fetchLeaderboad(payload);
        return {
            success: true,
            statusCode: 200,
            data:data.data
        };
    } 
    catch (err) {
        return {
            success: false,
            statusCode: err.statusCode || 500,
            message: err.message || "An error occurred"
        };
    }
}

export async function fetchUsernameAction(payload) {
    try {
        const data = await redisController.fetchUsername(payload);
        return {
            success: true,
            statusCode: 200,
            available: data.available
        };
    } 
    catch (err) {
        return {
            success: false,
            statusCode: err.statusCode || 500,
            message: err.message || "An error occurred"
        };
    }
}