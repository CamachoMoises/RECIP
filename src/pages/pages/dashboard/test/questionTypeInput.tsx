import { Input, Typography } from '@material-tailwind/react';
import {
	courseStudentTestAnswer,
	courseStudentTestQuestion,
} from '../../../../types/utilities';
import { axiosPostDefault } from '../../../../services/axios';
import { useEffect, useState } from 'react';

const QuestionTypeInput = ({
	questionTest,
	countKey,
}: {
	questionTest: courseStudentTestQuestion;
	countKey: number;
	type: number;
}) => {
	const answerLength = questionTest.question?.answers
		? questionTest.question.answers.length
		: 0;
	const loadAnswers: string[] = questionTest
		.course_student_test_answer?.resp
		? JSON.parse(questionTest.course_student_test_answer.resp)
		: Array(answerLength).fill('');
	const [answers, setAnswers] = useState<string[]>(loadAnswers);
	const [hasChange, setHasChange] = useState(false);
	const handleChange = (index: number, value: string) => {
		const newInputs = [...answers];
		newInputs[index] = value;
		setAnswers(newInputs);
		setHasChange(true);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const saveAnswers = async (resp: string[]) => {
		const CSTA: courseStudentTestAnswer = {
			course_student_test_id: questionTest.course_student_test_id,
			course_student_test_question_id: questionTest.id,
			course_student_id: questionTest.course_student_id,
			student_id: questionTest.student_id,
			question_id: questionTest.question_id,
			resp: JSON.stringify(resp),
			test_id: questionTest.test_id,
			course_id: questionTest.course_id,
		};
		await axiosPostDefault(`api/test/courseStudentTestAnswer`, {
			courseStudentTestAnswer: CSTA,
		});
		console.log('Se guardaron las respuestas ');
	};
	useEffect(() => {
		const interval = setInterval(() => {
			if (hasChange) {
				const nonNullValues = answers.filter(
					(value) => value !== null && value !== ''
				);

				if (nonNullValues.length > 0) {
					saveAnswers(answers);
					setHasChange(false);
				}
			}
		}, 5000);

		return () => clearInterval(interval); // Limpia el intervalo al desmontar el componente
	}, [answers, hasChange, saveAnswers]);
	return (
		<div
			className={`${
				questionTest.Answered
					? 'bg-light-green-200'
					: 'bg-blue-gray-100'
			}`}
		>
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				variant="lead"
			>
				{questionTest.question?.header}
			</Typography>
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Pregunta de desarrollo {countKey + 1}
			</Typography>
			{/* <code>{JSON.stringify(answers, null, 4)}</code> */}
			{questionTest.question?.answers?.map((answer, index) => (
				<div
					key={answer.id}
					className="flex flex-row justify-start p-5"
				>
					<Input
						variant="static"
						label={`${index + 1}`}
						onChange={(e) => handleChange(index, e.target.value)}
						placeholder={`Respuesta`}
						onPointerEnterCapture={undefined}
						value={answers[index] === undefined ? '' : answers[index]}
						onPointerLeaveCapture={undefined}
						crossOrigin={undefined}
					/>
				</div>
			))}
		</div>
	);
};

export default QuestionTypeInput;
