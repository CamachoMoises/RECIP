import {
	Button,
	ButtonGroup,
	Card,
	CardBody,
	List,
	ListItem,
	Switch,
	Typography,
} from '@material-tailwind/react';
import {
	breadCrumbsItems,
	subject,
} from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
	fetchSubject,
	fetchSubjects,
	updateSubject,
} from '../../../../features/subjectSlice';
import { ArrowDown, ArrowUp, Pencil, Plus } from 'lucide-react';
import ModalFormSubject from './modalFormSubject';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import { axiosPostDefault } from '../../../../services/axios';
import { fetchCourse } from '../../../../features/courseSlice';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
	{
		name: 'Configuracion',
		href: '/dashboard/config',
	},
];
const CourseDetail = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const [subjectSelectedId, setSubjectSelectedId] = useState<
		number | null
	>(null);
	const [openNewSubject, setOpenNewSubject] = useState(false);
	const { course, subject } = useSelector((state: RootState) => {
		return { course: state.courses, subject: state.subjects };
	});

	const { id } = useParams<{ id: string }>();
	useEffect(() => {
		dispatch(fetchSubjects(parseInt(id ? id : '-1')));
		dispatch(fetchCourse(parseInt(id ? id : '-1')));
	}, [dispatch, id]);

	useEffect(() => {
		if (subjectSelectedId) {
			dispatch(fetchSubject(subjectSelectedId)); // Llamada al thunk para obtener las secciones
		}
	}, [dispatch, subjectSelectedId]);
	if (!id || !course.courseSelected) {
		// navigate('/dashboard/config');
	} else {
		const selectedCourse = course.courseSelected;
		const subjectList = subject.subjectList;
		const error = subject.error;
		const status = subject.status;
		const maxOrderSubject = subject.maxOrderSubject;
		const maxOrderLessonSelected = subject.maxOrderLesson;
		const handleOpenEdit = async (
			subjectId: number | null = null
		) => {
			setSubjectSelectedId(subjectId);
			if (openNewSubject) {
				await dispatch(
					fetchSubjects(selectedCourse.id ? selectedCourse.id : -1)
				);
			}
			setOpenNewSubject(!openNewSubject);
		};
		const handleSwitchSubject = async (
			subjectEdit: subject,
			index: number,
			tpye: string
		) => {
			let index_related = 0;
			if (tpye === 'up') {
				index_related = -1;
			} else {
				index_related = 1;
			}
			const reated_subject = subjectList[index + index_related];
			const subject_a = {
				...subjectEdit,
				order: subjectEdit.order + index_related,
			};
			const subject_b = {
				...reated_subject,
				order: reated_subject.order - index_related,
			};
			delete subject_a.createdAt;
			delete subject_a.updatedAt;
			delete subject_b.createdAt;
			delete subject_b.updatedAt;
			delete subject_a.subject_days;
			delete subject_b.subject_days;

			await dispatch(updateSubject(subject_a));
			await dispatch(updateSubject(subject_b));
			await dispatch(fetchSubjects(parseInt(id)));
		};
		const handleChangeStatusDay = async (
			event: React.ChangeEvent<HTMLInputElement>,
			day: { id: number; name: string },
			subject_id: number | null
		) => {
			if (subject_id && selectedCourse?.id) {
				const req = {
					status: event.target.checked,
					subject_id: subject_id,
					day: day.id + 1,
					course_id: selectedCourse.id,
				};

				await axiosPostDefault('api/subjects/subjects_days', req);
			}
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

		if (selectedCourse) {
			const days = Array.from(
				{ length: selectedCourse.days },
				(_, i) => ({ id: i, name: `Dia ${i + 1}` })
			);

			const hoursByDays = subject.subjectList.flatMap((sub) => {
				const daysActive =
					sub.subject_days?.filter((SD) => SD.status) || [];
				return daysActive.map((SD) => ({
					day: SD.day,
					hours: sub.hours,
				}));
			});
			console.log(hoursByDays);
			return (
				<>
					<PageTitle
						title={`Editar Asiganciones del curso ${selectedCourse.name}`}
						breadCrumbs={breadCrumbs}
					/>
					<div className="flex lg:flex-col  gap-2">
						<div className="flex flex-row w-full">
							<Card
								className="flex flex-row w-full"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<CardBody
									className="w-full"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<div className="flex flex-col w-full">
										<div className="flex flex-row justify-between">
											<Typography
												variant="lead"
												className="text-left"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Nombre: {selectedCourse.name}
											</Typography>
											<Typography
												variant="lead"
												className="text-left"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Curso {selectedCourse.course_level.name}
											</Typography>
										</div>
										<div className="flex flex-row justify-between">
											<Typography
												variant="lead"
												className="text-left"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Descripcion: {selectedCourse.description}
											</Typography>
											<Typography
												variant="lead"
												className="text-left"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Tipo: {selectedCourse.course_type.name}
											</Typography>
										</div>
										<Typography
											variant="small"
											className="text-left"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{course.courseSelected.course_type.id != 2 ? (
												<>
													{days.map((day, index) => {
														let hours = 0;
														console.log(day, index, 'OJO');
														const hoursDay = hoursByDays.filter(
															(HbD) => HbD.day === day.id + 1
														);
														hours = hoursDay.reduce(
															(sum, SD) => sum + SD.hours,
															0
														);

														return (
															<div className="flex flex-col gap-2">
																<span
																	key={`dayDetails-${index}`}
																	className={
																		hours > 8 ? 'text-red-700' : ''
																	}
																>
																	{day.name}: {hours} horas de
																	instruccion
																</span>
															</div>
														);
													})}
												</>
											) : (
												<>
													{days.map((day, index) => {
														return (
															<div className="flex flex-col gap-2">
																<span key={`dayDetails-${index}`}>
																	{day.name}: 8 horas de instruccion
																</span>
															</div>
														);
													})}
												</>
											)}
										</Typography>
									</div>
								</CardBody>
							</Card>
						</div>
						<div className="flex flex-row w-full">
							<Card
								className="flex flex-row w-full"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<CardBody
									className="flex flex-col w-full"
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
										Secciones
									</Typography>
									<Button
										fullWidth
										size="sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										className="flex flex-row justify-center text-center"
										onClick={() => handleOpenEdit(-1)}
									>
										<Plus />
									</Button>

									<hr />
									{subjectList.length > 0 ? (
										<>
											<br />
											<Typography
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Dias impartidos
											</Typography>
											<List
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{subjectList.map((subject, index) => {
													const subjectDays = subject.subject_days
														? subject.subject_days
														: [];
													return (
														<ListItem
															className={`flex justify-between ${
																subject.status ? '' : 'bg-gray-400'
															}`}
															key={subject.id}
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															<div className="flex flex-row justify-between w-80">
																<Typography
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	{subject.name}
																</Typography>
																{course.courseSelected?.course_type
																	.id != 2 && (
																	<Typography
																		placeholder={undefined}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																	>
																		horas: ({subject.hours})
																	</Typography>
																)}

																{!subject.status && (
																	<Typography
																		placeholder={undefined}
																		color="red"
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																	>
																		Inactivo
																	</Typography>
																)}
															</div>

															<div className="flex w-max gap-3">
																{days.map((day) => {
																	let check = false;
																	check = subjectDays.some(
																		(sd) =>
																			sd.day === day.id + 1 &&
																			sd.status
																	);
																	const labelView =
																		course.courseSelected?.course_type
																			.id != 2 || check;
																	return (
																		<div
																			className="flex flex-col gap-1"
																			key={`day-${day.id}`}
																		>
																			{labelView && (
																				<label>{day.name}</label>
																			)}

																			{course.courseSelected
																				?.course_type.id != 2 && (
																				<>
																					<Switch
																						defaultChecked={check}
																						disabled={!subject.status}
																						onChange={(event) => {
																							handleChangeStatusDay(
																								event,
																								day,
																								subject.id
																							);
																						}}
																						crossOrigin={undefined}
																						onPointerEnterCapture={
																							undefined
																						}
																						onPointerLeaveCapture={
																							undefined
																						}
																					/>
																				</>
																			)}
																		</div>
																	);
																})}
															</div>
															<ButtonGroup
																size="sm"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																<Button
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																	disabled={subject.order <= 1}
																	onClick={() =>
																		handleSwitchSubject(
																			subject,
																			index,
																			'up'
																		)
																	}
																>
																	<ArrowUp size={12} />
																</Button>

																<Button
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																	onClick={() =>
																		handleOpenEdit(subject.id)
																	}
																>
																	<Pencil size={12} />
																</Button>
																<Button
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																	disabled={
																		maxOrderSubject
																			? maxOrderSubject <=
																			  subject.order
																			: true
																	}
																	onClick={() =>
																		handleSwitchSubject(
																			subject,
																			index,
																			'down'
																		)
																	}
																>
																	<ArrowDown size={12} />
																</Button>
															</ButtonGroup>
														</ListItem>
													);
												})}
											</List>
										</>
									) : (
										<div className="pt-5">
											<Typography
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												variant="h6"
												className="text-center"
											>
												Sin secciones creadas
											</Typography>
										</div>
									)}
								</CardBody>
							</Card>
						</div>
					</div>
					{openNewSubject && (
						<ModalFormSubject
							subjectSelected={subject.subjectSelected}
							openNewSubject={openNewSubject}
							handleOpen={handleOpenEdit}
							maxOrderSubject={maxOrderSubject}
							maxOrderLessonSelected={maxOrderLessonSelected}
							courseType={course.courseSelected.course_type.id}
							days={days}
						/>
					)}
				</>
			);
		} else {
			navigate('/dashboard/courses');
		}
	}
};

export default CourseDetail;
