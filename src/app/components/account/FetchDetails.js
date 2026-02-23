"use client";
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserData, updateAnalytics } from "@/app/state/slices/userdataSlice";
import { performLogout } from "@/app/utils/logoutUtil";
import { getUserAnalyticsAction } from "@/app/actions/analyticsAction";

const AccountStats = () => {

    const refreshDate = useSelector((state) => state.modal.refreshDate);
    const dispatch = useDispatch();
    const isFirstRender = useRef(true); 

    const storeNewTokens = (response) => {
        const accessToken = response?.newTokens?.accessToken;
        const refreshToken = response?.newTokens?.refreshToken;

        if (accessToken) localStorage.setItem("access_token", accessToken);
        if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    };

    useEffect(() => {

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const fetchAndUpdateStats = async () => {
            const access_token = localStorage.getItem("access_token");
            const refresh_token = localStorage.getItem("refresh_token");

            if (!access_token || !refresh_token) return;

            try {
                const response = await getUserAnalyticsAction({
                    access_token,
                    refresh_token
                });
                console.log("Fetched user analytics:", response);
                storeNewTokens(response);

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
                        lastLogin: userData.lastLogin || null,
                        dateOfJoining: userData.dateOfJoining || null
                    }));

                } else if (response.status === 401 || response.status === 403) {
                    performLogout();
                }

            } catch (error) {
                console.error("Error in AccountStats:", error);
            }
        };

        fetchAndUpdateStats();

    }, [refreshDate, dispatch]);

    return null;
};

export default AccountStats;