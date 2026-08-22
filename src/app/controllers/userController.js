import {validateEmail, validateResetPasswordInput, validateUsername, validateDeleteAccountInput} from "@/app/utils/authValidation.js";
import {env} from "@/app/init/env.js";

const getForwardHeaders = async () => {
  try {
    const { headers } = await import("next/headers");
    const reqHeaders = await headers();
    const forwardHeaders = {};
    const ua = reqHeaders.get("user-agent");
    const cfIp = reqHeaders.get("cf-connecting-ip");
    const vercelIp = reqHeaders.get("x-vercel-forwarded-for");
    const forwardedFor = reqHeaders.get("x-forwarded-for");
    const realIp = reqHeaders.get("x-real-ip");

    if (ua) forwardHeaders["user-agent"] = ua;
    if (cfIp) forwardHeaders["cf-connecting-ip"] = cfIp;
    if (vercelIp) forwardHeaders["x-vercel-forwarded-for"] = vercelIp;
    if (forwardedFor) forwardHeaders["x-forwarded-for"] = forwardedFor;
    if (realIp) forwardHeaders["x-real-ip"] = realIp;

    return forwardHeaders;
  } catch (e) {
    return {};
  }
};

const checkUsernameAvailability = async(payload) => {
  if(!payload || !payload.username) {
    throw new Error('Username is required');
  }
  const validation = validateUsername(payload.username);
  if (!validation.success) {
    throw new Error(validation.message);
  }
  const url = `${env.serverUrl}${env.userRoutes.checkUsername}${'?username=' + encodeURIComponent(validation.data)}`;
  const forwardHeaders = await getForwardHeaders();

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...forwardHeaders,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to check username availability');
  }
  return data;
};
const sendOTP = async(payload) => {
  if(!payload || !payload.email) {
    throw new Error('Email is required');
  }
  const validation = validateEmail(payload.email);
  if (!validation.success) {
    throw new Error(validation.message);
  }

  const url = `${env.serverUrl}${env.userRoutes.sendOtp}`;
  const forwardHeaders = await getForwardHeaders();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...forwardHeaders,
    },
    body: JSON.stringify({ email: validation.data })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send OTP');
  }

  return data;
};
const resetPassword = async(payload) => {
  if(!payload || !payload.email || !payload.otp || !payload.password || !payload.confirmPassword) {
    throw new Error('All fields are required');
  }
  const validation = validateResetPasswordInput(payload);
  if (!validation.success) {
    throw new Error(validation.message);
  }
  
  const url = `${env.serverUrl}${env.userRoutes.resetPassword}`;
  const forwardHeaders = await getForwardHeaders();
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...forwardHeaders,
    },
    body: JSON.stringify(validation.data)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to reset password');
  }
  
  return data;
};

const updateUsername = async(payload) => {
  if(!payload || !payload.newUsername) {
    throw new Error('New username is required');
  }
  const validation = validateUsername(payload.newUsername);
  if (!validation.success) {
    throw new Error(validation.message);
  }

  const url = `${env.serverUrl}${env.userRoutes.updateUsername}`;

  const access_token = payload.access_token;
  const refresh_token = payload.refresh_token;
  if(!access_token || !refresh_token) {
    const error = new Error('Authentication tokens are required');
    err.status = 401;
    throw error;
  }

  const token={
    access_token,
    refresh_token
  }
  const forwardHeaders = await getForwardHeaders();

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'token' : JSON.stringify(token),
      ...forwardHeaders,
    },
    body: JSON.stringify({ newUsername: validation.data })
  });
  const data = await response.json();

  if(response.status === 401 || response.status === 403) {
    const error = new Error(data.message || 'Unauthorized');
    error.status = response.status;
    throw error;
  }
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update username');
  }

  const new_access_token = response.headers.get('New-Access-Token');
  const new_refresh_token = response.headers.get('New-Refresh-Token');
  const newTokens = {
    accessToken: new_access_token || null,
    refreshToken: new_refresh_token || null
  };

  return { data, newTokens };
}
const deleteAccount = async(payload) => {
  if(!payload || !payload.password || !payload.confirmPassword) {
    throw new Error('Password and confirm password are required');
  }
  const validation = validateDeleteAccountInput(payload);
  if (!validation.success) {
    throw new Error(validation.message);
  }

  const url = `${env.serverUrl}${env.userRoutes.deleteAccount}`;

  const access_token = payload.access_token;
  const refresh_token = payload.refresh_token;
  if(!access_token || !refresh_token) {
    const error = new Error('Authentication tokens are required');
    err.status = 401;
    throw error;
  }

  const token={
    access_token,
    refresh_token
  }
  const forwardHeaders = await getForwardHeaders();

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'token' : JSON.stringify(token),
      ...forwardHeaders,
    },
    body: JSON.stringify(validation.data)
  });
  const data = await response.json();

  if(response.status === 401 || response.status === 403) {
    const error = new Error(data.message || 'Unauthorized');
    error.status = response.status;
    throw error;
  }
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete account');
  }

  const new_access_token = response.headers.get('New-Access-Token');
  const new_refresh_token = response.headers.get('New-Refresh-Token');
  const newTokens = {
    accessToken: new_access_token || null,
    refreshToken: new_refresh_token || null
  };

  return { data, newTokens };
};

const userController = {
  checkUsernameAvailability,
  updateUsername,
  resetPassword,
  deleteAccount,
  sendOTP
};

export default userController;