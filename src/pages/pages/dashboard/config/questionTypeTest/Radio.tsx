import { Radio } from '@material-tailwind/react';
import { answer, question } from '../../../../../types/utilities';
import QuestionHeader from './components/questionHeader';
import { useState } from 'react';
import AnswerValue from './components/answerValue';
import { AppDispatch } from '../../../../../store';
import { useDispatch } from 'react-redux';
import { updateAnswerQuestionTest } from '../../../../../features/testSlice';
// import { axiosPostDefault } from '../../../../services/axios';

const TestRadio = ({
	question,
}: {
	question: question;
	type: number;
}) => {
	const [editHeader, setEditHeader] = useState(false);
	const [editAnswer, setEditAnswer] = useState(false);
	const dispatch = useDispatch<AppDispatch>();

	const correctAnswer: answer | undefined = question.answers?.find(
		(answer) => answer.is_correct
	);

	const handleChangeRadio = async (newAnswer: answer) => {
		if (correctAnswer) {
			const removePrevAnswer: answer = {
				...correctAnswer,
				is_correct: false,
			};
			await dispatch(
				updateAnswerQuestionTest({
					answerData: removePrevAnswer,
					question_id: question.id,
				})
			);
		}
		const newAnswerData: answer = { ...newAnswer, is_correct: true };
		await dispatch(
			updateAnswerQuestionTest({
				answerData: newAnswerData,
				question_id: question.id,
			})
		);

		console.log('Se guardaron las respuestas');
	};
	return (
		<div>
			<QuestionHeader
				question={question}
				editHeader={editHeader}
				editAnswer={editAnswer}
				setEditHeader={setEditHeader}
			/>
			{/* <code>{JSON.stringify(correctAnswer, null, 4)}</code> */}
			<div className="flex flex-row justify-center gap-3">
				{question?.answers?.map((answer) => (
					<div key={answer.id} className="basis-1/4 justify-center">
						<Radio
							disabled={editHeader || editAnswer}
							name={`radio-${question?.id}`}
							id={`radio-${answer.id}`}
							defaultChecked={answer.is_correct}
							color="red"
							onChange={() => {
								handleChangeRadio(answer);
							}}
							value={answer.id}
							onPointerEnterCapture={undefined}
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
				))}
			</div>{' '}
		</div>
	);
};

export default TestRadio;
