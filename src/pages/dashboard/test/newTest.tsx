import { useEffect, useRef, useState } from 'react';
import Countdown from '../../../components/countDown';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, store } from '../../../store';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import { breadCrumbsItems } from '../../../types/utilities';
import PageTitle from '../../../components/PageTitle';
import {
	Button,
	Card,
	CardBody,
	Typography,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	List,
	ListItem,
} from '@material-tailwind/react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import QuestionTypeRadio from './questionTypeRadio';
import QuestionTypeCheck from './questionTypeCheck';
import { CheckCircle, SaveAll, XCircle } from 'lucide-react';
import QuestionTypeInput from './questionTypeInput';
import { axiosPostDefault } from '../../../services/axios';
import QuestionTypeCompletion from './questionTypeCompletion';
import { fetchCourseStudentTest } from '../../../features/testSlice';
import ResultsTestPdf from './resultsTestPdf';
import { useReactToPrint } from 'react-to-print';
import { fetchUser } from '../../../features/userSlice';
import toast from 'react-hot-toast';
import { useTheme } from '../../../hooks/useTheme';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
	{
		name: 'Examenes',
		href: '/dashboard/test',
	},
];
export type question = {
	question_id: number;
	question_text: string;
	question_options: answer[];
};
export type answer = {
	answer_id: number;
	answer_text: string;
	answer_is_correct: boolean;
};

