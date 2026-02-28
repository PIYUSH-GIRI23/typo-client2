import {validateUsername} from "@/app/utils/authValidation.js";
import {env} from "@/app/init/env.js";

const getUserAnalytics = async(payload) => {
  const url = `${env.serverUrl}${env.analyticsRoutes.userAnalytics}`;

  const access_token = payload.access_token;
  const refresh_token = payload.refresh_token;
  if(!access_token || !refresh_token) {
    const error = new Error('Authentication tokens are required');
    error.status = 401;
    throw error;
  }

  const token={
    access_token,
    refresh_token
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token' : JSON.stringify(token)
    },
  });
  const data = await response.json();
  if(response.status === 401 || response.status === 403) {
    const error = new Error(data.message || 'Unauthorized');
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user analytics');
  }

  const new_access_token = response.headers.get('New-Access-Token');
  const new_refresh_token = response.headers.get('New-Refresh-Token');
  const newTokens = {
    accessToken: new_access_token || null,
    refreshToken: new_refresh_token || null
  };

  return { data, newTokens };
};
const getAccountAnalytics = async(payload) => {
  if(!payload || !payload.username) {
    throw new Error('Username is required');
  }
  const validation = validateUsername(payload.username);
  if (!validation.success) {
    throw new Error(validation.message);
  }
  const url = `${env.serverUrl}${env.analyticsRoutes.accountAnalytics}${'?username=' + encodeURIComponent(validation.data)}`;

  const access_token = payload.access_token;
  const refresh_token = payload.refresh_token;
  if(!access_token || !refresh_token) {
    const error = new Error('Authentication tokens are required');
    error.status = 401;
    throw error;
  }

  const token={
    access_token,
    refresh_token
  }
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'token' : JSON.stringify(token)
    },
  });

  const data = await response.json();

  if(response.status === 401 || response.status === 403) {
    const error = new Error(data.message || 'Unauthorized');
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch account analytics');
  }

  const new_access_token = response.headers.get('New-Access-Token');
  const new_refresh_token = response.headers.get('New-Refresh-Token');
  const newTokens = {
    accessToken: new_access_token || null,
    refreshToken: new_refresh_token || null
  };

  return { data, newTokens };
};
const resetAccountAnalytics = async(payload) => {
  const url = `${env.serverUrl}${env.analyticsRoutes.resetAnalytics}`;

  const access_token = payload.access_token;
  const refresh_token = payload.refresh_token;
  if(!access_token || !refresh_token) {
    const error = new Error('Authentication tokens are required');
    error.status = 401;
    throw error;
  }

  const token={
    access_token,
    refresh_token
  }
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'token' : JSON.stringify(token)
    },
  });

  const data = await response.json();
  if(response.status === 401 || response.status === 403) {
    const error = new Error(data.message || 'Unauthorized');
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to reset account analytics');
  }

  const new_access_token = response.headers.get('New-Access-Token');
  const new_refresh_token = response.headers.get('New-Refresh-Token');
  const newTokens = {
    accessToken: new_access_token || null,
    refreshToken: new_refresh_token || null
  };

  return { data, newTokens };
};
const updateAccountAnalytics = async(payload) => {
  const url = `${env.serverUrl}${env.analyticsRoutes.updateAnalytics}`;

  const access_token = payload.access_token;
  const refresh_token = payload.refresh_token;
  if(!access_token || !refresh_token) {
    const error = new Error('Authentication tokens are required');
    error.status = 401;
    throw error;
  }

  const token={
    access_token,
    refresh_token
  }

  const { wpm, accuracy, testTimings, maxStreak, lastTestTaken } = payload;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'token' : JSON.stringify(token)
    },
    body: JSON.stringify({ wpm, accuracy, testTimings, maxStreak, lastTestTaken })
  });
  const data = await response.json();
  if(response.status === 401 || response.status === 403) {
    const error = new Error(data.message || 'Unauthorized');
    error.status = response.status;
    throw error;
  }

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update account analytics');
  }

  const new_access_token = response.headers.get('New-Access-Token');
  const new_refresh_token = response.headers.get('New-Refresh-Token');
  const newTokens = {
    accessToken: new_access_token || null,
    refreshToken: new_refresh_token || null
  };

  return { data, newTokens };
};

const analyticsController = {
  getUserAnalytics,
  getAccountAnalytics,
  resetAccountAnalytics,
  updateAccountAnalytics,
};

export default analyticsController;