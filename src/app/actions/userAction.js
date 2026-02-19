"use server";

import userController from "@/app/controllers/userController";

export async function checkUsernameAvailabilityAction(payload) {
  try {
    const data = await userController.checkUsernameAvailability(payload);
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

export async function updateUsernameAction(payload) {
    try {
        const data =  await userController.updateUsername(payload);
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

export async function resetPasswordAction(payload) {
    try {
        const data =  await userController.resetPassword(payload);
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

export async function deleteAccountAction(payload) {
    try {
        const data =  await userController.deleteAccount(payload);
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