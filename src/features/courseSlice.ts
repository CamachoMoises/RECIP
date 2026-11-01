import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { CourseState, course, courseCloneResult, coursePayload, courseStudent, courseStudentScheduleDeleteResult, schedule, scheduleDeleteResult } from '../types/utilities';
import { axiosDeleteSlice, axiosGetSlice, axiosPostSlice, axiosPutSlice } from "../services/axios";

/**
 * `error.message` de Axios solo dice "Request failed with status code 409".
 * El motivo real viaja en el body y el backend no es consistente entre endpoints:
 * `CreateSchedule` responde `{ message }`, `DeleteSchedule` responde `{ error }`
 * y los 404/500 texto plano.
 */
const backendErrorMessage = (error: any, fallback: string): string => {
    const data = error?.response?.data;
    return (
        (typeof data === 'string' ? data : data?.error || data?.message) ||
        error?.message ||
        fallback
    );
};

const initialState: CourseState = {
    status: 'idle',
    day: 1,
    courseList: [],
    courseSelected: null,
    courseStudent: null,
    courseStudentList: null,
    scheduleList: [],
    lastCourseStudentCreatedId: null,
    lastCreatedId: null,
    error: null, // Inicializar como null
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
    emailStatus: 'idle',
    emailError: null,
};
export const fetchCourses = createAsyncThunk<
    course[],
    { include_inactive?: boolean } | undefined
>(
    'course/fetchCourses',
    async (args, { rejectWithValue }) => {
        try {
            // `include_inactive` solo lo usa Configuración. Las pantallas
            // operativas (matrícula, horarios, exámenes) deben seguir sin él
            // para no mostrar cursos eliminados.
            const response = await axiosGetSlice(
                'api/courses',
                args?.include_inactive ? { include_inactive: 'true' } : {},
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al cargar los cursos'),
            );
        }
    }
);

