import { useState } from 'react';
import Countdown from '../../../../components/countDown';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import { breadCrumbsItems } from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import { Card, CardBody, Typography } from '@material-tailwind/react';
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
const hardQuestion: question[] = [
	{
		question_id: 1,
		question_text: '¿Cuál es la clasificación de la batería?',
		question_options: [
			{
				answer_id: 1,
				answer_text: '28 voltios, 24 amperios-hora',
				answer_is_correct: true,
			},
			{
				answer_id: 2,
				answer_text: '24 voltios, 34/36 amperios-hora',
				answer_is_correct: false,
			},
			{
				answer_id: 3,
				answer_text: '28 voltios, 34/36 amperios-hora',
				answer_is_correct: false,
			},
			{
				answer_id: 4,
				answer_text: '24 voltios, 42 amperios-hora',
				answer_is_correct: false,
			},
		],
	},
	{
		question_id: 2,
		question_text:
			'En aviones con números de serie BB-88 y posteriores, ¿cómo se enciende un generador?',
		question_options: [
			{
				answer_id: 1,
				answer_text:
					'Mueva el interruptor a APAGADO y luego a ENCENDIDO.',
				answer_is_correct: true,
			},
			{
				answer_id: 2,
				answer_text:
					'Mantenga presionado el interruptor en RESET durante un segundo y suéltelo en ON',
				answer_is_correct: false,
			},
			{
				answer_id: 3,
				answer_text: 'Mueva el interruptor a ON',
				answer_is_correct: false,
			},
			{
				answer_id: 4,
				answer_text:
					'Mantenga el interruptor en ON durante un segundo.',
				answer_is_correct: false,
			},
		],
	},
	{
		question_id: 3,
		question_text: '¿Dónde está ubicada la batería?',
		question_options: [
			{
				answer_id: 1,
				answer_text: 'En la sección central del ala izquierda',
				answer_is_correct: true,
			},
			{
				answer_id: 2,
				answer_text: 'En el compartimento de popa',
				answer_is_correct: false,
			},
			{
				answer_id: 3,
				answer_text: 'En la sección central del ala derecha',
				answer_is_correct: false,
			},
			{
				answer_id: 4,
				answer_text: 'En el compartimento de la nariz',
				answer_is_correct: false,
			},
		],
	},
];
const NewTest = () => {
	const {
		course,
		// subject,
		// user
	} = useSelector((state: RootState) => {
		return {
			course: state.courses,
			subject: state.subjects,
			user: state.users,
		};
	});
	const [testActive, setTestActive] = useState<boolean>(false);

	if (course.status === 'loading') {
		return (
			<>
				<LoadingPage />
			</>
		);
	}
	if (course.status === 'failed') {
		return (
			<>
				<ErrorPage
					error={course.error ? course.error : 'Indefinido'}
				/>
			</>
		);
	}
	return (
		<div className="container">
			<PageTitle
				title={`Examen de ${course.courseSelected?.name}`}
				breadCrumbs={breadCrumbs}
			/>
			<Countdown
				startTime="15:00"
				totalMinutes={120}
				setActive={setTestActive}
			/>
			<br />

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

							<div className="grid grid-cols-2 gap-4">
								{hardQuestion.map((question) => (
									<div key={`Quetion-${question.question_id}`}>
										<Typography
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{question.question_text}
										</Typography>

										{question.question_options.map((answer) => (
											<div
												key={answer.answer_id}
												className="flex flex-row justify-evenly"
											>
												<input
													type="radio"
													name="radio"
													id={`radio-${answer.answer_id}`}
													value={answer.answer_id}
												/>
												<Typography
													variant="small"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{answer.answer_text}
												</Typography>
											</div>
										))}
									</div>
								))}
							</div>
						</CardBody>
					</Card>
				</>
			)}
		</div>
	);
};

export default NewTest;
