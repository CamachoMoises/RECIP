import axios from 'axios';
import { dataResponseTypeAxios } from '../types/utilidades';
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
export async function axiosGetDefault(ruta: string, params = {}) {
    const axiosInstance = axios.create({
        timeout: 54000,
        headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${dataCookie?.value}`,
        },
    });
    const dataResponse: dataResponseTypeAxios = {
        resp: {},
        status: -1
    }
    console.log(appName);

    try {
        const res = await axiosInstance.get(
            `${apiUrl}/${ruta}`,
            { params: params }
        );
        dataResponse.resp = res.data
        dataResponse.status = res.status
    } catch (error: any) {
        console.log('Error GET Axios OJO!', error?.response?.status);
        const errorStatus = error?.response?.status
        dataResponse.resp = {}
        dataResponse.status = errorStatus
    }
}