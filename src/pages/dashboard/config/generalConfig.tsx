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
	cloneCourse,
	deleteCourse,
	reorderCourses,
	restoreCourse,
	setLastCreatedId,
} from '../../../features/courseSlice';
import { isCourseDeleted } from '../../../utils/courseStatus';
import { axiosGetDefault } from '../../../services/axios';
import toast from 'react-hot-toast';
import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	Button,
	ButtonGroup,
	Input,
	Card,
	CardBody,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Typography,
} from '@material-tailwind/react';
import {
	ArrowDown,
	ArrowUp,
	BookCheck,
	Copy,
	PaperclipIcon,
	Pencil,
	Plus,
	RotateCcw,
	Search,
	Trash2,
} from 'lucide-react';
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
	const [courseToClone, setCourseToClone] = useState<course | null>(
		null,
	);
	const [cloning, setCloning] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	// `all` (por defecto) incluye los cursos inactivos: así el orden manual
	// funciona desde el inicio y el recién inactivado sigue visible para poder
	// reactivarlo. `active` los oculta y deshabilita las flechas.
	const [courseStateFilter, setCourseStateFilter] = useState<
		'all' | 'active'
	>('all');
	const [courseToDelete, setCourseToDelete] = useState<course | null>(
		null,
	);
	const [courseToRestore, setCourseToRestore] = useState<course | null>(
		null,
	);
	const [working, setWorking] = useState(false);

	const { course, test } = useSelector((state: RootState) => {
		return { course: state.courses, test: state.tests };
	});

	const filteredCourses = course.courseList.filter((c) => {
		if (courseStateFilter === 'active' && isCourseDeleted(c)) return false;
		const term = searchTerm.toLowerCase().trim();
		if (!term) return true;
		return (
			(c.name || '').toLowerCase().includes(term) ||
			(c.code || '').toLowerCase().includes(term)
		);
	});

	// Orden manual (`course.row_order`). Las flechas envían la lista COMPLETA,
	// nunca `filteredCourses`. Con búsqueda o filtro activo los vecinos
	// visibles no son los reales, así que se deshabilitan: mover un curso ahí
	// lo reordenaría "salteando" los ocultos.
	const fullCourseList = course.courseList;
	const canReorder = !searchTerm.trim() && courseStateFilter === 'all';

	useEffect(() => {
		// Configuración debe ver también los cursos eliminados para poder
		// reactivarlos. Sin `include_inactive` quedarían inalcanzables en la UI.
		dispatch(fetchCourses({ include_inactive: true }));
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

	const handleCloneCourse = async () => {
		if (!courseToClone?.id) return;
		setCloning(true);
		try {
			const result = await dispatch(
				cloneCourse(courseToClone.id),
			).unwrap();
			toast.success(
				`Curso clonado: ${result.subjects_cloned} secciones, ` +
					`${result.subject_days_cloned} días, ` +
					`${result.subject_lessons_cloned} lecciones, ` +
					`${result.subject_lesson_days_cloned} lecciones por día`,
			);
			setCourseToClone(null);
		} catch (error) {
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al clonar el curso',
			);
		} finally {
			setCloning(false);
		}
	};

	const handleDeleteCourse = async () => {
		if (!courseToDelete?.id) return;
		setWorking(true);
		try {
			await dispatch(deleteCourse(courseToDelete.id)).unwrap();
			toast.success(
				'Curso inactivado. Su historial se conserva y puedes reactivarlo.',
			);
			setCourseToDelete(null);
		} catch (error) {
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al inactivar el curso',
			);
		} finally {
			setWorking(false);
		}
	};

	const handleRestoreCourse = async () => {
		if (!courseToRestore?.id) return;
		setWorking(true);
		try {
			await dispatch(restoreCourse(courseToRestore.id)).unwrap();
			toast.success('Curso reactivado');
			setCourseToRestore(null);
		} catch (error) {
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al reactivar el curso',
			);
		} finally {
			setWorking(false);
		}
	};

	// Sube/baja un curso una posición y persiste con `PUT /api/courses/order`.
	// El backend responde la lista completa ya ordenada, así que el reducer
	// reemplaza `courseList` sin un segundo `fetchCourses()`.
	const handleMoveCourse = async (
		courseId: number,
		direction: -1 | 1,
	) => {
		const ids = fullCourseList.map((c) => c.id as number);
		const from = ids.indexOf(courseId);
		const to = from + direction;
		if (from === -1 || to < 0 || to >= ids.length) return;

		[ids[from], ids[to]] = [ids[to], ids[from]];

		try {
			await dispatch(reorderCourses(ids)).unwrap();
		} catch (error) {
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al guardar el orden',
			);
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
	// Un fallo de los thunks de curso solo reemplaza la pantalla si no hay
	// lista que mostrar: un 409/404 de eliminar/reactivar debe verse como toast.
	if (course.status === 'failed' && !course.courseList.length) {
		return <ErrorPage error={course.error ?? 'Indefinido'} />;
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
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
								<Typography
									variant="h5"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									className="text-lg sm:text-xl"
								>
									Lista de Cursos
									{filteredCourses.length > 0 && (
										<span className="ml-2 text-sm font-normal text-gray-500">
											({filteredCourses.length})
										</span>
									)}
								</Typography>
								<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
									<div className="relative flex w-full sm:w-72">
										<Input
											type="text"
											placeholder="Buscar curso..."
											className="pr-8"
											value={searchTerm}
											onChange={(e) =>
												setSearchTerm(e.target.value)
											}
											containerProps={{
												className: 'min-w-[100px]',
											}}
											labelProps={{ className: 'hidden' }}
											crossOrigin={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
										<Search className="absolute right-3 top-2.5 h-5 w-5 text-blue-gray-300" />
									</div>
									<select
										value={courseStateFilter}
										onChange={(e) =>
											setCourseStateFilter(
												e.target.value as
													| 'all'
													| 'active',
											)
										}
										title="Estado de los cursos a mostrar"
										className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-full sm:w-44"
									>
										<option value="all">Todos los cursos</option>
										<option value="active">
											Solo activos
										</option>
									</select>
									<Button
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										placeholder={undefined}
										title="Crear Curso"
										className="flex items-center justify-center gap-2"
										onClick={() => {
											handleOpenEdit();
										}}
									>
										<Plus size={18} />
										<span className="hidden sm:inline">
											Nuevo
										</span>
									</Button>
								</div>
							</div>
							{!canReorder && (
								<Typography
									variant="small"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									className="mb-3 text-xs text-gray-500"
								>
									{searchTerm.trim()
										? 'Quita la búsqueda para reordenar los cursos.'
										: 'Cambia el filtro a «Todos los cursos» para reordenar.'}
								</Typography>
							)}
							{filteredCourses.length === 0 && (
								<Typography
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									variant="small"
									className="text-center text-gray-500 py-4"
								>
									No se encontraron cursos
								</Typography>
							)}
							<div className="grid grid-cols-2 gap-2 sm:gap-4">
								{filteredCourses.map((course) => {
									// Índice en la lista COMPLETA (`courseList`), no en
									// `filteredCourses`: las flechas mueven posiciones
									// reales de `row_order`.
									const fullIndex = fullCourseList.findIndex(
										(c) => c.id === course.id,
									);
									return (
										<div key={course.id} className="min-w-0 h-full">
											<Card
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												className={`relative h-full overflow-hidden ${
													isCourseDeleted(course)
														? 'opacity-60'
														: ''
												}`}
											>
												{isCourseDeleted(course) && (
													<span className="absolute right-2 top-2 z-10 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
														Inactivo
													</span>
												)}
												<span
													title="Color del curso"
													aria-label="Color del curso"
													className="absolute inset-y-0 left-0 w-3 border-r border-black/10"
													style={{
														backgroundColor:
															course.color || '#ffffff',
													}}
												/>
												<CardBody
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													className="flex flex-col justify-center h-full p-2 pl-5 sm:p-4 sm:pl-6"
												>
													<div className="text-center sm:text-left">
														<Typography
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture
															variant="lead"
															className="cursor-pointer break-words whitespace-normal"
														>
															{course.name}
														</Typography>
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
													<div className="flex flex-col items-center justify-center gap-1">
														{isCourseDeleted(course) ? (
															<ButtonGroup
																size="sm"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
																	title="Clonar el Curso"
																	placeholder={undefined}
																	onClick={() =>
																		setCourseToClone(
																			course,
																		)
																	}
																>
																	<Copy size={20} />
																</Button>
																<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
																	title="Reactivar el Curso"
																	placeholder={undefined}
																	color="green"
																	onClick={() =>
																		setCourseToRestore(
																			course,
																		)
																	}
																>
																	<RotateCcw size={20} />
																</Button>
															</ButtonGroup>
														) : (
															<>
																<ButtonGroup
																	size="sm"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																	className="flex-wrap justify-center"
																>
																	<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
																		title="Editar el Curso"
																		placeholder={undefined}
																		onClick={() => handleOpenEdit(course)}
																	>
																		<Pencil size={20} />
																	</Button>
																	<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
																		title="Secciones del Curso"
																		placeholder={undefined}
																		onClick={() =>
																			navigate(
																				`../config/course/${course.id}`,
																			)
																		}
																	>
																		<BookCheck size={20} />
																	</Button>
																	<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
																		title="Editar examenes del curso"
																		placeholder={undefined}
																		disabled={course.course_type.id !== 1}
																		onClick={() =>
																			navigate(
																				`../config/test/${course.id}`,
																			)
																		}
																	>
																		<PaperclipIcon size={20} />
																	</Button>
																	<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
																		title="Clonar el Curso"
																		placeholder={undefined}
																		onClick={() =>
																			setCourseToClone(
																				course,
																			)
																		}
																	>
																		<Copy size={20} />
																	</Button>
																</ButtonGroup>
																<ButtonGroup
																	size="sm"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
																		title="Subir"
																		placeholder={undefined}
																		disabled={
																			!canReorder ||
																			fullIndex <= 0
																		}
																		onClick={() =>
																			handleMoveCourse(
																				course.id as number,
																				-1,
																			)
																		}
																	>
																		<ArrowUp size={16} />
																	</Button>
																	<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
																		title="Bajar"
																		placeholder={undefined}
																		disabled={
																			!canReorder ||
																			fullIndex >=
																				fullCourseList.length -
																					1
																		}
																		onClick={() =>
																			handleMoveCourse(
																				course.id as number,
																				1,
																			)
																		}
																	>
																		<ArrowDown size={16} />
																	</Button>
																	<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
																		title="Inactivar el Curso"
																		placeholder={undefined}
																		color="red"
																		onClick={() =>
																			setCourseToDelete(
																				course,
																			)
																		}
																	>
																		<Trash2 size={20} />
																	</Button>
																</ButtonGroup>
															</>
														)}
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

			<Dialog
				open={courseToClone !== null}
				handler={() => {
					if (!cloning) setCourseToClone(null);
				}}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Confirmar clonación
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Se creará una copia del curso{' '}
					<strong className="break-all">
						{courseToClone?.name}
					</strong>{' '}
					(<span className="break-all">{courseToClone?.code}</span>)
					con todas sus secciones, días y lecciones.
					<br />
					<span className="text-sm">
						No se copiarán alumnos, horarios, asistencias, grupos,
						tests ni evaluaciones del curso original.
					</span>
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Button
						variant="text"
						color="gray"
						disabled={cloning}
						onClick={() => setCourseToClone(null)}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						className="mr-2"
					>
						Cancelar
					</Button>
					<Button
						disabled={cloning}
						onClick={handleCloneCourse}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						{cloning ? 'Clonando...' : 'Clonar'}
					</Button>
				</DialogFooter>
			</Dialog>

			{/* Confirmar eliminación (soft delete) */}
			<Dialog
				open={courseToDelete !== null}
				handler={() => {
					if (!working) setCourseToDelete(null);
				}}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Inactivar curso
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Se marcará{' '}
					<strong className="break-all">
						{courseToDelete?.name}
					</strong>{' '}
					(<span className="break-all">{courseToDelete?.code}</span>)
					como inactivo. <br />
					<span className="text-sm">
						No se borra nada: alumnos, horarios, asistencias,
						exámenes, evaluaciones y grupos se conservan. No se
						podrán crear matrículas ni programar nuevas actividades
						hasta reactivarlo. Puedes deshacerlo cuando quieras.
					</span>
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Button
						variant="text"
						color="gray"
						disabled={working}
						onClick={() => setCourseToDelete(null)}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						className="mr-2"
					>
						Cancelar
					</Button>
					<Button
						color="red"
						disabled={working}
						onClick={handleDeleteCourse}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						{working ? 'Inactivando...' : 'Inactivar'}
					</Button>
				</DialogFooter>
			</Dialog>

			{/* Confirmar reactivación */}
			<Dialog
				open={courseToRestore !== null}
				handler={() => {
					if (!working) setCourseToRestore(null);
				}}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Reactivar curso
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Se reactivará el curso{' '}
					<strong className="break-all">
						{courseToRestore?.name}
					</strong>{' '}
					(<span className="break-all">{courseToRestore?.code}</span>)
					y volverá a admitir matrículas, actividades, exámenes y
					evaluaciones.
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Button
						variant="text"
						color="gray"
						disabled={working}
						onClick={() => setCourseToRestore(null)}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						className="mr-2"
					>
						Cancelar
					</Button>
					<Button
						color="green"
						disabled={working}
						onClick={handleRestoreCourse}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						{working ? 'Reactivando...' : 'Reactivar'}
					</Button>
				</DialogFooter>
			</Dialog>
		</div>
	);
};

export default GeneralConfig;