export const fetchCoursesStudents = createAsyncThunk<{ data: courseStudent[], totalItems: number, currentPage: number, pageSize: number, totalPages: number }, { currentPage: number, pageSize: number, status?: boolean, course_id?: number }>(
    'course/fetchCoursesStudents',
    async ({ currentPage, pageSize, status, course_id }, { rejectWithValue }) => {
        try {
            const params: { currentPage: number; pageSize: number; status?: boolean; course_id?: number } = {
                currentPage,
                pageSize,
            };
            if (status !== undefined) {
                params.status = status;
            }
            if (course_id !== undefined) {
                params.course_id = course_id;
            }
            const response = await axiosGetSlice('api/courses/coursesStudents', params);

            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCoursesStudentsByInstructor = createAsyncThunk<{ data: courseStudent[], totalItems: number, currentPage: number, pageSize: number, totalPages: number }, { instructor_id: number, currentPage: number, pageSize: number, status?: boolean }>(
    'course/fetchCoursesStudentsByInstructor',
    async ({ instructor_id, currentPage, pageSize, status }, { rejectWithValue }) => {
        try {
            const params: { instructor_id: number; currentPage: number; pageSize: number; status?: boolean } = {
                instructor_id,
                currentPage,
                pageSize,
            };
            if (status !== undefined) {
                params.status = status;
            }
            const response = await axiosGetSlice('api/courses/coursesStudents', params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCoursesStudentsTests = createAsyncThunk<{ data: courseStudent[], totalItems: number, currentPage: number, pageSize: number, totalPages: number }, { currentPage: number, pageSize: number, course_type_id: number, status?: boolean }>(
    'course/fetchCoursesStudentsTests',
    async ({ currentPage, pageSize, course_type_id, status }, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice('api/courses/coursesStudents',
                { currentPage, pageSize, course_type_id, status }
            );
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchMyCoursesStudents = createAsyncThunk<
    { data: courseStudent[], totalItems: number, currentPage: number, pageSize: number, totalPages: number },
    { currentPage: number, pageSize: number, student_id: number, status?: boolean }
>(
    'course/fetchMyCoursesStudents',
    async ({ currentPage, pageSize, student_id, status }, { rejectWithValue }) => {
        try {
            const params: { currentPage: number; pageSize: number; student_id: number; status?: boolean } = {
                currentPage,
                pageSize,
                student_id,
            };
            if (status !== undefined) {
                params.status = status;
            }

            const response = await axiosGetSlice('api/courses/coursesStudents', params);
            return response;

        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCourse = createAsyncThunk<course, number>(
    'course/fetchCourse',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/courses/course/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al cargar el curso'),
            );
        }
    }
);

export const fetchCourseStudent = createAsyncThunk<courseStudent, number>(
    'course/fetchCourseStudent',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/courses/courseStudent/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchSchedule = createAsyncThunk<schedule[], number>(
    'course/fetchSchedule',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosGetSlice(`api/courses/schedule/${id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);


export const sendCourseScheduleEmail = createAsyncThunk<
    { ok: boolean; messageId: string },
    FormData
>(
    'course/sendCourseScheduleEmail',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice('api/mail/send', formData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
// Acción para crear un curso (nace activo: el backend ignora `status`)
export const createCourse = createAsyncThunk<course, coursePayload>(
    'course/createCourse',
    async (courseData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice('api/courses', courseData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al crear el curso'),
            );
        }
    }
);
// Acción para clonar un curso (clon estructural: subjects, subject_days,
// subject_lessons y subject_lesson_days re-apuntados al nuevo curso).
// No copia alumnos, schedules, asistencias, tests ni evaluaciones.
// Body vacío: el backend aplica los defaults ('<nombre> (copia)', '<code>-COPIA').
export const cloneCourse = createAsyncThunk<courseCloneResult, number>(
    'course/cloneCourse',
    async (course_id, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice(`api/courses/clone/${course_id}`);
            return response;
        } catch (error: any) {
            // axiosPostSlice lanza el AxiosError crudo: el backend devuelve el
            // motivo en el body (string plano o { error }).
            const data = error?.response?.data;
            const message =
                (typeof data === 'string' ? data : data?.error || data?.message) ||
                error?.message ||
                'Error al clonar el curso';
            return rejectWithValue(message);
        }
    }
);
// Acción para crear un curso por piloto (matrícula).
// Un curso eliminado responde 409 `{ message }`: se propaga tal cual.
export const createCourseStudent = createAsyncThunk<courseStudent, number>(
    'course/createCourseStudent',
    async (course_id, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice(`api/courses/courseStudent/${course_id}`);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al matricular en el curso'),
            );
        }
    }
);
// Acción para actualizar el estado de un curso estudiante
export const updateCourseStudentStatus = createAsyncThunk<{ id: number; status: boolean }, { courseStudentId: number; status: boolean }>(
    'course/updateCourseStudentStatus',
    async ({ courseStudentId, status }, { rejectWithValue }) => {
        try {
            await axiosPutSlice(`api/courses/courseStudent/${courseStudentId}/status`, { status });
            return { id: courseStudentId, status };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
// Acción para actualizar max_attempts de un curso estudiante
export const updateCourseStudentMaxAttempts = createAsyncThunk<courseStudent, { course_student_id: number, max_attempts: number | null }>(
    'course/updateCourseStudentMaxAttempts',
    async ({ course_student_id, max_attempts }, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/courses/courseStudentMaxAttempts`, {
                course_student_id,
                max_attempts
            });
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.error || error.message);
        }
    }
);
// Acción para crear una actividad
export const createSchedule = createAsyncThunk<schedule, schedule>(
    'course/createSchedule',
    async (scheduleData, { rejectWithValue }) => {
        try {
            const response = await axiosPostSlice('api/courses/schedule', scheduleData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al guardar el horario'),
            );
        }
    }
);



// Acción para actualizar un curso (PUT; omitir `status` conserva la auditoría)
export const updateCourse = createAsyncThunk<course, coursePayload>(
    'course/updateCourse',
    async (courseData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/courses`, courseData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al actualizar el curso'),
            );
        }
    }
);

// Actualización silenciosa de las horas totales del curso (sin overlay global)
export const updateCourseHours = createAsyncThunk<course, coursePayload>(
    'course/updateCourseHours',
    async (courseData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/courses`, courseData);
            return response;
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al actualizar las horas'),
            );
        }
    }
);

// Soft delete reversible: marca `status = false` (y `deleted_at`/`deleted_by`)
// pero NO borra matrículas, horarios, asistencias, exámenes ni evaluaciones.
export const deleteCourse = createAsyncThunk<course, number>(
    'course/deleteCourse',
    async (id, { rejectWithValue }) => {
        try {
            return await axiosDeleteSlice(`api/courses/${id}`);
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al eliminar el curso'),
            );
        }
    }
);

// Reactiva el curso y limpia la auditoría (idempotente).
export const restoreCourse = createAsyncThunk<course, number>(
    'course/restoreCourse',
    async (id, { rejectWithValue }) => {
        try {
            return await axiosPostSlice(`api/courses/${id}/restore`, {});
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al reactivar el curso'),
            );
        }
    }
);
// Acción para actualizar un curso por estudiante
export const updateCourseStudent = createAsyncThunk<courseStudent, { course_id: number, course_student_id: number, date: string | undefined, student_id: number | null | undefined, typeTrip: number, license: number, regulation: number, instructorCode?: string, client?: string }>(
    'course/updateCourseStudent',
    async (courseData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/courses/courseStudent/${courseData.course_id}`, courseData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
// Acción para actualizar una actividad
export const updateSchedule = createAsyncThunk<schedule, schedule>(
    'course/updateSchedule',
    async (scheduleData, { rejectWithValue }) => {
        try {
            const response = await axiosPutSlice(`api/courses/schedule`, scheduleData);
            return response;
        } catch (error: any) {
            // Ojo: `UpdateSchedule` en el backend responde 500 texto plano en
            // cualquier fallo, así que aquí normalmente no llega un 409/400.
            return rejectWithValue(
                backendErrorMessage(error, 'Error al actualizar el horario'),
            );
        }
    }
);
// Acción para eliminar una actividad (cascada: attendance + attendance_signature de esa sesión)
export const deleteSchedule = createAsyncThunk<scheduleDeleteResult, number>(
    'course/deleteSchedule',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosDeleteSlice(`api/courses/schedule/${id}`);
            return { id, ...response };
        } catch (error: any) {
            return rejectWithValue(
                backendErrorMessage(error, 'Error al eliminar el horario'),
            );
        }
    }
);
// Acción para eliminar TODOS los schedules de un course_student.
// Borrado masivo e irreversible, con cascada a attendance + attendance_signature
// de cada par (date, day) que tenía schedule. El backend responde con el mismo
// shape que el borrado individual, así que se ecoa el course_student_id para
// poder limpiar el store.
export const deleteAllCourseStudentSchedules = createAsyncThunk<courseStudentScheduleDeleteResult, number>(
    'course/deleteAllCourseStudentSchedules',
    async (course_student_id, { rejectWithValue }) => {
        try {
            const response = await axiosDeleteSlice(`api/courses/schedule/course-student/${course_student_id}`);
            return { course_student_id, ...response };
        } catch (error: any) {
            // axiosDeleteSlice lanza el AxiosError crudo: `error.message` solo dice
            // "Request failed with status code 4xx". El backend devuelve el motivo
            // en el body (p. ej. 'CourseStudent not found'), que es lo útil.
            const data = error?.response?.data;
            const message =
                (typeof data === 'string' ? data : data?.error || data?.message) ||
                error?.message ||
                'Error al eliminar los horarios';
            return rejectWithValue(message);
        }
    }
);

const courseSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {
        setLastCreatedId: (state, action: PayloadAction<number | null>) => {
            state.lastCreatedId = action.payload;
        },
        setLastCourseStudentCreatedId: (state, action: PayloadAction<number | null>) => {
            state.lastCourseStudentCreatedId = action.payload;
        },
        setDay: (state, action: PayloadAction<number>) => {
            state.day = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Reducers para la acción fetchCourses
            .addCase(fetchCourses.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<course[]>) => {
                state.status = 'succeeded';
                state.courseList = action.payload;
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            //Reducers para la acción fetchCoursesStudents
            .addCase(fetchCoursesStudents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCoursesStudents.fulfilled, (state, action: PayloadAction<{ data: courseStudent[], totalItems: number, currentPage: number, pageSize: number, totalPages: number }>) => {
                state.status = 'succeeded';
                state.courseStudentList = action.payload.data;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
                state.pageSize = action.payload.pageSize;
                state.totalItems = action.payload.totalItems;
            })
            .addCase(fetchCoursesStudents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            //Reducers para la acción fetchCoursesStudentsByInstructor
            .addCase(fetchCoursesStudentsByInstructor.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCoursesStudentsByInstructor.fulfilled, (state, action: PayloadAction<{ data: courseStudent[], totalItems: number, currentPage: number, pageSize: number, totalPages: number }>) => {
                state.status = 'succeeded';
                state.courseStudentList = action.payload.data;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
                state.pageSize = action.payload.pageSize;
                state.totalItems = action.payload.totalItems;
            })
            .addCase(fetchCoursesStudentsByInstructor.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            //Reducers para la acción fetchMyCoursesStudents
            .addCase(fetchMyCoursesStudents.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchMyCoursesStudents.fulfilled, (state, action: PayloadAction<{ data: courseStudent[], totalItems: number, currentPage: number, pageSize: number, totalPages: number }>) => {
                state.status = 'succeeded';
                state.courseStudentList = action.payload.data;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
                state.pageSize = action.payload.pageSize;
                state.totalItems = action.payload.totalItems;
            })
            .addCase(fetchMyCoursesStudents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            //Reducers para la acción fetchCoursesStudentsTests
            .addCase(fetchCoursesStudentsTests.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCoursesStudentsTests.fulfilled, (state, action: PayloadAction<{ data: courseStudent[], totalItems: number, currentPage: number, pageSize: number, totalPages: number }>) => {
                state.status = 'succeeded';
                state.courseStudentList = action.payload.data;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
                state.pageSize = action.payload.pageSize
                state.totalItems = action.payload.totalItems
            })
            .addCase(fetchCoursesStudentsTests.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción fetchCourse
            .addCase(fetchCourse.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourse.fulfilled, (state, action: PayloadAction<course>) => {
                state.status = 'succeeded';
                state.courseSelected = action.payload;
            })
            .addCase(fetchCourse.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción fetchCourseStudent
            .addCase(fetchCourseStudent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCourseStudent.fulfilled, (state, action: PayloadAction<courseStudent>) => {
                state.status = 'succeeded';
                state.courseStudent = action.payload;
            })
            .addCase(fetchCourseStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // Reducers para la acción fetchSchedule
            .addCase(fetchSchedule.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchSchedule.fulfilled, (state, action: PayloadAction<schedule[]>) => {
                state.status = 'succeeded';
                state.scheduleList = action.payload;
            })
            .addCase(fetchSchedule.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })


            // Reducers para la acción createCourse
            .addCase(createCourse.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createCourse.fulfilled, (state, action: PayloadAction<course>) => {
                const newCourse = action.payload;
                state.lastCreatedId = newCourse.id;
                state.status = 'succeeded';
                state.courseList.push(newCourse);
            })
            .addCase(createCourse.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción cloneCourse
            .addCase(cloneCourse.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(cloneCourse.fulfilled, (state, action: PayloadAction<courseCloneResult>) => {
                // courseCloneResult extiende course: los conteos *_cloned van de
                // y extra en el store, ningún componente los lee.
                state.status = 'succeeded';
                state.courseList.push(action.payload);
            })
            .addCase(cloneCourse.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción createCourseStudent
            .addCase(createCourseStudent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createCourseStudent.fulfilled, (state, action: PayloadAction<courseStudent>) => {
                const newCourseStudent = action.payload;
                state.lastCourseStudentCreatedId = newCourseStudent.id;
                state.status = 'succeeded';
                state.courseStudent = newCourseStudent;
            })
            .addCase(createCourseStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción updateCourseStudentStatus
            .addCase(updateCourseStudentStatus.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateCourseStudentStatus.fulfilled, (state, action: PayloadAction<{ id: number; status: boolean }>) => {
                state.status = 'succeeded';
                const { id, status } = action.payload;

                if (state.courseStudentList) {
                    const index = state.courseStudentList.findIndex((courseStudent) => courseStudent.id === id);
                    if (index !== -1) {
                        state.courseStudentList[index].status = status;
                    }
                }

                if (state.courseStudent?.id === id) {
                    state.courseStudent.status = status;
                }
            })
            .addCase(updateCourseStudentStatus.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción updateCourseStudentMaxAttempts
            // No toca `status`: es un guardado de campo en línea y no debe
            // sustituir la página por LoadingPage/ErrorPage. La respuesta viene
            // sin includes, por eso se hace merge en lugar de reemplazo.
            .addCase(updateCourseStudentMaxAttempts.fulfilled, (state, action: PayloadAction<courseStudent>) => {
                const updatedCourseStudent = action.payload;

                if (state.courseStudentList) {
                    const index = state.courseStudentList.findIndex((courseStudent) => courseStudent.id === updatedCourseStudent.id);
                    if (index !== -1) {
                        state.courseStudentList[index] = { ...state.courseStudentList[index], ...updatedCourseStudent };
                    }
                }

                if (state.courseStudent?.id === updatedCourseStudent.id) {
                    state.courseStudent = { ...state.courseStudent, ...updatedCourseStudent };
                }
            })
            .addCase(updateCourseStudentMaxAttempts.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Horarios (create/update/delete): solo se maneja `fulfilled`. No se
            // toca `status` a propósito: un 409/400 de validación debe verse
            // como toast en la pantalla de horarios, no reemplazarla por el
            // ErrorPage global. El mensaje del backend llega vía `.unwrap()`.
            .addCase(createSchedule.fulfilled, (state, action: PayloadAction<schedule>) => {
                state.scheduleList.push(action.payload);
            })

                        // Reducers para la acci�n updateCourse
            .addCase(updateCourse.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateCourse.fulfilled, (state, action: PayloadAction<course>) => {
                const editedCourse = action.payload;
                state.lastCreatedId = editedCourse.id;
                state.status = 'succeeded';
                const index = state.courseList.findIndex((course) => course.id === editedCourse.id);
                if (index !== -1) {
                    state.courseList[index] = editedCourse;
                }
            })
            .addCase(updateCourse.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acci�n updateCourseHours (sin overlay)
            .addCase(updateCourseHours.fulfilled, (state, action: PayloadAction<course>) => {
                const editedCourse = action.payload;
                const index = state.courseList.findIndex((course) => course.id === editedCourse.id);
                if (index !== -1) {
                    state.courseList[index] = editedCourse;
                }
                if (state.courseSelected?.id === editedCourse.id) {
                    state.courseSelected = { ...state.courseSelected, hours: editedCourse.hours };
                }
            })
            .addCase(updateCourseHours.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Soft delete / reactivación: se ACTUALIZA el curso en la lista, no
            // se quita. En Configuración el eliminado debe seguir visible para
            // poder reactivarlo. No se toca `lastCreatedId` (reabriría el modal
            // de edición) ni `status` en `rejected` (un 409/404 debe verse como
            // toast, no reemplazar la pantalla por ErrorPage).
            .addCase(deleteCourse.fulfilled, (state, action: PayloadAction<course>) => {
                const updated = action.payload;
                state.status = 'succeeded';
                const index = state.courseList.findIndex((c) => c.id === updated.id);
                if (index !== -1) state.courseList[index] = updated;
                if (state.courseSelected?.id === updated.id) state.courseSelected = updated;
            })
            .addCase(deleteCourse.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(restoreCourse.fulfilled, (state, action: PayloadAction<course>) => {
                const updated = action.payload;
                state.status = 'succeeded';
                const index = state.courseList.findIndex((c) => c.id === updated.id);
                if (index !== -1) state.courseList[index] = updated;
                if (state.courseSelected?.id === updated.id) state.courseSelected = updated;
            })
            .addCase(restoreCourse.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Reducers para la acción updateCourse
            .addCase(updateCourseStudent.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateCourseStudent.fulfilled, (state, action: PayloadAction<courseStudent>) => {
                const editedCourse = action.payload;
                state.status = 'succeeded';
                state.courseStudent = editedCourse

            })
            .addCase(updateCourseStudent.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })

            // Reducers para la acción updateSchedule (solo `fulfilled`, ver nota arriba)
            .addCase(updateSchedule.fulfilled, (state, action: PayloadAction<schedule>) => {
                const editedCourse = action.payload;
                const index = state.scheduleList.findIndex((schedule) => schedule.id === editedCourse.id);
                if (index !== -1) {
                    state.scheduleList[index] = editedCourse;
                }
            })

            // Reducers para la acción deleteSchedule
            .addCase(deleteSchedule.fulfilled, (state, action: PayloadAction<scheduleDeleteResult>) => {
                state.scheduleList = state.scheduleList.filter((schedule) => schedule.id !== action.payload.id);
            })

            // Reducers para la acción deleteAllCourseStudentSchedules
            .addCase(deleteAllCourseStudentSchedules.fulfilled, (state, action: PayloadAction<courseStudentScheduleDeleteResult>) => {
                state.scheduleList = state.scheduleList.filter(
                    (schedule) => schedule.course_student_id !== action.payload.course_student_id
                );
            })

            // Reducers para sendCourseScheduleEmail
            .addCase(sendCourseScheduleEmail.pending, (state) => {
                state.emailStatus = 'loading';
                state.emailError = null;
            })
            .addCase(sendCourseScheduleEmail.fulfilled, (state) => {
                state.emailStatus = 'succeeded';
            })
            .addCase(sendCourseScheduleEmail.rejected, (state, action) => {
                state.emailStatus = 'failed';
                state.emailError = action.payload as string;
            })

    },
});
export const { setLastCreatedId, setLastCourseStudentCreatedId, setDay } = courseSlice.actions;
export default courseSlice.reducer;