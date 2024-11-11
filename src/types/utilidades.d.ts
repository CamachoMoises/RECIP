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

export type courseType = {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}
export type subject = {
    id: number | null;
    name: string;
    order: number;
    status: boolean;
    course?: course;
    course_id: number;
    subject_days?: subject_days[];
    createdAt?: string;
    updatedAt?: string;
}
export type subject_days = {
    id: number | null;
    course_id: number;
    subject_id: number;
    day: number;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export type instructor = {
    id: number | null;
    user_id: number;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export type student = {
    id: number | null;
    user_id: number;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export type course = {
    id: number | null;
    name: string;
    description: string;
    hours: number;
    days: number;
    type: number;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
    course_type: courseType;
}

export interface breadCrumbsItems {
    name: string;
    href: string;
    parametros?: [];
}

export interface user {
    createdAt?: string;
    doc_number: number;
    email: string;
    id: number | null;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    last_name: string;
    name: string;
    student?: student;
    instructor?: instructor;
    password?: string;
    phone: string;
    updatedAt?: string;
    uuid: string | null;
}

export interface UserState {
    usersList: user[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null; // Permitir null y string para evitar problemas de tipo
}

export interface CourseState {
    courseList: course[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null; // Permitir null y string para evitar problemas de tipo
    lastCreatedId: number | null;
}

export interface subjectState {
    subjectList: subject[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    lastCreatedId: number | null;
    error: string | null; // Permitir null y string para evitar problemas de tipo
    maxOrderNumber: number | null;

}

