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
    uuid: string | null;
    createdAt?: string;
    updatedAt?: string;
}
export type courseStudent = {
    id: number;
    course_id: number;
    student_id: number;
    type_trip: number;
    license: number;
    regulation: number;
    course?: course
    student?: student
    date: string;
    code: string;
    createdAt: string;
    updatedAt: string;

}

export interface UserState {
    usersList: user[];
    studentList: user[];
    instructorList: user[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

export interface CourseState {
    courseList: course[];
    courseSelected: course | null;
    courseStudent: courseStudent | null;
    lastCourseStudentCreatedId: number | null;

    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    lastCreatedId: number | null;
}

export interface subjectState {
    subjectList: subject[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    lastCreatedId: number | null;
    error: string | null;
    maxOrderNumber: number | null;

}

