import {
	Button,
	ButtonGroup,
	Card,
	CardBody,
	List,
	ListItem,
	ListItemPrefix,
	Typography,
} from '@material-tailwind/react';
import {
	breadCrumbsItems,
	course,
	courseLevel,
	courseStudent,
	courseType,
} from '../../../../types/utilidades';
import PageTitle from '../../../../components/PageTitle';
import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
	createCourseStudent,
	fetchCourse,
	fetchCourseStudent,
	fetchCourses,
	fetchCoursesStudents,
	fetchSchedule,
	setDay,
	setLastCourseStudentCreatedId,
	setLastCreatedId,
} from '../../../../features/courseSlice';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import { axiosGetDefault } from '../../../../services/axios';
import ModalFormCourse from './modalFormCourse';
import toast from 'react-hot-toast';
import { BookCheck, CalendarCheck, Pencil, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchSubjects } from '../../../../features/subjectSlice';
import {
	fetchInstructors,
	fetchStudents,
} from '../../../../features/userSlice';
import moment from 'moment';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
];
const GeneralCourses = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [testActive, setTestActive] = useState<boolean>(true);
	const navigate = useNavigate();
	const [courseSelected, setCourseSelected] = useState<course | null>(
		null
	);
	const [courseTypes, setCourseTypes] = useState<courseType[] | null>(
		null
	);
	const [courseLevel, setCourseLevel] = useState<
		courseLevel[] | null
	>(null);
	const {
		courseList,
		courseStudentList,
		status,
		error,
		lastCreatedId,
		lastCourseStudentCreatedId,
		courseStudent,
	} = useSelector((state: RootState) => {
		console.log(state);

		return (
			state.courses || {
				courseList: [],
				status: 'idle2',
				error: null,
			}
		);
	});
	const [openNewCourse, setOpenNewCourse] = useState(false);
	dispatch(setDay(1));
	useEffect(() => {
		dispatch(fetchCourses());
		dispatch(fetchCoursesStudents());
	}, [dispatch]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleOpenEdit = async (course: course | null = null) => {
		const { resp, status } = await axiosGetDefault(
			'api/courses/courseTypes'
		);
		const dataLevel = await axiosGetDefault(
			'api/courses/courseLevel'
		);
		if (
			status > 199 &&
			status < 400 &&
			dataLevel.status > 199 &&
			dataLevel.status < 400
		) {
			setCourseTypes(resp);
			setCourseLevel(dataLevel.resp);
			setCourseSelected(course);
			setOpenNewCourse(!openNewCourse);
		} else {
			toast.error('Ocurrio un error al consultar el servidor');
		}
	};

	useEffect(() => {
		const editCourse = (id: number) => {
			const EC = courseList.find((course) => course.id === id);
			if (EC) {
				handleOpenEdit(EC);
			} else {
				// toast.error('No se pudo encontrar el curso');
			}
		};

		if (lastCreatedId) {
			editCourse(lastCreatedId); // Ejecuta la lógica para editar el curso según `lastCreatedId`
			dispatch(setLastCreatedId(null));
		}
	}, [lastCreatedId, dispatch, courseList, handleOpenEdit]);

	useEffect(() => {
		if (lastCourseStudentCreatedId && courseStudent) {
			dispatch(setLastCourseStudentCreatedId(null));
			navigateCourseStudent(courseStudent);
		}
	}, [lastCourseStudentCreatedId, courseStudent, dispatch]);
	const handleNewCourseSchedule = async (course_id: number) => {
		dispatch(createCourseStudent(course_id));
	};
	const navigateCourseStudent = async (CL: courseStudent) => {
		await dispatch(fetchSubjects(CL.course_id ? CL.course_id : -1));
		await dispatch(fetchCourse(CL.course_id ? CL.course_id : -1));
		await dispatch(fetchCourseStudent(CL.id ? CL.id : -1));
		await dispatch(fetchInstructors());
		await dispatch(fetchStudents());
		await dispatch(fetchSchedule(CL.id ? CL.id : -1));
		navigate(`../new_course/${CL.id}/${CL.course_id}`);
	};
	if (status === 'loading') {
		return (
			<>
				<LoadingPage />
			</>
		);
	}
	if (status === 'failed') {
		return (
			<>
				<ErrorPage error={error ? error : 'Indefinido'} />
			</>
		);
	}
	return (
		<div className="container">
			<PageTitle title="Cursos" breadCrumbs={breadCrumbs} />
			<Countdown
				startTime="07:00"
				totalMinutes={120}
				active={testActive}
				setActive={setTestActive}
			/>
			<code>{JSON.stringify(testActive)}</code>
			<div className="grid lg:grid-cols-4 gap-2">
				<div className="flex flex-col col-span-3">
					<Card
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<CardBody
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Typography
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								variant="h5"
							>
								Cursos actuales
							</Typography>
							<div className="grid grid-cols-2 gap-2">
								{/* <code>{JSON.stringify(courseList, null, 4)}</code> */}
								{courseList.map((course) => {
									return (
										<div key={course.id}>
											<Card
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												<CardBody
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													<Typography
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture
														variant="lead"
													>
														{course.name}
													</Typography>
													<Typography
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture
														variant="small"
													>
														{course.description}
													</Typography>
													<Typography
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{course.course_type.name}
													</Typography>
													<ButtonGroup
														size="sm"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														<Button
															title="Editar el Curso"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
															onClick={() => handleOpenEdit(course)}
														>
															<Pencil size={20} />
														</Button>
														<Button
															title="Asignaciones el Curso"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
															onClick={() =>
																navigate(`../course/${course.id}`)
															}
														>
															<BookCheck size={20} />
														</Button>
														<Button
															title="Agendar nuevo curso"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
															onClick={() =>
																handleNewCourseSchedule(
																	course.id ? course.id : -1
																)
															}
														>
															<CalendarCheck size={20} />
														</Button>
													</ButtonGroup>
												</CardBody>
											</Card>
										</div>
									);
								})}
							</div>
						</CardBody>
					</Card>
				</div>
				<div className="flex flex-col">
					<Card
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<CardBody
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Typography
								variant="h5"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Agregar
							</Typography>
							<div className="flex flex-col">
								<Button
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									className="flex flex-col text-center justify-center "
									onClick={() => {
										handleOpenEdit();
									}}
								>
									<Plus size={15} className="mx-auto text-lg" />
								</Button>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
			<div className="flex flex-col pt-4">
				<Card
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<CardBody
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Typography
							variant="h5"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Cursos de pilotos
						</Typography>
						<List
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{courseStudentList?.map((CL) => (
								<ListItem
									key={`${CL.id}.courseList`}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									onClick={() => {
										navigateCourseStudent(CL);
									}}
								>
									<ListItemPrefix
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{CL.code}
									</ListItemPrefix>
									<div>
										<Typography
											variant="h6"
											color="blue-gray"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{CL.student?.user?.name
												? `${CL.student.user.name} ${CL.student.user.last_name}`
												: 'Sin Piloto'}
										</Typography>
										<Typography
											variant="small"
											color="gray"
											className="font-normal"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{CL.course?.name} {CL.course?.description} (
											{CL.course?.course_type.name})
										</Typography>
									</div>
								</ListItem>
							))}
						</List>
					</CardBody>
				</Card>
			</div>
			{openNewCourse && courseTypes && courseLevel && (
				<ModalFormCourse
					courseSelected={courseSelected}
					openNewCourse={openNewCourse}
					handleOpen={handleOpenEdit}
					courseTypes={courseTypes}
					courseLevel={courseLevel}
				/>
			)}
		</div>
	);
};

