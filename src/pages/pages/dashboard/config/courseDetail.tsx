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
	daySubjectType,
	subject,
} from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
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
		name: 'Dashboard',
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
	const [subjectSelected, setSubjectSelected] =
		useState<subject | null>(null);
	const [openNewSubject, setOpenNewSubject] = useState(false);
	const { course, subject } = useSelector((state: RootState) => {
		return { course: state.courses, subject: state.subjects };
	});

	const { id } = useParams<{ id: string }>();
	useEffect(() => {
		dispatch(fetchSubjects(parseInt(id ? id : '-1'))); // Llamada al thunk para obtener las asignaciones
		dispatch(fetchCourse(parseInt(id ? id : '-1'))); // Llamada al thunk para obtener los usuarios
	}, [dispatch, id]);
	if (!id || !course.courseSelected) {
		navigate('/dashboard/config');
	} else {
		const selectedCourse = course.courseSelected;
		const subjectList = subject.subjectList;
		const error = subject.error;
		const status = subject.status;
		const maxOrderNumber = subject.maxOrderNumber;

		const handleOpenEdit = (subject: subject | null = null) => {
			setSubjectSelected(subject);
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
		let hoursToDays: daySubjectType[] = [];

		if (subject.subjectList) {
			const subjectDays = subject.subjectList.map((sub) => {
				const dayT = sub.subject_days;
				const dayS = dayT?.map((DT) => {
					if (DT.status) {
						return DT.day;
					}
				});
				let day: number = -1;
				if (dayS) {
					if (dayS.length > 0) {
						day = dayS[0] ? dayS[0] : -1;
					}
				}
				return { day: day, hours: sub.hours };
			});
			hoursToDays = subjectDays;
		}

		if (selectedCourse) {
			const days = Array.from(
				{ length: selectedCourse.days },
				(_, i) => ({ id: i, name: `Dia ${i + 1}` })
			);
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
											{days.map((day, index) => {
												let hoursD = 0;
												hoursToDays.forEach((HTD) => {
													if (HTD.day === day.id + 1) {
														hoursD = hoursD + HTD.hours;
													}
												});
												return (
													<span
														key={`dayDetails-${index}`}
														className={
															hoursD > 8 ? 'text-red-700' : ''
														}
													>
														{day.name}: {hoursD} horas \{'     '}
													</span>
												);
											})}
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
										Asignaciones
									</Typography>
									<Button
										fullWidth
										size="sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										className="flex flex-row justify-center text-center"
										onClick={() => handleOpenEdit()}
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
												{subject.subjectList.map((subject, index) => {
													const subjectDays = subject.subject_days;
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
																<Typography
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	horas: ({subject.hours})
																</Typography>

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

																	if (subjectDays) {
																		check = subjectDays.some(
																			(sd) =>
																				sd.day === day.id + 1 &&
																				sd.status
																		);
																	}
																	return (
																		<div
																			className="flex flex-col gap-1"
																			key={`day-${day.id}`}
																		>
																			<label>{day.name}</label>

																			<Switch
																				defaultChecked={check}
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
																		handleOpenEdit(subject)
																	}
																>
																	<Pencil size={12} />
																</Button>
																<Button
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																	disabled={
																		maxOrderNumber
																			? maxOrderNumber <=
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
											>
												{' '}
												Sin actividades creadas
											</Typography>
										</div>
									)}
								</CardBody>
							</Card>
						</div>
					</div>
					{openNewSubject && (
						<ModalFormSubject
							subjectSelected={subjectSelected}
							openNewSubject={openNewSubject}
							handleOpen={handleOpenEdit}
							maxOrderNumber={maxOrderNumber}
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
