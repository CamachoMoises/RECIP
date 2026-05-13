import { useDispatch, useSelector } from 'react-redux';
import PageTitle from '../../../components/PageTitle';
import {
	breadCrumbsItems,
	course,
	courseLevel,
	courseType,
} from '../../../types/utilities';
import { AppDispatch, RootState } from '../../../store';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
	fetchCourses,
	setLastCreatedId,
} from '../../../features/courseSlice';
import { axiosGetDefault } from '../../../services/axios';
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
import { BookCheck, PaperclipIcon, Pencil, Plus } from 'lucide-react';
import ModalFormCourse from './modalFormCourse';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import {
	fetchQuestionTypes,
	// updateQuestionTypes,
} from '../../../features/testSlice';
// import QuestionType from './questionType';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];

const GeneralConfig = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const [openNewCourse, setOpenNewCourse] = useState(false);
	const [courseSelected, setCourseSelected] = useState<course | null>(
		null,
	);
	const [courseTypes, setCourseTypes] = useState<courseType[] | null>(
		null,
	);
	const [courseLevel, setCourseLevel] = useState<
		courseLevel[] | null
	>(null);
	const [open, setOpen] = useState(1);

	const { course, test } = useSelector((state: RootState) => {
		return { course: state.courses, test: state.tests };
	});

	useEffect(() => {
		dispatch(fetchCourses());
		dispatch(fetchQuestionTypes());
	}, [dispatch]);

	const handleOpen = (value: number) =>
		setOpen(open === value ? 0 : value);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const handleOpenEdit = async (course: course | null = null) => {
		const { resp, status } = await axiosGetDefault(
			'api/courses/courseTypes',
		);
		const dataLevel = await axiosGetDefault(
			'api/courses/courseLevel',
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
	// const updateQuestionTypeFunc = async (
	// 	questionTypeId: number,
	// 	value: number
	// ) => {
	// 	const questionType = test.questionTypes.find(
	// 		(QT) => QT.id === questionTypeId
	// 	);
	// 	if (questionType) {
	// 		const newQuestionType = { ...questionType, value: value };
	// 		dispatch(updateQuestionTypes(newQuestionType));
	// 	} else {
	// 		toast.error('No se encontro el tipo de pregunta');
	// 	}
	// };
	useEffect(() => {
		const editCourse = (id: number) => {
			const EC = course.courseList.find((course) => course.id === id);
			if (EC) {
				handleOpenEdit(EC);
			} else {
				toast.error('No se pudo encontrar el curso');
			}
		};

		if (course.lastCreatedId) {
			editCourse(course.lastCreatedId); // Ejecuta la lógica para editar el curso según `lastCreatedId`
			dispatch(setLastCreatedId(null));
		}
	}, [
		course.lastCreatedId,
		dispatch,
		course.courseList,
		handleOpenEdit,
	]);

	if (test.status === 'loading') {
		return (
			<>
				<LoadingPage />
			</>
		);
	}
	if (test.status === 'failed') {
		return (
			<>
				<ErrorPage
					error={course.error ? course.error : 'Indefinido'}
				/>
			</>
		);
	}

	return (
		<div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8">
			<PageTitle title="Configuracion" breadCrumbs={breadCrumbs} />

			<Card
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="w-full overflow-hidden"
			>
				<CardBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="p-2 sm:p-4"
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
							className="text-base sm:text-lg px-2"
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
									className="text-lg sm:text-xl"
								>
									Crear Curso
								</Typography>
								<div className="flex flex-col">
									<Button
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										className="flex flex-col text-center justify-center w-max mx-auto"
										onClick={() => {
											handleOpenEdit();
										}}
									>
										<Plus size={15} className="mx-auto text-lg" />
									</Button>
								</div>
							</div>
							<div className="flex flex-col w-full">
								<Typography
									variant="h5"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									className="text-lg sm:text-xl"
								>
									Lista de Cursos
								</Typography>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-4">
								{course.courseList.map((course) => {
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
													className="flex flex-col justify-center p-2 sm:p-4"
												>
													<div className="relative group text-center sm:text-left">
														<Typography
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture
															variant="lead"
															className="truncate cursor-pointer"
														>
															{course.name.length > 40
																? course.name.substring(0, 40) + '...'
																: course.name}
														</Typography>
														{course.name.length > 40 && (
															<div className="absolute z-50 hidden group-hover:block bg-gray-800 text-white text-sm px-3 py-2 rounded-md shadow-lg -top-8 left-0 w-max max-w-xs whitespace-normal">
																{course.name}
															</div>
														)}
													</div>
													<Typography
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture
														variant="small"
													>
														{course.code}
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
													<div className="flex flex-row justify-center flex-wrap gap-1 sm:gap-0">
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
																title="Secciones del Curso"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
																onClick={() =>
																	navigate(
																		`../config/course/${course.id}`,
																	)
																}
															>
																<BookCheck size={20} />
															</Button>

															<Button
																title="Editar examenes del curso"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
																disabled={course.course_type.id !== 1}
																onClick={() =>
																	navigate(
																		`../config/test/${course.id}`,
																	)
																}
															>
																<PaperclipIcon size={20} />
															</Button>
														</ButtonGroup>
													</div>
												</CardBody>
											</Card>
										</div>
									);
								})}
							</div>
							{/* <Typography
								variant="h4"
								className="mt-6"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Valor de las preguntas
							</Typography>
							<div className="grid grid-cols-2 gap-2">
								{test.questionTypes.map((QT) => {
									return (
										<div key={`QT-${QT.id}`}>
											<QuestionType
												QT={QT}
												updateQuestionTypeFunc={
													updateQuestionTypeFunc
												}
											/>
										</div>
									);
								})}
							</div> */}
						</AccordionBody>
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
