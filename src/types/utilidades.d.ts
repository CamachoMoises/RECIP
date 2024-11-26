export type dataResponseTypeAxios = {
    resp: any;
    status: number;
};
export type userDocType = {
    id: number;
    name: string;
    symbol: string;
    createdAt: string;
    updatedAt: string;
}
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
export type courseLevel = {
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
    hours: number;
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
    subject?: subject;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export type instructor = {
    id: number | null;
    user_id: number;
    status: boolean;
    user?: user;
    createdAt?: string;
    updatedAt?: string;
}
export type student = {
    id: number | null;
    user_id: number;
    status: boolean;
    user?: user;
    createdAt?: string;
    updatedAt?: string;
}
export type course = {
    id: number | null;
    name: string;
    description: string;
    hours: number;
    days: number;
    type?: number;
    level?: number;
    status: boolean;
    course_type: courseType;
    course_level: courseLevel;
    createdAt?: string;
    updatedAt?: string;
}

export type schedule = {
    id?: number;
    course_id: number;
    ourse_student?: courseStudent;
    course_student_id: number;
    instructor?: instructor;
    instructor_id: number | null;
    student_id: number;
    subject_days_id: number;
    subject_day?: subject_days;
    subject_days_subject_id: number;
    date: string;
    hour: string;
    classTime: number;
    createdAt?: string;
    updatedAt?: string;
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
    user_doc_type_id?: number;
    user_doc_type?: userDocType
    createdAt?: string;
    updatedAt?: string;
}
export type courseStudent = {
    id: number;
    course_id: number;
    student_id: number | null;
    type_trip: number;
    license: number;
    regulation: number;
    course?: course
    student?: student
    date: string | null;
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
    day: number;
    courseSelected: course | null;
    courseStudent: courseStudent | null;
    courseStudentList: courseStudent[] | null;
    scheduleList: schedule[];
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

