import { store } from "@/app/state/store";
import { logout } from "@/app/state/slices/userdataSlice";
import { setRefreshDate } from "@/app/state/slices/modalSlice";

export const performLogout = () => {
  try {
    if (typeof window === "undefined") return false;

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    store.dispatch(logout());
    store.dispatch(setRefreshDate({ newDate: null }));

    return true;
  } 
  catch (error) {
    return false;
  }
};