import axios, { AxiosRequestConfig } from 'axios';
import { dataResponseTypeAxios } from '../types/utilities';
import { store } from '../store';
import { logout } from '../features/authSlice';

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

const api = axios.create({
	timeout: 54000,
	headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
	(config) => {
		const token = store.getState().auth.token;
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
	resolve: (value: any) => void;
	reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 403) {
			if (!originalRequest._retry) {
				originalRequest._retry = true;
				store.dispatch(logout());
			}
			return Promise.reject(error);
		}

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				}).then((token) => {
					originalRequest.headers.Authorization = `Bearer ${token}`;
					return api(originalRequest);
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const currentToken = store.getState().auth.token;
				if (!currentToken) throw new Error('No token');

				const { data } = await axios.post(
					`${apiUrl}/auth/refresh`,
					{},
					{
						headers: { Authorization: `Bearer ${currentToken}` },
					},
				);

				const newToken = data.token ?? data.access_token;
				if (!newToken) throw new Error('No token in refresh response');

				store.dispatch({ type: 'auth/setToken', payload: newToken });
				processQueue(null, newToken);
				originalRequest.headers.Authorization = `Bearer ${newToken}`;
				return api(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				store.dispatch(logout());
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);

function getContentConfig(data?: any): AxiosRequestConfig {
	if (data instanceof FormData) {
		return { headers: { 'Content-Type': 'multipart/form-data' } };
	}
	return {};
}

export async function axiosGetDefault(ruta: string, params = {}) {
	const dataResponse: dataResponseTypeAxios = { resp: {}, status: -1 };
	try {
		const res = await api.get(`${apiUrl}/${ruta}`, { params });
		dataResponse.resp = res.data;
		dataResponse.status = res.status;
	} catch (error: any) {
		dataResponse.resp = {};
		dataResponse.status = error?.response?.status ?? -1;
	}
	return dataResponse;
}

export async function axiosGetSlice(ruta: string, params = {}) {
	const res = await api.get(`${apiUrl}/${ruta}`, { params });
	return res.data;
}

export async function axiosPostDefault(ruta: string, data: any = {}) {
	const res = await api.post(`${apiUrl}/${ruta}`, data, getContentConfig(data));
	return res.data;
}

export async function axiosPostSlice(ruta: string, data: any = {}) {
	const res = await api.post(`${apiUrl}/${ruta}`, data, getContentConfig(data));
	return res.data;
}

export async function axiosPutDefault(ruta: string, data: any = {}) {
	const res = await api.put(`${apiUrl}/${ruta}`, data, getContentConfig(data));
	return res.data;
}

export async function axiosPutSlice(ruta: string, data: any = {}) {
	const res = await api.put(`${apiUrl}/${ruta}`, data, getContentConfig(data));
	return res.data;
}

export async function axiosDeleteSlice(ruta: string) {
	const res = await api.delete(`${apiUrl}/${ruta}`);
	return res.data;
}
