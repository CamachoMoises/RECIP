export type dataResponseTypeAxios = {
    resp: any;
    status: number;
};
export type participante = {
    id: number;
    name: string;
    lastName: string;
    nro_doc: number;
    email: string;
    country: string;
    tipo: number;
};

export type moduloTeoria = {
    id: number;
    name: string;
    hours: number;
}

export interface breadCrumbsItems {
    name: string;
    href: string;
    parametros?: [];
}

export interface user {
    createdAt: string;
    doc_number: number;
    email: string;
    id: number;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    last_name: string;
    name: string;
    password?: string;
    phone: string;
    updatedAt: string;
    uuid: string;
}
