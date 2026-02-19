"use server";

import authController from "@/app/controllers/authController";

export async function loginAction(payload) {
  try {
    const data = await authController.loginController(payload);
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

export async function registerAction(payload) {
  try {
    const data = await authController.registerController(payload);
    return {
      success: true,
      statusCode: 201,
      data : data.data
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
