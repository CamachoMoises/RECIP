import { Button, Input } from '@material-tailwind/react';
import { answer, question } from '../../../../../types/utilities';
// import { axiosPostDefault } from '../../../../services/axios';
import { useState } from 'react';
import QuestionHeader from './components/questionHeader';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../store';
import { updateAnswerQuestionTest } from '../../../../../features/testSlice';
import { Plus, Save } from 'lucide-react';
import NewAnswerQuestionTest from '../newAnswerQuestionTest';

const TestInput = ({
	question,
}: {
	question: question;
	type: number;
}) => {
	const [editHeader, setEditHeader] = useState(false);
	const [open, setOpen] = useState(false);
	const dispatch = useDispatch<AppDispatch>();
	const answerLength = question?.answers
		? question.answers.length
		: 0;
	const loadAnswers: string[] = question.answers
		? question.answers.map((answer) => {
				return answer.value;
		  })
		: Array(answerLength).fill('');
	const [answers, setAnswers] = useState<string[]>(loadAnswers);
	const [hasChange, setHasChange] = useState(false);
	const handleChange = (index: number, value: string) => {
		const newInputs = [...answers];
		newInputs[index] = value;
		setAnswers(newInputs);
		setHasChange(true);
	};
	const answersData = question.answers ? question.answers : [];
	const questionTypeData = question.question_type?.max_answer
		? question.question_type.max_answer
		: 0;
	const add = answersData.length < questionTypeData;
	const saveAnswers = async (resp: string[]) => {
		if (question.answers) {
			for (let index = 0; index < question.answers.length; index++) {
				const oldAnswer = question.answers[index];
				const newAnswer = resp[index];
				if (oldAnswer.value != newAnswer) {
					const newAnswerData: answer = {
						...oldAnswer,
						value: newAnswer,
					};
					await dispatch(
						updateAnswerQuestionTest({
							answerData: newAnswerData,
							question_id: question.id,
						})
					);
				}
			}
		}

		console.log('Se guardaron las respuestas');
	};
	const handleSaveAnswer = async () => {
		if (hasChange) {
			const nonNullValues = answers.filter(
				(value) => value !== null && value !== ''
			);

			if (nonNullValues.length > 0) {
				saveAnswers(answers);
				setHasChange(false);
			}
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<QuestionHeader
				question={question}
				editHeader={editHeader}
				editAnswer={false}
				setEditHeader={setEditHeader}
			/>

			{/* <code>{JSON.stringify(answers, null, 4)}</code> */}
			{question?.answers?.map((answer, index) => (
				<div
					key={answer.id}
					className="flex flex-row justify-start p-2"
				>
					<Input
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

			<div className="flex flex-row justify-center gap-2">
				<div>
					<Button
						title="Guardar"
						size="lg"
						disabled={!hasChange}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={async () => handleSaveAnswer()}
					>
						<Save size={15} />
					</Button>
				</div>
				<div>
					{add && (
						<div className="flex flex-col justify-center align-middle">
							<Button
								size="lg"
								title="Agregar respuesta"
								variant="filled"
								disabled={editHeader}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								placeholder={undefined}
								onClick={() => {
									setOpen(!open);
								}}
							>
								<Plus size={15} className="mx-auto text-lg" />
							</Button>
						</div>
					)}
				</div>
			</div>
			{open && (
				<NewAnswerQuestionTest
					open={open}
					courseId={question.course_id}
					testId={question.test_id}
					questionTypeId={question.question_type_id}
					questionId={question.id}
					setOpen={setOpen}
				/>
			)}
		</div>
	);
};

export default TestInput;
