import { Radio, Typography } from '@material-tailwind/react';
import { question } from '../../../../../types/utilities';
import QuestionHeader from './components/questionHeader';
import { useState } from 'react';
// import { axiosPostDefault } from '../../../../services/axios';

const TestRadio = ({
	question,
}: {
	question: question;
	type: number;
}) => {
	const [editHeader, setEditHeader] = useState(false);
	const handleChangeRadio = async (answer_id: number) => {
		console.log(answer_id);

		// const CSTA: courseStudentTestAnswer = {
		// 	course_student_test_id: questionTest.course_student_test_id,
		// 	course_student_test_question_id: questionTest.id,
		// 	course_student_id: questionTest.course_student_id,
		// 	student_id: questionTest.student_id,
		// 	question_id: questionTest.question_id,
		// 	resp: `${answer_id}`,
		// 	test_id: questionTest.test_id,
		// 	course_id: questionTest.course_id,
		// };

		// await axiosPostDefault(`api/test/courseStudentTestAnswer`, {
		// 	courseStudentTestAnswer: CSTA,
		// });
		console.log('Se guardaron las respuestas');
	};
	return (
		<div>
			<QuestionHeader
				question={question}
				editHeader={editHeader}
				setEditHeader={setEditHeader}
			/>
			<div className="flex flex-row justify-center">
				{question?.answers?.map((answer) => (
					<div key={answer.id} className="basis-1/4 justify-center">
						<Radio
							disabled={editHeader}
							name={`radio-${question?.id}`}
							id={`radio-${answer.id}`}
							defaultChecked={answer.is_correct}
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

export default TestRadio;
