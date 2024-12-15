import { useEffect, useRef, useState } from 'react';
import Countdown from '../../../../components/countDown';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import { breadCrumbsItems } from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import {
	Button,
	Card,
	CardBody,
	Typography,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
} from '@material-tailwind/react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import QuestionTypeRadio from './questionTypeRadio';
import QuestionTypeCheck from './questionTypeCheck';
import { SaveAll } from 'lucide-react';
import QuestionTypeInput from './questionTypeInput';
import { axiosPostDefault } from '../../../../services/axios';
import QuestionTypeCompletion from './questionTypeCompletion';
import { fetchCourseStudentTest } from '../../../../features/testSlice';
import ResultsTestPdf from './resultsTestPdf';
import { useReactToPrint } from 'react-to-print';
import { fetchUser } from '../../../../features/userSlice';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
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
	const handleOpen = () => setOpen(!open);
	const [ended, setEnded] = useState(false);
	let dateTest: moment.Moment | null = null;
	let horas = null;
	const { course, test, user } = useSelector((state: RootState) => {
		return {
			course: state.courses,
			test: state.tests,
			user: state.users,
		};
	});
	const handleEndTest = async (course_student_test_id: number) => {
		const resp = await axiosPostDefault(
			`api/test/courseStudentTestEnd`,
			{
				course_student_test_id: course_student_test_id,
			}
		);
		console.log('dip');
		const userdata = await dispatch(
			fetchUser(
				course.courseStudent?.student?.user_id
					? course.courseStudent.student.user_id
					: -1
			)
		).unwrap();
		const testData = await dispatch(
			fetchCourseStudentTest(
				test.courseStudentTestSelected?.id
					? test.courseStudentTestSelected.id
					: -1
			)
		).unwrap();
		console.log(testData);
		console.log(userdata);
		setScore(resp.score);
		setOpen(true);
		setEnded(true);
		setSeePDF(true);
	};
	const seeResults = async () => {
		handlePrint();

		// navigate('../../dashboard');
	};
	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Curso-${course.courseStudent?.code}`,
	});
	const [testActive, setTestActive] = useState<boolean>(true);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const endTimeTest = async () => {
		handleEndTest(
			test.courseStudentTestSelected?.id
				? test.courseStudentTestSelected.id
				: -1
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
	if (ended) {
		return (
			<>
				<PageTitle
					title={`Examen de ${course.courseSelected?.name} ${test.courseStudentTestSelected?.code}`}
					breadCrumbs={breadCrumbs}
				/>
				<LoadingPage />
				<Dialog
					open={open}
					handler={handleOpen}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<DialogHeader
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Examen finalizado
					</DialogHeader>
					<DialogBody
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						El examen a finalizado si calificacion total es {score}
						/100
					</DialogBody>
					<DialogFooter
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="flex flex-row gap-3">
							<Button
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
							{score > 1 ? (
								<Button
									variant="filled"
									color="green"
									onClick={() => {
										seeResults();
									}}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<span>Ver detalles</span>
								</Button>
							) : (
								<>
									<Button
										variant="filled"
										color="red"
										onClick={() => {
											navigate('../test');
										}}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<span>Repetir examen</span>
									</Button>
								</>
							)}
						</div>
					</DialogFooter>
				</Dialog>
				<div style={{ display: 'none' }}>
					<div ref={componentRef} className="flex flex-col w-full">
						{seePDF && (
							<>
								<ResultsTestPdf
									course={course}
									test={test}
									user={user}
								/>
							</>
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
						`${course.courseStudent.schedules[0].date}  ${course.courseStudent.schedules[0].hour}`
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
	// console.log('horas', test.courseStudentTestSelected);

	return (
		<div className="container">
			<PageTitle
				title={`Examen de ${course.courseSelected?.name} ${test.courseStudentTestSelected?.code}`}
				breadCrumbs={breadCrumbs}
			/>
			{dateTest && (
				<>
					<div className="flex flex-row gap-4 justify-start">
						<Countdown
							startTime={dateTest.format('HH:mm')}
							totalMinutes={120}
							setActive={setTestActive}
						/>
						<div className=" mx-auto p-6 bg-white shadow-lg rounded-lg">
							<Typography
								variant="h5"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Fecha y hora de inicio:{' '}
								{dateTest.format('DD/MM/YYYY HH:mm')}
							</Typography>
							<div className="flex flex-col justify-between">
								<Typography
									variant="h6"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									CONTENIDO:
								</Typography>
								<div className="flex flex-row justify-between gap-3">
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										30 Preguntas de seleccion simple
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										01 Punto c/u
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										30 Puntos.
									</Typography>
								</div>

								<div className="flex flex-row justify-between gap-3">
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										15 Preguntas de selección múltiple
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										02 Puntos c/u
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										30 Puntos.
									</Typography>
								</div>
								<div className="flex flex-row justify-between gap-3">
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										10 Preguntas de verdadero y falso
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										1,5 Puntos c/u
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										15 Puntos.
									</Typography>
								</div>
								<div className="flex flex-row justify-between gap-3">
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										1 Pregunta de completación
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										9 Puntos
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										9 Puntos.
									</Typography>
								</div>
								<div className="flex flex-row justify-between gap-3">
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										4 Preguntas de desarrollo
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										4 Puntos c/u
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										16 puntos.
									</Typography>
								</div>
								<hr />
								<Typography
									className="text-sm text-end"
									variant="lead"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									100 puntos.
								</Typography>
							</div>
						</div>
					</div>
					<br />
					<div>
						{testActive && (
							<>
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
																<>
																	<QuestionTypeCompletion
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
												}
											)}

											<Typography
												variant="h5"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Finalizar
											</Typography>
											<div className="flex flex-col">
												<Button
													onClick={() => {
														handleEndTest(
															test.courseStudentTestSelected?.id
																? test.courseStudentTestSelected.id
																: -1
														);
													}}
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													className="flex flex-col text-center justify-center "
												>
													<SaveAll
														size={15}
														className="mx-auto text-lg"
													/>
												</Button>
											</div>
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
