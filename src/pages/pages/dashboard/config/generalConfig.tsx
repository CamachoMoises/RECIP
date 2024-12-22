import { useDispatch, useSelector } from 'react-redux';
import PageTitle from '../../../../components/PageTitle';
import {
	breadCrumbsItems,
	course,
	courseLevel,
	courseType,
} from '../../../../types/utilities';
import { AppDispatch, RootState } from '../../../../store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
	fetchCourses,
	setLastCreatedId,
} from '../../../../features/courseSlice';
import { axiosGetDefault } from '../../../../services/axios';
import toast from 'react-hot-toast';
import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	Button,
	ButtonGroup,
	Card,
	CardBody,
	Typography,
} from '@material-tailwind/react';
import { BookCheck, Pencil, Plus } from 'lucide-react';
import ModalFormCourse from './modalFormCourse';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
];

const GeneralConfig = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const [openNewCourse, setOpenNewCourse] = useState(false);
	const [courseSelected, setCourseSelected] = useState<course | null>(
		null
	);
	const [courseTypes, setCourseTypes] = useState<courseType[] | null>(
		null
	);
	const [courseLevel, setCourseLevel] = useState<
		courseLevel[] | null
	>(null);
	const [open, setOpen] = useState(1);

	const { courseList, status, error, lastCreatedId } = useSelector(
		(state: RootState) => {
			return (
				state.courses || {
					courseList: [],
					status: 'idle2',
					error: null,
				}
			);
		}
	);
	useEffect(() => {
		dispatch(fetchCourses());
	}, [dispatch]);

	const handleOpen = (value: number) =>
		setOpen(open === value ? 0 : value);
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
			<PageTitle title="Configuracion" breadCrumbs={breadCrumbs} />

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
					<Accordion
						open={open === 1}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<AccordionHeader
							onClick={() => handleOpen(1)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Cursos
						</AccordionHeader>
						<AccordionBody>
							<div className="flex flex-col w-full">
								<Typography
									variant="h5"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Crear Curso
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
							</div>
							<br />
							<hr />
							<Typography
								variant="h5"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Lista de Cursos
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
													className="flex flex-col justify-center"
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
														{course.course_level.name}
													</Typography>
													<Typography
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{course.course_type.name}
													</Typography>
													<div className="flex flex-row justify-center">
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
																title="Asignaciones del Curso"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
																onClick={() =>
																	navigate(
																		`../config/course/${course.id}`
																	)
																}
															>
																<BookCheck size={20} />
															</Button>
														</ButtonGroup>
													</div>
												</CardBody>
											</Card>
										</div>
									);
								})}
							</div>
						</AccordionBody>
					</Accordion>
					<Accordion
						open={open === 2}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<AccordionHeader
							onClick={() => handleOpen(2)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Permisos
						</AccordionHeader>
						<AccordionBody>OJO 2</AccordionBody>
					</Accordion>
				</CardBody>
			</Card>

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

export default GeneralConfig;
