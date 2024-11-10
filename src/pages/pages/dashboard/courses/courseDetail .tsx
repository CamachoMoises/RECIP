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
} from '../../../../types/utilidades';
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
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
	{
		name: 'Cursos',
		href: '/dashboard/courses',
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
		dispatch(fetchSubjects(parseInt(id ? id : '-1'))); // Llamada al thunk para obtener los usuarios
	}, [dispatch, id]);
	if (!id || course.courseList.length === 0) {
		navigate('/dashboard/courses');
	} else {
		const selectedCourse = course.courseList.find(
			(course) => course.id === parseInt(id)
		);
		const subjectList = subject.subjectList;
		const error = subject.error;
		const status = subject.status;
		const maxOrderNumber = subject.maxOrderNumber;

		const handleOpenEdit = (subject: subject | null = null) => {
			setSubjectSelected(subject);
			setOpenNewSubject(!openNewSubject);
		};
		const handleSwicthSubject = async (
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

			dispatch(fetchSubjects(parseInt(id)));
		};
		const handeChangeStatusDay = async (
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

				const res = await axiosPostDefault(
					'api/subjects/subjects_days',
					req
				);
				console.log(res);
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
			return (
				<>
					<PageTitle
						title={`${selectedCourse.name}`}
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
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<Typography
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Nombre: {selectedCourse.name}
									</Typography>
									<Typography
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Descripcion: {selectedCourse.description}
									</Typography>
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
															<div className="flex flex-row gap-2 w-36">
																<Typography
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	{subject.name}
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
																			<label>{day.name} </label>

																			<Switch
																				defaultChecked={check}
																				onChange={(event) => {
																					handeChangeStatusDay(
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
																		handleSwicthSubject(
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
																		handleSwicthSubject(
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
