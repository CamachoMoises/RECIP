import { question, subject } from './utilities.d';
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
    is_schedulable: boolean;
    hours: number;
    course?: course;
    course_id: number;
    subject_days?: subjectDays[];
    subject_lessons?: subjectLesson[];
    createdAt?: string;
    updatedAt?: string;
}
export type subjectDays = {
    id: number | null;
    course_id: number;
    subject_id: number;
    day: number;
    classTime: number;
    subject?: subject;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type subjectLesson = {
    id?: number;
    course_id: number;
    course?: course;
    subject_id: number;
    subject?: subject;
    subject_lesson_days?: subjectLessonDays[];
    name: string;
    order: number;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export type subjectLessonDays = {
    id?: number;
    course_id: number;
    course?: course;
    subject_id: number;
    subject?: subject;
    subject_lesson_id: number;
    subject_lesson?: subjectLesson;
    course_student_assessment_lesson_days?: courseStudentAssessmentLessonDay[]
    subject_days_id: number;
    subject_days?: subjectDays;
    day: number;
    classTime: number;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export type test = {
    id: number;
    course_id: number;
    min_score: number;
    duration: number;
    course?: course;
    code: string;
    status: boolean;
    test_question_types: testQuestionType[];
    createdAt?: string;
    updatedAt?: string;
}

export type testQuestionType = {
    id: number;
    amount: number;
    value: number;
    course_id: number;
    question_type_id: number;
    question_type?: questionType;
    test_id: number;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export type questionType = {
    id: number;
    name: string;
    value: number;
    max_answer: number;
    createdAt?: string;
    updatedAt?: string;
}

export type question = {
    answers?: answer[];
    id: number;
    header: string;
    course_id: number;
    course?: course;
    question_type_id: number;
    question_type?: questionType;
    test_question_type_id: number;
    test_question_type?: testQuestionType;
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
    tests?: test[];
    description: string;
    hours: number;
    days: number;
    type?: number;
    level?: number;
    status: boolean;
    plane_model?: string;
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
export type StatusParam = { status?: boolean };
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
    country_name?: string;
    flag: string | null;
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
    course_student_assessment?: courseStudentAssessment;
    student?: student;
    type_trip: number;
    license: number;
    schedules?: schedule[];
    regulation: number;
    date: string | null;
    score?: number;
    approve?: boolean;
    code: string;
    createdAt: string;
    updatedAt: string;
}

export type courseStudentTest = {
    id: number;
    course_id: number;
    course?: course;
    score: number;
    approve?: boolean;
    test_id: number;
    test?: test;
    attempts: number;
    course_student_id: number;
    course_student_test_questions?: courseStudentTestQuestion[];
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
    course_student_test_answer?: courseStudentTestAnswer;
    course_student_id: number;
    student_id: number;
    student?: student;
    course_student?: courseStudent;
    question_id: number;
    question?: question;
    Answered: boolean;
    test_id: number;
    test?: test;
    course_id: number;
    course?: course;
    createdAt: string;
    updatedAt: string;
}

export type courseStudentTestAnswer = {
    id?: number;
    course_student_test_id: number;
    course_student_test?: courseStudentTest;
    course_student_test_question_id: number;
    course_student_test_question?: courseStudentTestQuestion;
    course_student_id: number;
    course_student?: courseStudent;
    question_id: number;
    question?: question;
    resp: string;
    test_id: number;
    score?: number;
    test?: test;
    student_id: number;
    student?: student;
    course_id: number;
    course?: course;
    createdAt?: string;
    updatedAt?: string;
}

export type courseStudentAssessment = {
    id?: number;
    course_id: number;
    course?: course;
    student_id: number;
    student?: student;
    course_student_id: number;
    course_student?: courseStudent;
    course_student_assessment_days?: courseStudentAssessmentDay[],
    score: number;
    approve: boolean;
    date: string;
    code: string;
    status: boolean;
    finished: boolean;
    comments: string;
    createdAt?: string;
    updatedAt?: string;
}

export type courseStudentAssessmentDay = {
    id?: number;
    course_id: number;
    course?: course;
    student_id: number;
    student?: student;
    course_student_id: number;
    course_student?: courseStudent;
    course_student_assessment_id: number;
    course_student_assessment?: courseStudentAssessment;
    day: number;
    airport: string;
    airstrip: string;
    elevation: number;
    meteorology: string;
    temperature: number;
    qnh: string;
    wind: string;
    weight: number;
    flaps: string;
    power: string;
    takeoff?: number;
    landing?: number;
    seat: string;
    comments: string;
    createdAt?: string;
    updatedAt?: string;
}

export type courseStudentAssessmentLessonDay = {
    id?: number;
    course_id: number;
    course?: course;
    student_id: number;
    student?: student;
    course_student_id: number;
    course_student?: courseStudent;
    course_student_assessment_id: number;
    course_student_assessment?: courseStudentAssessment;
    course_student_assessment_day_id: number;
    course_student_assessment_day?: courseStudentAssessmentDay;
    subject_id: number;
    subject?: subject;
    subject_lesson_id: number;
    subject_lesson?: subjectLesson;
    subject_days_id: number;
    subject_days?: subjectDays;
    subject_lesson_days_id: number;
    subject_lesson_days?: subjectLessonDays;
    item: string;
    score: number;
    score_2?: number;
    score_3?: number
    day?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface credentials {
    email: string;
    password?: string;
    rememberMe?: boolean;
    user?: user | null;
    token?: string | null;
}


export interface UserState {
    userSelected: user | null;
    usersList: user[];
    studentList: user[];
    instructorList: user[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}
export interface SignatureUrls {
    student?: string;
    instructor?: string;
    fcaa?: string;
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
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
}

export interface subjectState {
    subjectList: subject[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    lastCreatedId: number | null;
    error: string | null;
    maxOrderSubject: number | null;
    maxOrderLesson: number | null;
    subjectSelected: subject | null;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
}

export interface testState {
    testList: test[];
    questionTypes: questionType[];
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
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
}

export interface authState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    token: string | null | undefined,
    user?: user | null;
}
export interface assessmentState {
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    courseStudentAssessmentSelected: courseStudentAssessment | null;
    courseStudentAssessmentDayList: courseStudentAssessmentDay[];
    courseStudentAssessmentDaySelected: courseStudentAssessmentDay | null;
    courseStudentAssessmentLessonDayList: courseStudentAssessmentLessonDay[];
    courseStudentAssessmentLessonDaySelected: courseStudentAssessmentLessonDay | null;
    subjectList: subject[] | null;
    daysSubjectList: subject[] | null;
    day: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    signatureStatus?: 'idle' | 'saving' | 'saved' | 'failed';

}

