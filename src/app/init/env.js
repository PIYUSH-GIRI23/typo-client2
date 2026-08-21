const ENV = process.env.NODE_ENV || 'development';
const isDevelopment = ENV === 'development';

export const env = {
    env: ENV,
    serverUrl: isDevelopment ? process.env.LOCAL_SERVER_URL : process.env.CLOUD_SERVER_URL,
    
    para: {
        max: parseInt(process.env.MAX_PARA) || 10,
        quote: process.env.QUOTE_KEY || 'qo',
        wordEasyShort: process.env.WORD_KEY_EASY_SHORT || 'wes',
        wordEasyLong: process.env.WORD_KEY_EASY_LONG || 'wel',
        wordHardShort: process.env.WORD_KEY_HARD_SHORT || 'whs',
        wordHardLong: process.env.WORD_KEY_HARD_LONG || 'whl'
    },

    redis: {
        host: isDevelopment ? process.env.LOCAL_REDIS_HOST : process.env.CLOUD_REDIS_HOST,
        port: parseInt(isDevelopment ? process.env.LOCAL_REDIS_PORT : process.env.CLOUD_REDIS_PORT) || 6379,
        password: isDevelopment ? process.env.LOCAL_REDIS_PASSWORD : process.env.CLOUD_REDIS_PASSWORD,
        usernameKeyPrefix: process.env.REDIS_USERNAME_KEY_PREFIX || 'typo:username:',
        leaderboardKey: process.env.REDIS_LEADERBOARD_KEY || 'typo:leaderboard'
    },
 

    userRoutes: {
        signup: process.env.SIGNUP_ROUTE || '/api/users/register',
        login: process.env.LOGIN_ROUTE || '/api/users/login',
        sendOtp: process.env.OTP_ROUTE || '/api/users/send-otp',
        resetPassword: process.env.RESET_PASSWORD_ROUTE || '/api/users/reset-password',
        checkUsername: process.env.CHECK_USERNAME_ROUTE || '/api/users/check-username',
        updateUsername: process.env.UPDATE_USERNAME_ROUTE || '/api/users/update-username',
        deleteAccount: process.env.DELETE_ACCOUNT_ROUTE || '/api/users/delete-account'
    },

    analyticsRoutes: {
        userAnalytics: process.env.USER_ANALYTICS_ROUTE || '/api/analytics/user-analytics',
        accountAnalytics: process.env.ACCOUNT_ANALYTICS_ROUTE || '/api/analytics/account-analytics',
        resetAnalytics: process.env.RESET_ANALYTICS_ROUTE || '/api/analytics/reset-analytics',
        updateAnalytics: process.env.UPDATE_ANALYTICS_ROUTE || '/api/analytics/update-analytics'
    }
};