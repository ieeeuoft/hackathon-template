import axios from "axios";

export const SERVER_URL =
    process.env.NODE_ENV === "development"
        ? process.env.REACT_APP_DEV_SERVER_URL.replace(/\/$/, "")
        : "";

export const getCsrfToken = () => {
    // When Django serves the react template (and also from some API responses),
    // the CSRF token will be set as a cookie.
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.trim().startsWith("csrftoken=")) {
                return decodeURIComponent(cookie.substr(10));
            }
        }
    }
    return null;
};

export const cleanURI = (uri) => {
    uri = uri.replace(/^\//, ""); // Remove leading slashes
    uri = uri.endsWith("/") ? uri : uri + "/";
    return uri;
};

const makeConfig = () => ({
    headers: {
        "X-CSRFToken": getCsrfToken(),
    },
    withCredentials: true,
});

export const get = (uri) => {
    uri = cleanURI(uri);
    return axios.get(`${SERVER_URL}/${uri}`, makeConfig());
};

export const post = (uri, data) => {
    uri = cleanURI(uri);
    return axios.post(`${SERVER_URL}/${uri}`, data, makeConfig());
};
