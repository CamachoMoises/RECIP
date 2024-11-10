import {
	Button,
	ButtonGroup,
	Card,
	CardBody,
	List,
	ListItem,
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
import { fetchSubjects } from '../../../../features/subjectSlice';
import { ArrowDown, ArrowUp, Pencil, Plus } from 'lucide-react';
import ModalFormSubject from './modalFormSubject';
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
		const handleOpenEdit = (subject: subject | null = null) => {
			setSubjectSelected(subject);
			setOpenNewSubject(!openNewSubject);
		};
		const maxOrderNumber = subject.maxOrderNumber;
		const subjectList = subject.subjectList;
		if (selectedCourse) {
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
										<List
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{subject.subjectList.map((subject) => (
												<ListItem
													className="flex justify-between"
													key={subject.id}
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													<Typography
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{subject.name}
													</Typography>
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
														>
															<ArrowUp size={12} />
														</Button>

														<Button
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
															onClick={() => handleOpenEdit(subject)}
														>
															<Pencil size={12} />
														</Button>
														<Button
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
															disabled={
																maxOrderNumber
																	? maxOrderNumber <= subject.order
																	: true
															}
														>
															<ArrowDown size={12} />
														</Button>
													</ButtonGroup>
												</ListItem>
											))}
										</List>
									) : (
										<>
											<Typography
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{' '}
												Sin actividades creadas
											</Typography>
										</>
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
