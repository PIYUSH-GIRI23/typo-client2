"use server";

import analyticsController from "@/app/controllers/analyticsController";

export async function getUserAnalyticsAction(payload) {
  try {
    const data = await analyticsController.getUserAnalytics(payload);
    return {
      success: true,
      statusCode: 200,
      data:data.data
    };
  } 
  catch (err) {
    return {
      success: false,
      status: err.status || 500,
      message: err.message || "An error occurred"
    };
  }
}

export async function getAccountAnalyticsAction(payload) {
    try {
        const data = await analyticsController.getAccountAnalytics(payload);
        return {
            success: true,
            statusCode: 200,
            data:data.data
        };
    } 
    catch (err) {
        return {
            success: false,
            status: err.status || 500,
            message: err.message || "An error occurred"
        };
    }
}

export async function resetAccountAnalyticsAction() {
    try {
        const data =  await analyticsController.resetAccountAnalytics();
        return {            
            success: true,
            statusCode: 200,
            data:data.data
        };
    } 
    catch (err) {
        return {
            success: false,
            status: err.status || 500,
            message: err.message || "An error occurred"
        };
    }
}

export async function updateAccountAnalyticsAction(payload) {
    try {
        const data = await analyticsController.updateAccountAnalytics(payload);
        return {            
            success: true,
            statusCode: 200,
            data:data.data
        };
    } 
    catch (err) {
        return {
            success: false,
            status: err.status || 500,
            message: err.message || "An error occurred"
        };
    }
}