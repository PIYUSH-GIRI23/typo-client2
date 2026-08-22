import { validateLoginInput, validateRegisterInput } from "@/app/utils/authValidation.js";
import { env } from "@/app/init/env.js";

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

const loginController = async (payload) => {
  if(!payload || !payload.identifier || !payload.password) {
    throw new Error('Identifier and password are required');
  }
  const validation = validateLoginInput(payload);
  if (!validation.success) {
    throw new Error(validation.message);
  }

  const { identifier, password, rememberMe = false } = validation.data;

  const url = `${env.serverUrl}${env.userRoutes.login}`;
  const forwardHeaders = await getForwardHeaders();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...forwardHeaders,
    },
    body: JSON.stringify({ identifier, password, rememberMe }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Login failed");
    error.statusCode = response.status;
    throw error;
  }

  return data;
};

const registerController = async (payload) => {
  if(!payload || !payload.email || !payload.password || !payload.confirmPassword || !payload.firstName || !payload.lastName || !payload.username) {
    throw new Error('All fields are required for registration');
  }
  const validation = validateRegisterInput(payload);
  if (!validation.success) {
    throw new Error(validation.message);
  }

  const {
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    username,
    rememberMe = false,
  } = validation.data;

  if (password !== confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const url = `${env.serverUrl}${env.userRoutes.signup}`;
  const forwardHeaders = await getForwardHeaders();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...forwardHeaders,
    },
    body: JSON.stringify({
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      username,
      rememberMe,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Registration failed");
    error.statusCode = response.status;
    throw error;
  }
  return data;
};

const authController = {
  loginController,
  registerController,
};

export default authController;