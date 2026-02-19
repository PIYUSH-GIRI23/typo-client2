import { validateLoginInput, validateRegisterInput } from "@/app/utils/authValidation.js";
import { env } from "@/app/init/env.js";

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

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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