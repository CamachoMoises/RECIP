import { useState } from 'react';
import Countdown from '../../../../components/countDown';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import { breadCrumbsItems } from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import {
	Button,
	Card,
	CardBody,
	Typography,
} from '@material-tailwind/react';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import QuestionTypeRadio from './questionTypeRadio';
import QuestionTypeCheck from './questionTypeCheck';
import { SaveAll } from 'lucide-react';
import QuestionTypeInput from './questionTypeInput';
import { axiosPostDefault } from '../../../../services/axios';
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
	const navigate = useNavigate();
	let dateTest: moment.Moment | null = null;
	let horas = null;
	const { course, test } = useSelector((state: RootState) => {
		return {
			course: state.courses,
			test: state.tests,
		};
	});
	const handleEndTest = async (course_student_test_id: number) => {
		const resp = await axiosPostDefault(
			`api/test/courseStudentTestEnd`,
			{
				course_student_test_id: course_student_test_id,
			}
		);
		console.log(resp);
	};
	const [testActive, setTestActive] = useState<boolean>(true);
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
	if (!course.courseStudent) {
		navigate('test');
	} else {
		if (course.courseStudent.course_student_tests?.length === 0) {
			navigate('test');
		}
		if (course.courseStudent.schedules?.length === 0) {
			navigate('test');
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
			navigate('test');
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
										<Typography
											variant="h5"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Preguntas
										</Typography>

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
