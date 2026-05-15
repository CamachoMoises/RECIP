import { Radio, Typography } from '@material-tailwind/react';
import {
	courseStudentTestAnswer,
	courseStudentTestQuestion,
} from '../../../types/utilities';
import { axiosPostDefault } from '../../../services/axios';
import toast from 'react-hot-toast';
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
		toast.success('Respuesta guardada', { id: 'save' });
	};
return (
		<div
			className={`${
				questionTest.Answered ? 'bg-light-green-200' : ''
			}`}
		>
			<Typography
				className="text-sm sm:text-base"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				variant="h6"
			>
				Pregunta Nº{countKey + 1}{' '}
			</Typography>
			<Typography
				variant="small"
				className="text-xs sm:text-sm"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				{type === 1 && <>Selección Simple</>}
				{type === 3 && <>Verdadero o Falso</>}
			</Typography>
			<Typography
				className="text-sm sm:text-base mt-2"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				variant="h6"
			>
				{questionTest.question?.header}
			</Typography>
			<div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-4">
				{questionTest.question?.answers?.map((answer) => (
					<div key={answer.id} className="flex flex-col items-center min-w-[80px] sm:basis-1/4">
						<Radio
							name={`radio-${questionTest.question?.id}`}
							id={`radio-${answer.id}`}
							defaultChecked={
								parseInt(
									questionTest.course_student_test_answer?.resp
										? questionTest.course_student_test_answer.resp
										: '-1',
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
						<Typography
							variant="small"
							className="text-center text-xs sm:text-sm max-w-32 sm:max-w-48"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{answer.value}
						</Typography>
					</div>
				))}
			</div>
			<hr className="mt-4" />
		</div>
	);
};

export default QuestionTypeRadio;