const NewTest = () => {
	const componentRef = useRef<HTMLDivElement>(null);
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const [seePDF, setSeePDF] = useState(false);
	const [score, setScore] = useState(0);
	const [ended, setEnded] = useState(false);
	const { theme } = useTheme();
	let dateTest: moment.Moment | null = null;
	let horas = null;
	const { course, test, user } = useSelector((state: RootState) => {
		return {
			course: state.courses,
			test: state.tests,
			user: state.users,
		};
	});

	useEffect(() => {
		if (theme !== 'light') {
			document.documentElement.setAttribute('data-theme', 'light');
		}
	}, []);

	const handleEndTest = async (course_student_test_id: number) => {
		toast('Finalizando examen...', {
			icon: '⏳',
		});
		setEnded(true);
		setTestActive(false);
		const resp = await axiosPostDefault(
			`api/test/courseStudentTestEnd`,
			{
				course_student_test_id: course_student_test_id,
			},
		);
		await dispatch(
			fetchUser(
				course.courseStudent?.student?.user_id
					? course.courseStudent.student.user_id
					: -1,
			),
		).unwrap();
		await dispatch(
			fetchCourseStudentTest(
				test.courseStudentTestSelected?.id
					? test.courseStudentTestSelected.id
					: -1,
			),
		).unwrap();

		setScore(resp.score);
		setOpen(true);
		setEnded(true);
		setSeePDF(true);
	};

	useEffect(() => {
		const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
		const courseStudentTestId =
			test.courseStudentTestSelected?.id !== undefined
				? test.courseStudentTestSelected.id
				: -1;

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (!ended) {
				event.preventDefault();
				event.returnValue = '¿Desea finalizar el examen?';
				return '¿Desea finalizar el examen?';
			}
		};

		const handleUnload = () => {
			if (!ended && courseStudentTestId !== -1) {
				const token = store.getState().auth.token;
				if (token) {
					try {
						const xhr = new XMLHttpRequest();
						xhr.open(
							'POST',
							`${apiUrl}/api/test/courseStudentTestEnd`,
							false,
						);
						xhr.setRequestHeader(
							'Content-Type',
							'application/json;charset=UTF-8',
						);
						xhr.setRequestHeader('Authorization', `Bearer ${token}`);
						xhr.send(
							JSON.stringify({
								course_student_test_id: courseStudentTestId,
							}),
						);
					} catch (error) {
						// Ignorar errores en unload
					}
				}
			}
		};

		const handlePopState = () => {
			if (!ended) {
				const confirmLeave = window.confirm(
					'¿Desea finalizar el examen? Al confirmar, su examen se finalizará.',
				);
				if (!confirmLeave) {
					window.history.pushState(null, '', window.location.href);
				} else {
					setTestActive(false);
				}
			}
		};

		window.history.pushState(null, '', window.location.href);
		window.addEventListener('beforeunload', handleBeforeUnload);
		window.addEventListener('unload', handleUnload);
		window.addEventListener('popstate', handlePopState);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			window.removeEventListener('unload', handleUnload);
			window.removeEventListener('popstate', handlePopState);
		};
	}, [ended, test.courseStudentTestSelected?.id]);

	const seeResults = async () => {
		handlePrint();
	};
	const testTime = test.testSelected?.duration
		? test.testSelected.duration
		: 0;
	const min_score = test.testSelected?.min_score
		? test.testSelected.min_score
		: 0;
	const TQT = test.testSelected?.test_question_types
		? test.testSelected.test_question_types
		: [];
	let totalPoints = 0;
	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Examen-${test.testSelected?.code}`,
	});
	const [testActive, setTestActive] = useState<boolean>(true);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const endTimeTest = async () => {
		handleEndTest(
			test.courseStudentTestSelected?.id
				? test.courseStudentTestSelected.id
				: -1,
		);
	};

	useEffect(() => {
		if (!testActive && !ended) {
			endTimeTest();
		}
	}, [testActive, endTimeTest, ended]);

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
	// Dialog de resultados (estado ended)
	if (ended) {
		const approved = score >= min_score;
		const scorePercent = Math.min((score / totalPoints) * 100, 100);

		return (
			<>
				<PageTitle
					title={`Examen ${test.courseStudentTestSelected?.code} (${test.testSelected?.code})`}
					breadCrumbs={breadCrumbs}
				/>
				<LoadingPage />

				{/* Dialog resultado */}
				<Dialog
					open={open}
					handler={() => {}}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					size="sm"
				>
					<DialogHeader
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						className="p-0"
					>
						{/* Banner aprobado/reprobado */}
						<div
							style={{
								width: '100%',
								padding: '28px 24px',
								background: approved ? '#EAF3DE' : '#FCEBEB',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: 8,
								borderRadius: '12px 12px 0 0',
							}}
						>
							{approved ? (
								<CheckCircle size={52} color="#3B6D11" />
							) : (
								<XCircle size={52} color="#A32D2D" />
							)}
							<p
								style={{
									fontSize: 22,
									fontWeight: 500,
									margin: 0,
									color: approved ? '#27500A' : '#791F1F',
								}}
							>
								{approved ? '¡Aprobado!' : 'Reprobado'}
							</p>
							<p
								style={{
									fontSize: 13,
									margin: 0,
									color: approved ? '#3B6D11' : '#A32D2D',
								}}
							>
								{approved
									? 'Examen finalizado exitosamente'
									: 'No alcanzaste el puntaje mínimo'}
							</p>
						</div>
					</DialogHeader>

					<DialogBody
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: 16,
							}}
						>
							{/* Métricas */}
							<div
								style={{
									display: 'flex',
									gap: 28,
									textAlign: 'center',
								}}
							>
								<div>
									<p
										style={{
											fontSize: 32,
											fontWeight: 500,
											margin: 0,
											color: approved ? '#3B6D11' : '#A32D2D',
										}}
									>
										{score}
									</p>
									<p
										style={{
											fontSize: 11,
											color: 'var(--color-text-secondary)',
											margin: 0,
										}}
									>
										Puntaje
									</p>
								</div>
								<div
									style={{
										width: '0.5px',
										background: 'var(--color-border-tertiary)',
									}}
								/>
								<div>
									<p
										style={{
											fontSize: 32,
											fontWeight: 500,
											margin: 0,
											color: 'var(--color-text-secondary)',
										}}
									>
										{min_score}
									</p>
									<p
										style={{
											fontSize: 11,
											color: 'var(--color-text-secondary)',
											margin: 0,
										}}
									>
										Mínimo
									</p>
								</div>
								<div
									style={{
										width: '0.5px',
										background: 'var(--color-border-tertiary)',
									}}
								/>
								<div>
									<p
										style={{
											fontSize: 32,
											fontWeight: 500,
											margin: 0,
											color: 'var(--color-text-primary)',
										}}
									>
										{totalPoints}
									</p>
									<p
										style={{
											fontSize: 11,
											color: 'var(--color-text-secondary)',
											margin: 0,
										}}
									>
										Total
									</p>
								</div>
							</div>

							{/* Barra de progreso */}
							<div
								style={{
									width: '100%',
									background: 'var(--color-background-secondary)',
									borderRadius: 999,
									height: 6,
									overflow: 'hidden',
								}}
							>
								<div
									style={{
										width: `${scorePercent}%`,
										height: '100%',
										background: approved ? '#639922' : '#E24B4A',
										borderRadius: 999,
									}}
								/>
							</div>
						</div>
					</DialogBody>

					<DialogFooter
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div style={{ display: 'flex', gap: 8, width: '100%' }}>
							<button
								onClick={() => navigate('../../dashboard')}
								style={{
									flex: 1,
									padding: '8px 0',
									fontSize: 13,
									cursor: 'pointer',
									border: '0.5px solid var(--color-border-secondary)',
									borderRadius: 'var(--border-radius-md)',
									background: 'none',
									color: 'var(--color-text-primary)',
								}}
							>
								Volver
							</button>
							{approved ? (
								<Button
									size="sm"
									variant="filled"
									color="cyan"
									onClick={() => {
										navigate('../../dashboard');
									}}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Volver
								</Button>
							) : (
								<button
									onClick={() => navigate('../test')}
									style={{
										flex: 1,
										padding: '8px 0',
										fontSize: 13,
										cursor: 'pointer',
										border: '0.5px solid #F7C1C1',
										borderRadius: 'var(--border-radius-md)',
										background: '#FCEBEB',
										color: '#791F1F',
									}}
								>
									Repetir examen
								</button>
							)}
						</div>
					</DialogFooter>
				</Dialog>

				<div style={{ display: 'none' }}>
					<div ref={componentRef}>
						{seePDF && (
							<ResultsTestPdf
								course={course}
								test={test}
								user={user}
							/>
						)}
					</div>
				</div>
			</>
		);
	}
	if (!course.courseStudent) {
		navigate('../test');
	} else {
		if (course.courseStudent.schedules?.length === 0) {
			navigate('../test');
		} else {
			dateTest = course.courseStudent.schedules
				? moment(
						`${course.courseStudent.schedules[0].date}  ${course.courseStudent.schedules[0].hour}`,
					)
				: null;
		}

		if (dateTest) {
			const currentDate = moment();
			horas = currentDate.diff(dateTest, 'hours', true);
		}
		if (!horas || horas < 0 || horas > 2) {
			navigate('../test');
		}
	}

	return (
		<div className="container px-2 sm:px-4">
			<PageTitle
				title={`Examen de  ${test.courseStudentTestSelected?.code} (${test.testSelected?.code})`}
			/>
			{dateTest && (
				<>
					<div className="w-full lg:w-auto glass-card-dark p-2 mb-2 rounded-lg">
						<Countdown
							startTime={dateTest.format('HH:mm')}
							totalMinutes={testTime}
							setActive={setTestActive}
						/>
					</div>
					<div className="mx-auto p-4 sm:p-6 glass-card-dark shadow-lg rounded-lg w-full lg:w-auto">
						<div className="flex flex-col justify-center sm:flex-row gap-2 sm:gap-3 ">
							<Typography
								variant="h6"
								className="text-sm sm:text-base"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Inicio: {dateTest.format('hh:mm a')}
							</Typography>
							<Typography
								variant="h6"
								className="text-sm sm:text-base"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Fin:{' '}
								{dateTest.add(testTime, 'minutes').format('hh:mm a')}
							</Typography>
						</div>
						<div className="flex flex-col justify-between mt-2">
							<Typography
								variant="h6"
								className="text-sm sm:text-base mb-2"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Contenido la prueba:
							</Typography>
							{TQT.map((tqt, index) => {
								const amount = tqt.amount;
								const value = tqt.value;
								const totalPointsQuestion = amount * value;
								totalPoints = totalPoints + totalPointsQuestion;
								return (
									<div
										className="flex flex-row justify-between  gap-2 text-xs sm:text-sm"
										key={`tqt-${index}`}
									>
										<Typography
											variant="small"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{amount} {tqt.question_type?.name}
										</Typography>
										<div
											key={`tqt-${index}`}
											className="flex flex-row justify-end gap-2 text-xs sm:text-sm"
										>
											<Typography
												variant="small"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{value} Punto c/u
											</Typography>
											<Typography
												variant="small"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{totalPointsQuestion} Puntos.
											</Typography>
										</div>
									</div>
								);
							})}

							<hr className="my-2" />
							<Typography
								className="text-sm text-end"
								variant="small"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{totalPoints} puntos.
							</Typography>
						</div>
					</div>
					<div className="my-4" />
					<div className="flex flex-col lg:flex-row gap-4 justify-start">
						<div className="mx-auto p-4 sm:p-6 glass-card-dark shadow-lg rounded-sm w-full">
							<Typography
								variant="h6"
								className="text-sm sm:text-base mb-2"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								INSTRUCCIONES:
							</Typography>
							<List
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<ListItem
									className="text-xs sm:text-sm"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Lea cuidadosamente cada pregunta.
								</ListItem>
								<ListItem
									className="text-xs sm:text-sm"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Las preguntas se guardan automaticamente, no hay de
									que preocuparse si se cierra el navegador.
								</ListItem>
								<ListItem
									className="text-xs sm:text-sm"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Consulte con el supervisor cualquier duda que se le
									presente.
								</ListItem>
								<ListItem
									className="text-xs sm:text-sm"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									El examen se realizará a libro cerrado.
								</ListItem>
								<ListItem
									className="text-xs sm:text-sm"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Una vez que finalice el examen, verifíquelo y
									precione finalizar.
								</ListItem>
								<ListItem
									className="text-xs sm:text-sm"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									El examen tendrá una duración de {testTime} minutos.
								</ListItem>
								<ListItem
									className="text-xs sm:text-sm"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Debe tomar en consideración que la honestidad debe
									ser siempre nuestra virtud.
								</ListItem>
								<ListItem
									className="text-xs sm:text-sm"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									La mínima aprobatoria en el puntaje total será{' '}
									{min_score} puntos.
								</ListItem>
							</List>
						</div>
					</div>
					<div className="my-4" />
					<div>
						{testActive && (
							<>
								<Card
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<CardBody
										className="p-2 sm:p-4"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<div className="flex flex-col gap-4">
											{test.courseStudentTestSelected?.course_student_test_questions?.map(
												(questionTest, index) => {
													return (
														<div key={`Question-${questionTest.id}`}>
															{questionTest.question?.question_type
																?.id === 1 && (
																<>
																	<QuestionTypeRadio
																		questionTest={questionTest}
																		countKey={index}
																		type={
																			questionTest.question
																				?.question_type?.id
																		}
																	/>
																</>
															)}
															{questionTest.question?.question_type
																?.id === 2 && (
																<>
																	<QuestionTypeCheck
																		questionTest={questionTest}
																		countKey={index}
																		type={
																			questionTest.question
																				.question_type.id
																		}
																	/>
																</>
															)}
															{questionTest.question?.question_type
																?.id === 3 && (
																<>
																	<QuestionTypeRadio
																		questionTest={questionTest}
																		countKey={index}
																		type={
																			questionTest.question
																				.question_type.id
																		}
																	/>
																</>
															)}
															{questionTest.question?.question_type
																?.id === 4 && (
																<div className="overflow-auto max-w-full max-h-[60vh] w-full">
																	<QuestionTypeCompletion
																		questionTest={questionTest}
																		countKey={index}
																		type={
																			questionTest.question
																				.question_type.id
																		}
																	/>
																</div>
															)}
															{questionTest.question?.question_type
																?.id === 5 && (
																<>
																	<QuestionTypeInput
																		questionTest={questionTest}
																		countKey={index}
																		type={
																			questionTest.question
																				.question_type.id
																		}
																	/>
																</>
															)}
														</div>
													);
												},
											)}

											<button
												onClick={() =>
													handleEndTest(
														test.courseStudentTestSelected?.id ?? -1,
													)
												}
												disabled={!testActive}
												style={{
													display: 'flex',
													flexDirection: 'column',
													alignItems: 'center',
													gap: 4,
													border: '0.5px solid #F7C1C1',
													borderRadius: 'var(--border-radius-md)',
													padding: '10px 18px',
													background: 'none',
													cursor: 'pointer',
													color: '#A32D2D',
													opacity: testActive ? 1 : 0.4,
												}}
											>
												<SaveAll size={20} />
												<span
													style={{ fontSize: 11, fontWeight: 500 }}
												>
													Finalizar
												</span>
											</button>
										</div>
									</CardBody>
								</Card>
							</>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default NewTest;