const Countdown = ({
	startTime,
	totalMinutes,
	active,
	setActive,
}: {
	startTime: string;
	totalMinutes: number;
	active: boolean;
	setActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const [timeLeft, setTimeLeft] = useState(0);

	useEffect(() => {
		const start = moment(startTime, 'HH:mm');
		const end = start.clone().add(totalMinutes, 'minutes');
		const now = moment();
		const initialTimeLeft = Math.max(end.diff(now, 'seconds'), 0);
		setTimeLeft(initialTimeLeft);

		// Actualiza cada segundo
		const interval = setInterval(() => {
			setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
			console.log(timeLeft);

			if (timeLeft <= 0 && active) {
				clearInterval(interval);
				setActive(false);
			} else {
				setActive(true);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [startTime, totalMinutes]);

	const calculateTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${secs
			.toString()
			.padStart(2, '0')}`;
	};

	const progress = (timeLeft / (totalMinutes * 60)) * 100;

	return (
		<div className="w-full max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
			<h1 className="text-2xl font-semibold text-center mb-4">
				Cuenta Regresiva
			</h1>
			<div className="flex items-center justify-center mb-4">
				<div className="text-4xl font-bold text-blue-600">
					{calculateTime(timeLeft)}
				</div>
			</div>
			<div className="w-full bg-gray-200 rounded-full h-4">
				<div
					className="bg-blue-500 h-4 rounded-full transition-all"
					style={{ width: `${progress}%` }}
				></div>
			</div>
			<p className="text-center text-sm text-gray-600 mt-2">
				Hora de inicio:{' '}
				<span className="font-semibold">{startTime}</span>
			</p>
		</div>
	);
};

export default GeneralCourses;
