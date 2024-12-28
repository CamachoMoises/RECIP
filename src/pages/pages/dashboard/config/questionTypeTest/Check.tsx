import { Checkbox } from '@material-tailwind/react';
import { answer, question } from '../../../../../types/utilities';
import { useEffect, useState } from 'react';
import QuestionHeader from './components/questionHeader';
import AnswerValue from './components/answerValue';
import { axiosPutDefault } from '../../../../../services/axios';
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
	const [editAnswer, setEditAnswer] = useState(false);

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
		if (question.answers) {
			for (let index = 0; index < question.answers.length; index++) {
				const oldAnswer = question.answers[index];
				const newAnswer = resp[index];
				if (oldAnswer.is_correct != newAnswer.check) {
					const newAnswerData: answer = {
						...oldAnswer,
						is_correct: newAnswer.check,
					};

					await axiosPutDefault(
						`api/test/answerQuestionTest/${question.id}`,
						newAnswerData
					);
				}
			}
		}
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
				editAnswer={editAnswer}
				setEditHeader={setEditHeader}
			/>

			<div className="flex flex-row justify-center gap-3">
				{question?.answers?.map((answer, index) => {
					const checked = checkboxes[index].check;
					return (
						<div key={answer.id} className="basis-1/4 justify-center">
							<Checkbox
								color="red"
								id={`check-${answer.id}`}
								value={answer.id}
								disabled={editHeader || editAnswer}
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
								<AnswerValue
									answer={answer}
									questionId={question.id}
									editHeader={editHeader}
									editAnswer={editAnswer}
									setEditAnswer={setEditAnswer}
								/>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default TestCheck;
