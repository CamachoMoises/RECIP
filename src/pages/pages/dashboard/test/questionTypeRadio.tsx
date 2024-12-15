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
				questionTest.Answered ? 'bg-light-green-200' : ''
			}`}
		>
			{' '}
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				variant="h5"
			>
				Pregunta Nº{countKey + 1}{' '}
			</Typography>
			<Typography
				variant="small"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				{type === 1 && <>Seleccion Simple</>}
				{type === 3 && <>Verdadero o Falso</>}
			</Typography>
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				variant="h6"
			>
				{questionTest.question?.header}
			</Typography>
			<div className="flex flex-row justify-center">
				{questionTest.question?.answers?.map((answer) => (
					<div key={answer.id} className="basis-1/4 justify-center">
						<Radio
							name={`radio-${questionTest.question?.id}`}
							id={`radio-${answer.id}`}
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
						<br />
						<div className="flex flex-row justify-center">
							<Typography
								variant="small"
								className="max-w-48 text-center"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{answer.value}
							</Typography>
						</div>
					</div>
				))}
			</div>
			<hr />
		</div>
	);
};

export default QuestionTypeRadio;
