import { store } from "@/app/state/store";
import { setRefreshDate } from "@/app/state/slices/modalSlice"
import { setColorScheme } from "@/app/state/slices/colorschemeSlice"
import { setAccountModal } from "@/app/state/slices/modalSlice"
import { logout } from "@/app/state/slices/userdataSlice";
import { performLogout } from "@/app/utils/logoutUtil";
import { bailOut , backToTyping } from "@/app/state/slices/typingdataSlice";

const navigateTo = (path) => {
    if (typeof window !== "undefined") {
        if (window.location.pathname === path) return;
        window.location.assign(path);
    }
}

export const leaderboardAction=()=>{
    navigateTo('/leaderboard')
}
export const loginAction=()=>{
    navigateTo('/login')
}
export const registerAction=()=>{
    navigateTo('/register')
}
export const logoutAction=()=>{
    store.dispatch(logout());
    performLogout();
    navigateTo('/')
}
export const bailoutAction=()=>{
    store.dispatch(bailOut());
    navigateTo('/')
}
export const startAction=()=>{
    store.dispatch(backToTyping());
    navigateTo('/')
}
export const accountAction=(val)=>{
    store.dispatch(setAccountModal({
        value:val
    }))
    navigateTo('/account')
}
export const analyticsAction=()=>{
    navigateTo('/analytics')
}
export const refreshAction=()=>{
    store.dispatch(setRefreshDate({
        newDate : Date.now()
    }))
}
export const changeColorTheme=(val)=>{
    store.dispatch(setColorScheme({
        id:val
    }))
}
export const resetPasswordAction=()=>{
    navigateTo('/resetpassword')
}