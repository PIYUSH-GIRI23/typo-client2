import colorSchemeOptions from "@/app/state/colorSchemeOptions";
// 0 = show to all, 1 = show only when logged in, 2 = show only when logged out
const searchData=[
    {
        key: "leaderboard",
        keywords: ["leaderboard", "rank", "ranking", "scores", "top"],
        displayFlag: 0,
        description: "View the leaderboard",
        action:"leaderboardAction"
    },
    {
        key: "login",
        keywords: ["login", "sign in", "account", "signin"],
        displayFlag: 2,
        description: "Sign in to your account",
        action:"loginAction"
    },
    {
        key: "register",
        keywords: ["register", "sign up", "signup", "create account", "account"],
        displayFlag: 2,
        description: "Create a new account",
        action:"registerAction"
    },
    {
        key: "logout",
        keywords: ["logout", "sign out", "signout", "exit", "bye"],
        displayFlag: 1,
        description: "Sign out of your account",
        action:"logoutAction"
    },
    {
        key: "bail out",
        keywords: ["bail out", "stop", "stop typing", "exit test", "quit"],
        displayFlag: 0,
        description: "Stop typing and end the test",
        action:"bailoutAction"
    },
    {
        key: "start",
        keywords: ["start", "begin", "test", "typing", "play"],
        displayFlag: 0,
        description: "Start a new typing test",
        action:"startAction"
    },
    {
        key: "account",
        keywords: ["account","user","username","user name","settings","password","reset","update","delete"],
        displayFlag: 1,
        description: "Review and update account settings",
        action:"accountAction",
        val:1
    },
    {
        key: "analytics",
        keywords: ["analytics","graph","review","score","wpm","accuracy","progress"],
        displayFlag: 1,
        description: "Review user's analytics",
        action:"analyticsAction"
    },
    {
        key: "update username",
        keywords: ["account","user","username","user name","settings","reset","update","credentials"],
        displayFlag: 1,
        description: "Review and update username",
        action:"accountAction",
        val:2,
    },
    {
        key: "delete account",
        keywords: ["account","user","settings","delete"],
        displayFlag: 1,
        description: "Reset or update password",
        action:"accountAction",
        val:3
    },
    {
        key: "reset analytics",
        keywords: ["analytics","reset","delete","reset analytics"],
        displayFlag: 1,
        description: "Reset user's analytics",
        action:"accountAction",
        val:4
    },
    {
        key: "refresh",
        keywords: ["analytics","refresh","userdata","reload","error"],
        displayFlag: 1,
        description: "Refresh user's data",
        action:"refreshAction"
    },
    ...colorSchemeOptions.map((theme) => ({
        key: `${theme.name.toLowerCase().replace(/\s+/g, "-")}-theme`,
        title: `${theme.name} Theme`,
        keywords: ["theme", "color", "scheme", theme.name.toLowerCase()],
        displayFlag: 0,
        description: `Switch theme to ${theme.name}`,
        action: "changeColorTheme",
        val: theme.id,
    }))
]
export default searchData;