import { schedule } from './utilidades.d';
import { subject, courseStudent } from './utilities';
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
    subject_days?: subjectDays[];
    createdAt?: string;
    updatedAt?: string;
}
export type subjectDays = {
    id: number | null;
    course_id: number;
    subject_id: number;
    day: number;
    subject?: subject;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export type test = {
    id: number;
    course_id: number;
    course?: course;
    code: string;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type questionType = {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export type question = {
    id: number;
    header: string;
    course_id: number;
    course?: course;
    question_type_id: number;
    question_type?: question_type;
    test_id: number;
    test?: test;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type answer = {
    id: number;
    value: string;
    question_id: number;
    question?: question;
    test_id: number;
    test?: test;
    course_id: number;
    course?: course;
    is_correct: boolean;
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
    course_student?: courseStudent;
    course_student_id: number;
    instructor?: instructor;
    instructor_id: number | null;
    student_id: number;
    subject_days_id: number;
    subject_day?: subjectDays;
    subject_id: number;
    subject?: subject;
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
    course?: course
    student_id: number | null;
    course_student_tests?: courseStudentTest[];
    student?: student;
    type_trip: number;
    license: number;
    schedules?: schedule[];
    regulation: number;
    date: string | null;
    code: string;
    createdAt: string;
    updatedAt: string;
}

export type courseStudentTest = {
    id: number;
    course_id: number;
    course?: course;
    score: number;
    test_id: number;
    test?: test;
    attempts: number;
    course_student_id: number;
    course_student?: courseStudent;
    date: string;
    student_id: number;
    student?: student;
    code: string;
    status: boolean;
    finished: boolean;
    createdAt: string;
    updatedAt: string;
}

export type courseStudentTestQuestion = {
    id: number;
    course_student_test_id: number;
    course_student_test?: courseStudentTest;
    course_student_id: number;
    course_student?: courseStudent;
    question_id: number;
    question?: question;
    test_id: number;
    test?: test;
    course_id: number;
    course?: course;
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

export interface testState {
    testList: test[];
    testSelected: test | null;
    questionList: question[];
    questionSelected: question | null;
    answerList: answer[];

    courseStudentTestSelected: courseStudentTest | null;
    courseStudentTestQuestionList: courseStudentTestQuestion[];
    courseStudentTestQuestionSelected: courseStudentTestQuestion | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    lastCreatedId: number | null;
    error: string | null;
}

