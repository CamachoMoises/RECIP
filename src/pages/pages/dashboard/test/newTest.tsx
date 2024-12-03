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
// const hardQuestion: question[] = [
// 	{
// 		question_id: 1,
// 		question_text: '¿Cuál es la clasificación de la batería?',
// 		question_options: [
// 			{
// 				answer_id: 1,
// 				answer_text: '28 voltios, 24 amperios-hora',
// 				answer_is_correct: true,
// 			},
// 			{
// 				answer_id: 2,
// 				answer_text: '24 voltios, 34/36 amperios-hora',
// 				answer_is_correct: false,
// 			},
// 			{
// 				answer_id: 3,
// 				answer_text: '28 voltios, 34/36 amperios-hora',
// 				answer_is_correct: false,
// 			},
// 			{
// 				answer_id: 4,
// 				answer_text: '24 voltios, 42 amperios-hora',
// 				answer_is_correct: false,
// 			},
// 		],
// 	},
// 	{
// 		question_id: 2,
// 		question_text:
// 			'En aviones con números de serie BB-88 y posteriores, ¿cómo se enciende un generador?',
// 		question_options: [
// 			{
// 				answer_id: 1,
// 				answer_text:
// 					'Mueva el interruptor a APAGADO y luego a ENCENDIDO.',
// 				answer_is_correct: true,
// 			},
// 			{
// 				answer_id: 2,
// 				answer_text:
// 					'Mantenga presionado el interruptor en RESET durante un segundo y suéltelo en ON',
// 				answer_is_correct: false,
// 			},
// 			{
// 				answer_id: 3,
// 				answer_text: 'Mueva el interruptor a ON',
// 				answer_is_correct: false,
// 			},
// 			{
// 				answer_id: 4,
// 				answer_text:
// 					'Mantenga el interruptor en ON durante un segundo.',
// 				answer_is_correct: false,
// 			},
// 		],
// 	},
// 	{
// 		question_id: 3,
// 		question_text: '¿Dónde está ubicada la batería?',
// 		question_options: [
// 			{
// 				answer_id: 1,
// 				answer_text: 'En la sección central del ala izquierda',
// 				answer_is_correct: true,
// 			},
// 			{
// 				answer_id: 2,
// 				answer_text: 'En el compartimento de popa',
// 				answer_is_correct: false,
// 			},
// 			{
// 				answer_id: 3,
// 				answer_text: 'En la sección central del ala derecha',
// 				answer_is_correct: false,
// 			},
// 			{
// 				answer_id: 4,
// 				answer_text: 'En el compartimento de la nariz',
// 				answer_is_correct: false,
// 			},
// 		],
// 	},
// ];
const NewTest = () => {
	const navigate = useNavigate();
	let dateTest: moment.Moment | null = null;
	let horas = null;
	const {
		course,
		// subject,
		// user
		test,
	} = useSelector((state: RootState) => {
		return {
			course: state.courses,
			subject: state.subjects,
			user: state.users,
			test: state.tests,
		};
	});
	const [testActive, setTestActive] = useState<boolean>(false);

	console.log(course.courseStudent);

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
			// setTestActive(
			// 	course.courseStudent.course_student_tests.length < 2
			// );
			navigate('test');
		}
		if (course.courseStudent.schedules?.length === 0) {
			// setTestActive(false);
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
			// setTestActive(false);
			navigate('test');
		}
	}

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
										15 Preguntas de seleccion simple
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
										01 Pregunta de completación
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										09 Puntos
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										09 Puntos.
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
										04 Preguntas de desarrollo
									</Typography>
									<Typography
										variant="lead"
										className="text-sm"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										04 Puntos c/u
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
											{test.questionList.map((question, key) => (
												<div
													key={`Question-${question.id}`}
													className="border-2 border-blue-gray-800 rounded-md"
												>
													{question.question_type?.id === 1 && (
														<>
															<QuestionTypeRadio
																question={question}
																countKey={key}
																type={question.question_type.id}
															/>
														</>
													)}
													{question.question_type?.id === 2 && (
														<>
															<QuestionTypeCheck
																question={question}
																countKey={key}
																type={question.question_type.id}
															/>
														</>
													)}
													{question.question_type?.id === 3 && (
														<>
															<QuestionTypeRadio
																question={question}
																countKey={key}
																type={question.question_type.id}
															/>
														</>
													)}
													{question.question_type?.id === 5 && (
														<>
															<QuestionTypeInput
																question={question}
																countKey={key}
																type={question.question_type.id}
															/>
														</>
													)}
												</div>
											))}
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
														navigate('../../dashboard');
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
