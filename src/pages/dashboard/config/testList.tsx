import { useNavigate, useParams } from 'react-router-dom';
import {
	breadCrumbsItems,
	test,
	testQuestionType,
} from '../../../types/utilities';
import PageTitle from '../../../components/PageTitle';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { useEffect, useState } from 'react';
import { fetchCourse } from '../../../features/courseSlice';
import {
	fetchQuestionTypes,
	fetchTests,
	unlinkTestFromCourse,
	updateTest,
	updateTestQuestionTypes,
} from '../../../features/testSlice';
import {
	Button,
	Card,
	CardBody,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	List,
	ListItem,
	Typography,
} from '@material-tailwind/react';
import QuestionTest from './questionTest';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import TestParams from './testParams';
import { Copy, Link2, Plus, Unlink, Upload } from 'lucide-react';
import NewTestModal from './newTestModal';
import ExcelUploadComponent from './excelUploadComponent';
import LinkTestModal from './linkTestModal';
import CloneTestModal from './cloneTestModal';
import toast from 'react-hot-toast';
import { isCourseDeleted } from '../../../utils/courseStatus';
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
const TestList = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [openExcelUpload, setOpenExcelUpload] = useState(false);
	const [openLink, setOpenLink] = useState(false);
	const [testToUnlink, setTestToUnlink] = useState<test | null>(null);
	const [testToClone, setTestToClone] = useState<test | null>(null);
	const [unlinking, setUnlinking] = useState(false);
	const { id } = useParams<{ id: string }>();
	const { course, test } = useSelector((state: RootState) => {
		return { course: state.courses, test: state.tests };
	});

	useEffect(() => {
		dispatch(fetchCourse(parseInt(id ? id : '-1')));
		dispatch(fetchTests(id ? parseInt(id) : -1));
		dispatch(fetchQuestionTypes());
	}, [dispatch, id]);
	useEffect(() => {
		if (course.courseSelected?.course_type.id) {
			if (course.courseSelected.course_type.id != 1) {
				// navigate('../');
			}
		}
	}, [course, navigate]);
	const testActive = test.testList.find((TF) => TF.status);

	const updateTestQuestion = async (
		testQuestion: testQuestionType,
		amount: number,
		value: number,
	) => {
		const newTestQuestionType: testQuestionType = {
			...testQuestion,
			amount,
			value,
		};

		try {
			await dispatch(updateTestQuestionTypes(newTestQuestionType)).unwrap();
		} catch (error: any) {
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al actualizar la cantidad de preguntas',
			);
		}
	};

	const updateTestFunc = async (
		test: test,
		data: { duration: number; min_score: number; status: boolean },
	) => {
		try {
			// Solo se desactiva el examen activo cuando es OTRO examen. Si es el
			// mismo, el backend omite la revalidación de conflicto al ya estar
			// activo y evita dos llamadas innecesarias.
			if (data.status && testActive && testActive.id !== test.id) {
				const oldTestActive: test = { ...testActive, status: false };
				await dispatch(updateTest(oldTestActive)).unwrap();
			}
			const newTest: test = {
				...test,
				duration: data.duration,
				min_score: data.min_score,
				status: data.status,
			};
			await dispatch(updateTest(newTest)).unwrap();
		} catch (error: any) {
			// 409 (examen activo en otro curso vinculado, todos los cursos
			// eliminados) y 404 llegan como toast, sin reemplazar la pantalla.
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al actualizar el examen',
			);
		}
	};

	const handleUnlinkTest = async () => {
		if (!testToUnlink || !course.courseSelected?.id) return;
		setUnlinking(true);
		try {
			const result = await dispatch(
				unlinkTestFromCourse({
					course_id: course.courseSelected.id,
					test_id: testToUnlink.id,
				}),
			).unwrap();
			if (result.removed) {
				toast.success(
					'Examen desvinculado. El examen, sus preguntas e intentos se conservan.',
				);
			} else {
				toast('El examen ya no estaba vinculado a este curso');
			}
			setTestToUnlink(null);
		} catch (error: any) {
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al desvincular el examen',
			);
		} finally {
			setUnlinking(false);
		}
	};

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
				<ErrorPage error={test.error ? test.error : 'Indefinido'} />
			</>
		);
	}

	// Un curso eliminado sigue mostrando su historial de exámenes, pero no
	// admite crear exámenes ni modificar parámetros (`POST/PUT /api/test` → 409).
	const courseDeleted = course.courseSelected
		? isCourseDeleted(course.courseSelected)
		: false;
	// Solo los cursos de teoría (course_type_id = 1) pueden compartir exámenes.
	const isTheoryCourse =
		course.courseSelected?.course_type?.id === 1;

	return (
		<>
			<PageTitle
				title={`Editar Evaluaciones del curso ${course.courseSelected?.name}`}
				breadCrumbs={breadCrumbs}
			/>
			<div className="flex flex-col gap-3 p-2 sm:p-4">
				{courseDeleted && (
					<div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
						<strong>Curso inactivo.</strong> Los exámenes y sus
						preguntas se conservan, pero no se pueden crear exámenes
						ni cambiar sus parámetros hasta reactivar el curso desde
						Configuración.
					</div>
				)}
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
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
							<Typography
								variant="h5"
								className="text-left text-sm sm:text-base"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Cantidad de examenes {test.testList.length}
							</Typography>
							<div className="flex flex-wrap gap-2">
								{!courseDeleted && (
									<>
										{isTheoryCourse && (
											<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
												size="sm"
												title="Vincular examen existente"
												variant="outlined"
												onClick={() => {
													setOpenLink(true);
												}}
												placeholder={undefined}
											>
												<Link2 size={15} className="mx-auto text-lg" />
											</Button>
										)}
										<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
											size="sm"
											title="Agregar examen"
											variant="filled"
											onClick={() => {
												setOpen(!open);
											}}
											placeholder={undefined}
										>
											<Plus size={15} className="mx-auto text-lg" />
										</Button>
										<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
											size="sm"
											title="Subir preguntas desde Excel"
											variant="outlined"
											onClick={() => {
												setOpenExcelUpload(!openExcelUpload);
											}}
											placeholder={undefined}
										>
											<Upload size={15} className="mx-auto text-lg" />
										</Button>
									</>
								)}
							</div>
						</div>
					</CardBody>
				</Card>
				<div className="flex flex-col gap-3">
					{test.testList.map((TL, indexTL) => {
						// `is_shared` lo calcula el backend con `courses.length > 1`;
						// el fallback cubre respuestas antiguas cacheadas.
						const linkedCourses = TL.courses ?? [];
						const isShared =
							TL.is_shared ?? linkedCourses.length > 1;
						const ownerCourse = TL.course;
						const ownerIsCurrent =
							!ownerCourse ||
							ownerCourse.id === course.courseSelected?.id;
						const linkedNames = linkedCourses
							.map((C) => C.name)
							.join(', ');
						// v1 no guarda linaje (`parent_test_id`): el código
						// `${origen}-COPIA[-N]` es la única pista de que es una
						// variante. Es solo informativo.
						const variantRoot = /-COPIA(-\d+)?$/i.test(TL.code ?? '')
							? (TL.code ?? '').replace(/-COPIA(-\d+)?$/i, '')
							: null;

						return (
							<div key={`test-${indexTL}`}>
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
											className="text-sm sm:text-base md:text-lg"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Evaluacion del {course.courseSelected?.name}
										</Typography>

										<div className="flex flex-wrap items-center gap-2">
											<Typography
												variant="h6"
												color={TL.status ? 'green' : 'red'}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{TL.status ? <>Activo</> : <>Inactivo</>}
											</Typography>
											{isShared && (
												<span
													title={
														linkedNames
															? `Cursos: ${linkedNames}`
															: undefined
													}
													className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
												>
													<Link2 size={12} />
													Compartido con{' '}
													{linkedCourses.length} cursos
												</span>
											)}
											{!ownerIsCurrent && ownerCourse && (
												<span
													title={`Curso dueño del examen: ${ownerCourse.name}`}
													className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
												>
													Examen del curso{' '}
													{ownerCourse.name}
												</span>
											)}
											{variantRoot && (
												<span
													title={`Variante independiente${
														variantRoot
															? ` de ${variantRoot}`
															: ''
													}: editarla no afecta al examen original`}
													className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800"
												>
													<Copy size={12} />
													Variante
													{variantRoot
														? ` de ${variantRoot}`
														: ''}
												</span>
											)}
											<div className="ml-auto flex items-center gap-1">
												<Button
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													size="sm"
													variant="text"
													color="blue"
													title={
														courseDeleted
															? 'Clonar este examen en otro curso (rescatar contenido del curso inactivo)'
															: 'Clonar este examen en otro curso (variante independiente)'
													}
													placeholder={undefined}
													onClick={() => {
														setTestToClone(TL);
													}}
												>
													<Copy size={14} />
												</Button>
												{isShared && !courseDeleted && (
													<Button
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
														size="sm"
														variant="text"
														color="red"
														title="Desvincular este examen del curso"
														placeholder={undefined}
														onClick={() => {
															setTestToUnlink(TL);
														}}
													>
														<Unlink size={14} />
													</Button>
												)}
											</div>
										</div>

										<Typography
											variant="small"
											className="text-xs sm:text-sm"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{course.courseSelected?.course_level.name}{' '}
											{TL.code}
										</Typography>
										<div className="flex flex-col ">
											<div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
												<div>
													<Typography
														variant="h6"
														className="text-sm sm:text-base"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														Preguntas por examen
													</Typography>
													<List
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{test.questionTypes.map((QT, indexQT) => {
															const TQT = TL.test_question_types.find(
																(QTT) =>
																	QTT.question_type_id === QT.id,
															);
															const TQT_2: testQuestionType = {
																id: -1,
																course_id: TL.course_id,
																amount: 0,
																value: 0,
																question_type_id: QT.id,
																status: true,
																test_id: TL.id,
															};
															return (
																<ListItem
																	key={`question-${indexQT}`}
																	className=" flex flex-row justify-between"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	<QuestionTest
																		QT={QT}
																		TQT={TQT ? TQT : TQT_2}
																		courseId={
																			course.courseSelected?.id
																		}
																		disabled={courseDeleted}
																		updateTestQuestion={
																			updateTestQuestion
																		}
																	/>
																</ListItem>
															);
														})}
													</List>
												</div>
												<div>
													<Typography
														variant="h6"
														className="text-sm sm:text-base"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														Parametros del examen
													</Typography>

													<TestParams
														test={TL}
														disabled={courseDeleted}
														updateTestFunc={updateTestFunc}
													/>
												</div>
											</div>
										</div>
									</CardBody>
								</Card>
							</div>
						);
					})}
				</div>
				{openExcelUpload && (
					<ExcelUploadComponent
						open={openExcelUpload}
						setOpen={setOpenExcelUpload}
						courseId={course.courseSelected?.id || -1}
						testList={test.testList}
					/>
				)}
			</div>
			{open && course.courseSelected && (
				<>
					<NewTestModal
						open={open}
						setOpen={setOpen}
						courseId={course.courseSelected.id}
					/>
				</>
			)}
			{openLink && course.courseSelected && (
				<LinkTestModal
					open={openLink}
					setOpen={setOpenLink}
					courseId={course.courseSelected.id}
					courseName={course.courseSelected.name}
					linkedTestIds={test.testList.map((TL) => TL.id)}
					hasActiveTest={!!testActive}
				/>
			)}
			{testToClone && course.courseSelected && (
				<CloneTestModal
					open={testToClone !== null}
					setOpen={(value) => {
						if (!value) setTestToClone(null);
					}}
					test={testToClone}
					currentCourseId={course.courseSelected.id}
				/>
			)}
			<Dialog
				open={testToUnlink !== null}
				handler={() => {
					if (!unlinking) setTestToUnlink(null);
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
					Desvincular examen
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Se desvinculará el examen{' '}
					<strong>{testToUnlink?.code}</strong> del curso{' '}
					<strong>{course.courseSelected?.name}</strong>.
					{testToUnlink?.is_shared && (
						<span className="mt-2 block text-sm text-gray-700">
							Solo se quita el vínculo con este curso: el examen, sus
							preguntas, respuestas e intentos se conservan y los
							demás cursos vinculados no se ven afectados. La regla
							de un examen activo por curso también se mantiene.
						</span>
					)}
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Button
						variant="text"
						color="gray"
						onClick={() => setTestToUnlink(null)}
						disabled={unlinking}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						className="mr-2"
					>
						Cancelar
					</Button>
					<Button
						color="red"
						onClick={handleUnlinkTest}
						disabled={unlinking}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						{unlinking ? 'Desvinculando...' : 'Desvincular'}
					</Button>
				</DialogFooter>
			</Dialog>
		</>
	);
};

export default TestList;
