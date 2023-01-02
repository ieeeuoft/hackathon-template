import axios, { AxiosResponse } from "axios";

// Re-export the response type, so it's available without needing to import axios
export type { AxiosResponse } from "axios";

let SERVER_URL: string;

if (process.env.NODE_ENV === "development") {
    if (!process.env.REACT_APP_DEV_SERVER_URL) {
        throw new Error(
            "REACT_APP_DEV_SERVER_URL must be set (probably to http://localhost:8000)"
        );
    }

    SERVER_URL = process.env.REACT_APP_DEV_SERVER_URL?.replace(/\/$/, "");
} else {
    SERVER_URL = "";
}

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

export const cleanURI = (uri: string) => {
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

export const stripHostname = (url: string): string => {
    const parsed = new URL(url);
    return parsed.pathname + parsed.search + parsed.hash;
};

export const stripHostnameReturnFilters = (
    url: string | null
): { path: string; filters?: { [key: string]: any } } => {
    if (url) {
        const parsed = new URL(url);
        const filters: { [key: string]: any } = {};
        if (parsed.search && filters) {
            parsed.searchParams.forEach((val, key) => (filters[key] = val));
        }
        return Object.keys(filters).length > 0
            ? {
                  path: parsed.pathname,
                  filters,
              }
            : { path: parsed.pathname };
    }
    return { path: "" };
};

export const get = <T>(
    uri: string,
    params?: { [key: string]: any }
): Promise<AxiosResponse<T>> => {
    uri = cleanURI(uri);

    if (params) {
        uri += "?" + new URLSearchParams(params).toString();
    }

    return axios.get<T>(`${SERVER_URL}/${uri}`, makeConfig());
};

export const post = <T>(uri: string, data?: any): Promise<AxiosResponse<T>> => {
    uri = cleanURI(uri);
    return axios.post(`${SERVER_URL}/${uri}`, data, makeConfig());
};

export const patch = <T>(uri: string, data?: any): Promise<AxiosResponse<T>> => {
    uri = cleanURI(uri);
    return axios.patch(`${SERVER_URL}/${uri}`, data, makeConfig());
};
