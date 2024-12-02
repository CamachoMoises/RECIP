import axios from 'axios';
import { dataResponseTypeAxios } from '../types/utilities';
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;


export async function axiosGetDefault(ruta: string, params = {}) {
    const axiosInstance = axios.create({
        timeout: 54000,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const dataResponse: dataResponseTypeAxios = {
        resp: {},
        status: -1
    }
    // try {
    const res = await axiosInstance.get(
        `${apiUrl}/${ruta}`,
        { params: params }
    );
    dataResponse.resp = res.data
    dataResponse.status = res.status
    // } catch (error: any) {
    //     console.log('Error GET Axios OJO!', error?.response?.status);
    //     const errorStatus = error?.response?.status
    //     dataResponse.resp = {}
    //     dataResponse.status = errorStatus
    // }
    return dataResponse
}

export async function axiosPostDefault(ruta: string, data: any = {}) {

    const axiosInstance = axios.create({
        timeout: 50000,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
        },
    });
    // try {
    const res = await axiosInstance.post(
        `${apiUrl}/${ruta}`,
        data
    );
    return res.data
    // } catch (error: any) {
    //     console.log('Error POST Axios', error?.response?.status);
    //     const errorStatus = error
    //     if (errorStatus === 401 || !errorStatus) {
    //         return [{ error: 401 }];
    //     }
    // }
}

export async function axiosPutDefault(ruta: string, data: any = {}) {

    const axiosInstance = axios.create({
        timeout: 50000,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
        },
    });
    // try {
    const res = await axiosInstance.put(
        `${apiUrl}/${ruta}`,
        data
    );

    return res.data
    // } catch (error: any) {
    //     console.log('Error PUT Axios', error);
    //     const errorStatus = error?.response?.status
    //     if (errorStatus === 401 || !errorStatus) {
    //         return [{ error: 401 }];
    //     }
    // }
}