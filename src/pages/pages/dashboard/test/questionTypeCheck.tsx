import { Checkbox, Typography } from '@material-tailwind/react';
import {
	courseStudentTestAnswer,
	courseStudentTestQuestion,
} from '../../../../types/utilities';
import { useEffect, useState } from 'react';
import { axiosPostDefault } from '../../../../services/axios';
type checkData = {
	id: number;
	check: boolean;
};
const QuestionTypeCheck = ({
	questionTest,
	countKey,
}: {
	questionTest: courseStudentTestQuestion;
	countKey: number;
	type: number;
}) => {
	const enptyCheck: checkData = {
		id: -1,
		check: false,
	};
	const answerLength = questionTest.question?.answers
		? questionTest.question.answers.length
		: 0;
	const loadAnswers: checkData[] = questionTest
		.course_student_test_answer?.resp
		? JSON.parse(questionTest.course_student_test_answer.resp)
		: Array(answerLength).fill(enptyCheck);

	const [checkboxes, setCheckboxes] =
		useState<checkData[]>(loadAnswers);
	const [hasChange, setHasChange] = useState(false);

	const handleCheckboxChange = (
		answer_id: number,
		check: boolean,
		index: number
	) => {
		const newCheckboxes = [...checkboxes];
		newCheckboxes[index] = {
			id: answer_id,
			check: check,
		};
		setCheckboxes(newCheckboxes);
		setHasChange(true);
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const saveAnswers = async (resp: checkData[]) => {
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
		console.log('Se guardaron las respuestas');
	};

	useEffect(() => {
		if (hasChange) {
			saveAnswers(checkboxes);
		}
	}, [checkboxes, hasChange, saveAnswers]);
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
				Seleccion Multiple {countKey + 1}
			</Typography>
			{/* <code>{JSON.stringify(checkboxes, null, 4)}</code> */}
			{questionTest.question?.answers?.map((answer, index) => (
				<div key={answer.id} className="flex flex-row justify-start">
					<Checkbox
						color="red"
						id={`check-${answer.id}`}
						value={answer.id}
						defaultChecked={checkboxes[index].check}
						label={answer.value}
						name={`check-${questionTest.question?.id}`}
						onPointerEnterCapture={undefined}
						onChange={(e) =>
							handleCheckboxChange(answer.id, e.target.checked, index)
						}
						onPointerLeaveCapture={undefined}
						crossOrigin={undefined}
					/>
				</div>
			))}
		</div>
	);
};

export default QuestionTypeCheck;
