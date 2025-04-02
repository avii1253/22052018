import React, { useEffect, useState } from "react";
import axios from "axios";
import "./tailwind.css"

const API_BASE_URL = "http://20.244.56.144/evaluation-service";

const registerUser = async (registrationData) => {
    try {
        console.log("Registering user with data:", registrationData);
        const response = await axios.post(`${API_BASE_URL}/register`, registrationData);
        return response.data;
    } catch (error) {
        console.error("Error registering user:", error.response?.data || error.message);
        return null;
    }
};

const getAuthToken = async (authData) => {
    try {
        console.log("Fetching auth token with data:", authData);
        const response = await axios.post(`${API_BASE_URL}/auth`, authData);
        return response.data.access_token;
    } catch (error) {
        console.error("Error obtaining auth token:", error.response?.data || error.message);
        return null;
    }
};

const fetchUsers = async (token) => {
    try {
        console.log("Fetching users...");
        const response = await axios.get(`${API_BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.users || {};
    } catch (error) {
        console.error("Error fetching users:", error.response?.data || error.message);
        return {};
    }
};

const fetchPosts = async (userId, token) => {
    try {
        console.log(`Fetching posts for user: ${userId}`);
        const response = await axios.get(`${API_BASE_URL}/users/${userId}/posts`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.posts || [];
    } catch (error) {
        console.error(`Error fetching posts for user ${userId}:`, error.response?.data || error.message);
        return [];
    }
};

const SocialMediaAnalytics = () => {
    const [topUsers, setTopUsers] = useState([]);
    const [token, setToken] = useState(localStorage.getItem("accessToken") || null);

    useEffect(() => {
        const initialize = async () => {
            if (token) {
                console.log("Using cached token from local storage.");
            } else {
                const registrationData = {
                    email: "22052018@kiit.ac.in",
                    name: "Avinash Anand",
                    mobileNo: "9523613460",
                    githubUsername: "avii1253",
                    rollNo: "22052018",
                    collegeName: "Kalinga Institute Of Industrial Technology",
                    accessCode: "nwpwrZ",
                };

                const registeredUser = await registerUser(registrationData);
                if (!registeredUser) return;

                const authData = {
                    email: registrationData.email,
                    name: registrationData.name,
                    rollNo: registrationData.rollNo,
                    accessCode: registrationData.accessCode,
                    clientID: registeredUser.clientID,
                    clientSecret: registeredUser.clientSecret,
                };

                const accessToken = await getAuthToken(authData);
                if (!accessToken) return;
                setToken(accessToken);
                localStorage.setItem("accessToken", accessToken);
            }

            const usersData = await fetchUsers(token);
            if (!usersData || Object.keys(usersData).length === 0) return;

            const userPostsCount = [];
            await Promise.all(
                Object.entries(usersData).map(async ([userId, userName]) => {
                    const posts = await fetchPosts(userId, token);
                    userPostsCount.push({ id: userId, name: userName, postCount: posts.length });
                })
            );

            userPostsCount.sort((a, b) => b.postCount - a.postCount);
            const topUsersData = userPostsCount.slice(0, 5);
            setTopUsers(topUsersData);
            localStorage.setItem("topUsers", JSON.stringify(topUsersData));
        };

        const cachedUsers = localStorage.getItem("topUsers");
        if (cachedUsers) {
            setTopUsers(JSON.parse(cachedUsers));
        } else {
            initialize();
        }
    }, [token]);

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Top Users</h1>
            <ul className="bg-white p-4 rounded-lg shadow-md">
                {topUsers.length > 0 ? (
                    topUsers.map((user) => (
                        <li key={user.id} className="py-2 border-b last:border-b-0">
                            <span>{user.name}</span>
                            <span className="post-badge">{user.postCount} posts</span>
                        </li>
                    ))
                ) : (
                    <p className="text-gray-500">No data available.</p>
                )}
            </ul>

        </div>
    );
};

export default SocialMediaAnalytics;