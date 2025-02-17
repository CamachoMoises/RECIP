import axios from 'axios';
import { dataResponseTypeAxios } from '../types/utilities';
import { store } from '../store';
import { logout } from '../features/authSlice';
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

export async function axiosGetDefault(ruta: string, params = {}) {
    const token = store.getState().auth.token;
    const axiosInstance = axios.create({
        timeout: 54000,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },

    });

    const dataResponse: dataResponseTypeAxios = {
        resp: {},
        status: -1
    }
    try {
        const res = await axiosInstance.get(
            `${apiUrl}/${ruta}`,
            { params: params }
        );

        dataResponse.resp = res.data
        dataResponse.status = res.status
    } catch (error: any) {

        if (error?.response?.status === 403) {
            store.dispatch(logout());
            // window.location.reload();
        }
        const errorStatus = error?.response?.status
        dataResponse.resp = {}
        dataResponse.status = errorStatus
    }
    return dataResponse
}

export async function axiosGetSlice(ruta: string, params = {}) {
    const token = store.getState().auth.token;
    const axiosInstance = axios.create({
        timeout: 54000,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },

    });
    try {

        const res = await axiosInstance.get(
            `${apiUrl}/${ruta}`,
            { params: params }
        );

        return res.data
    } catch (error: any) {
        handleError(error)
    }

}

export async function axiosPostDefault(ruta: string, data: any = {}) {
    const token = store.getState().auth.token;
    const axiosInstance = axios.create({
        timeout: 50000,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const res = await axiosInstance.post(
        `${apiUrl}/${ruta}`,
        data
    );
    return res.data

}
export async function axiosPostSlice(ruta: string, data: any = {}) {
    const token = store.getState().auth.token;
    const axiosInstance = axios.create({
        timeout: 50000,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    try {
        const res = await axiosInstance.post(
            `${apiUrl}/${ruta}`,
            data
        );
        return res.data
    } catch (error: any) {
        handleError(error)
    }
}

export async function axiosPutDefault(ruta: string, data: any = {}) {
    const token = store.getState().auth.token;
    const axiosInstance = axios.create({
        timeout: 50000,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    const res = await axiosInstance.put(
        `${apiUrl}/${ruta}`,
        data
    );
    return res.data
}
export async function axiosPutSlice(ruta: string, data: any = {}) {
    const token = store.getState().auth.token;
    const axiosInstance = axios.create({
        timeout: 50000,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });
    try {
        const res = await axiosInstance.put(
            `${apiUrl}/${ruta}`,
            data
        );
        return res.data
    } catch (error: any) {
        handleError(error)
    }
}

const handleError = (error: any) => {
    console.log('Error GET Axios OJO!', error?.response?.status);
    if (error?.response?.status === 403) {
        store.dispatch(logout());
        // window.location.reload();
    }
    throw new Error(`${error.response.status} : ${error.response.data} `);
}