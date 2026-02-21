"use client";
import { useEffect,useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserData, updateAnalytics} from "@/app/state/slices/userdataSlice";
import { performLogout } from "@/app/utils/logoutUtil";
import { getUserAnalyticsAction } from "@/app/actions/analyticsActions";

const AccountStats = () => {
    const dispatch = useDispatch();
    const refreshDate = useSelector((state) => state.modal.refreshDate);

    const fetchAndUpdateStats = useCallback(async () => {
        const access_token = localStorage.getItem("access_token");
        const refresh_token = localStorage.getItem("refresh_token");
        
        if (!access_token || !refresh_token) {
            return;
        }

        const payload = { 
            access_token: access_token,
            refresh_token: refresh_token
        };

        try {
            const response = await getUserAnalyticsAction(payload);
            if (response?.success && response?.data) {
                const analyticsData = response.data.data.analyticsData || {};
                const userData = response.data.data.userData || {};
                dispatch(updateAnalytics({
                    wpm: analyticsData.wpm || 0,
                    accuracy: analyticsData.accuracy || 0,
                    testTimings: analyticsData.testTimings || 0,
                    lastTestTaken: analyticsData.lastTestTaken || null,
                    totalPar: analyticsData.totalPar || 0,
                    maxStreak: analyticsData.maxStreak || 0,
                    progress: analyticsData.progress || []
                }));
                dispatch(updateUserData({
                    email: userData.email || '',
                    username: userData.username || '',
                    firstName: userData.firstName || '',
                    lastName: userData.lastName || '',
                    lastLogin: userData.lastLogin || null
                }));
                
            } 
            else {
                if (response.status === 401 || response.status === 403) {
                    performLogout();
                }
            }
        } catch (error) {
            console.error("Error in AccountStats:", error);
        }
    },[dispatch]);
    useEffect(() => {
        fetchAndUpdateStats();
    }, [fetchAndUpdateStats, refreshDate]);
    return null;
};

export default AccountStats;
