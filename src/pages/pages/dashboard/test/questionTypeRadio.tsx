import { Radio, Typography } from '@material-tailwind/react';
import {
	courseStudentTestAnswer,
	courseStudentTestQuestion,
} from '../../../../types/utilities';
import { axiosPostDefault } from '../../../../services/axios';
// import { useRef } from 'react';

const QuestionTypeRadio = ({
	questionTest,
	countKey,
	type,
}: {
	questionTest: courseStudentTestQuestion;
	countKey: number;
	type: number;
}) => {
	// const typeTripRef = useRef<number>(0);
	const handleChangeRadio = async (answer_id: number) => {
		const CSTA: courseStudentTestAnswer = {
			course_student_test_id: questionTest.course_student_test_id,
			course_student_test_question_id: questionTest.id,
			course_student_id: questionTest.course_student_id,
			student_id: questionTest.student_id,
			question_id: questionTest.question_id,
			resp: `${answer_id}`,
			test_id: questionTest.test_id,
			course_id: questionTest.course_id,
		};

		await axiosPostDefault(`api/test/courseStudentTestAnswer`, {
			courseStudentTestAnswer: CSTA,
		});
		console.log('Se guardaron las respuestas ');
	};
	return (
		<div
			className={`${
				questionTest.Answered
					? 'bg-light-green-200'
					: 'bg-blue-gray-100'
			}`}
		>
			{' '}
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				variant="h5"
			>
				Pregunta de {type === 1 && <>Seleccion Simple</>}
				{type === 3 && <>Verdadero o falso</>} Nº{countKey + 1}
			</Typography>
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				variant="h6"
			>
				{questionTest.question?.header}
			</Typography>
			{questionTest.question?.answers?.map((answer) => (
				<div key={answer.id} className="flex flex-row justify-start">
					<Radio
						name={`radio-${questionTest.question?.id}`}
						id={`radio-${answer.id}`}
						label={answer.value}
						defaultChecked={
							parseInt(
								questionTest.course_student_test_answer?.resp
									? questionTest.course_student_test_answer.resp
									: '-1'
							) === answer.id
						}
						color="red"
						onChange={() => {
							handleChangeRadio(answer.id);
						}}
						value={answer.id}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						crossOrigin={undefined}
					/>
				</div>
			))}
		</div>
	);
};

export default QuestionTypeRadio;
