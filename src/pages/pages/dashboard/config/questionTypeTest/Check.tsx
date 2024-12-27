import { Checkbox, Typography } from '@material-tailwind/react';
import { question } from '../../../../../types/utilities';
import { useEffect, useState } from 'react';
import QuestionHeader from './components/questionHeader';
// import { axiosPostDefault } from '../../../../services/axios';
type checkData = {
	id: number;
	check: boolean;
};
const TestCheck = ({
	question,
}: {
	question: question;
	type: number;
}) => {
	const [editHeader, setEditHeader] = useState(false);

	const enptyCheck: checkData = {
		id: -1,
		check: false,
	};
	const answerLength = question?.answers
		? question.answers.length
		: 0;

	const correctAnswers: checkData[] | undefined =
		question.answers?.map((answer) => {
			return {
				id: answer.id,
				check: answer.is_correct,
			};
		});
	const loadAnswers: checkData[] = correctAnswers
		? correctAnswers
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
		// const CSTA: courseStudentTestAnswer = {
		// 	course_student_test_id: questionTest.course_student_test_id,
		// 	course_student_test_question_id: questionTest.id,
		// 	course_student_id: questionTest.course_student_id,
		// 	student_id: questionTest.student_id,
		// 	question_id: questionTest.question_id,
		// 	resp: JSON.stringify(resp),
		// 	test_id: questionTest.test_id,
		// 	course_id: questionTest.course_id,
		// };
		// await axiosPostDefault(`api/test/courseStudentTestAnswer`, {
		// 	courseStudentTestAnswer: CSTA,
		// });
		console.log('Se guardaron las respuestas', resp);
	};

	useEffect(() => {
		if (hasChange) {
			saveAnswers(checkboxes);
		}
	}, [checkboxes, hasChange, saveAnswers]);
	return (
		<div>
			<QuestionHeader
				question={question}
				editHeader={editHeader}
				setEditHeader={setEditHeader}
			/>

			{/* <code>{JSON.stringify(checkboxes, null, 4)}</code> */}
			<div className="flex flex-row justify-center">
				{question?.answers?.map((answer, index) => {
					const checked = checkboxes[index].check;
					return (
						<div key={answer.id} className="basis-1/4 justify-center">
							<Checkbox
								color="red"
								id={`check-${answer.id}`}
								value={answer.id}
								defaultChecked={checked}
								name={`check-${question?.id}`}
								onPointerEnterCapture={undefined}
								onChange={(e) =>
									handleCheckboxChange(
										answer.id,
										e.target.checked,
										index
									)
								}
								onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
							/>
							<br />
							<div className="flex flex-row justify-center">
								<Typography
									variant="small"
									className="max-w-40 text-center"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{answer.value}
								</Typography>
							</div>
						</div>
					);
				})}
			</div>
			<hr />
		</div>
	);
};

export default TestCheck;
