import { useState } from 'react';
import {
	answer,
	courseStudentTestQuestion,
} from '../../../types/utilities';
import {
	Button,
	Input,
	ListItem,
} from '@material-tailwind/react';
import { Save, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { updateCourseStudentTestScore } from '../../../features/testSlice';

const ReviewItemList = ({
	question,
	index,
	editing,
	setEditing,
}: {
	question: courseStudentTestQuestion;
	index: number;
	editing: boolean;
	setEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const dispatch = useDispatch<AppDispatch>();

	let respData: string[] = ['Sin respuesta'];
	let answered = false;
	let findAnswerMulti: answer | undefined;
	let multiResp: number = 0;
	let findAnswer = null;
	const correctAnswers = question.question?.answers?.filter(
		(QA) => QA.is_correct,
	);
	const type = question.question?.question_type_id;

	switch (type) {
		case 1:
			findAnswer = question.question?.answers?.find(
				(ans) =>
					ans.id ===
					parseInt(
						question.course_student_test_answer?.resp
							? question.course_student_test_answer.resp
							: '-1',
					),
			);
			if (findAnswer) {
				respData.shift();
				respData.push(findAnswer.value);
				answered = true;
			}

			break;
		case 2:
			findAnswer = JSON.parse(
				question.course_student_test_answer?.resp
					? question.course_student_test_answer.resp
					: '[]',
			);
			for (const answer of findAnswer) {
				if (answer.check) {
					findAnswerMulti = question.question?.answers?.find(
						(ans) => ans.id === answer.id,
					);
					if (findAnswerMulti) {
						multiResp++;
					}
					respData.push(
						findAnswerMulti?.value ? findAnswerMulti.value : '',
					);
				}
			}
			if (multiResp > 0) {
				respData.shift();
				answered = true;
			}
			break;
		case 3:
			findAnswer = question.question?.answers?.find(
				(ans) =>
					ans.id ===
					parseInt(
						question.course_student_test_answer?.resp
							? question.course_student_test_answer.resp
							: '-1',
					),
			);
			if (findAnswer) {
				respData.shift();
				respData.push(findAnswer.value);
				answered = true;
			}

			break;
		case 4:
			findAnswer = JSON.parse(
				question.course_student_test_answer?.resp
					? question.course_student_test_answer.resp
					: '[]',
			);

			if (findAnswer.length > 0) {
				respData = findAnswer;
				answered = true;
			}

			break;

		case 5:
			findAnswer = JSON.parse(
				question.course_student_test_answer?.resp
					? question.course_student_test_answer.resp
					: '[]',
			);

			if (findAnswer.length > 0) {
				respData = findAnswer;
				answered = true;
			}

			break;

		default:
			break;
	}
	const [localEditing, setLocalEditing] = useState(false);
	const [score, setScore] = useState(
		question.course_student_test_answer?.score
			? `${question.course_student_test_answer.score}`
			: '0',
	);
	const initialScore = question.course_student_test_answer?.score
		? `${question.course_student_test_answer.score}`
		: '0';
	const [errorInput, setErrorInput] = useState(
		parseFloat(score) >= 0 ? false : true,
	);
	const maxScore = question.question?.question_type?.value
		? question.question.question_type.value
		: 0;
	const handleChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setEditing(true);
		setLocalEditing(true);
		const newValue = event.target.value;
		if (/^0$|^[1-9]\d*(\.\d{1,2})?$|^0\.\d{1,2}$/.test(newValue)) {
			setErrorInput(
				parseFloat(newValue) >= 0 && parseFloat(newValue) <= maxScore
					? false
					: true,
			);
		} else {
			setErrorInput(true);
		}

		setScore(newValue);
	};
	const handleSave = async () => {
		const resp = await dispatch(
			updateCourseStudentTestScore({
				course_student_test_id: question.course_student_test_id,
				course_student_test_answer_id: question
					.course_student_test_answer?.id
					? question.course_student_test_answer.id
					: -1,
				score: parseFloat(score),
			}),
		).unwrap();
		if (resp) {
			setEditing(false);
			setLocalEditing(false);
		}
	};
	return (
<ListItem
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			disabled={editing && !localEditing}
			className="flex flex-col items-start gap-2 py-3"
		>
			<div className="w-full flex flex-col sm:flex-row gap-2 sm:gap-4">
				<div className="flex-1 w-full">
					<div className="flex flex-col gap-2">
						<div className="text-xs sm:text-sm font-semibold">
							Pregunta #{index + 1} ({question.question?.question_type?.name})
						</div>
						<div className="text-xs sm:text-sm text-gray-700">
							{question.question?.header}
						</div>
						<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
							<div className="flex flex-col gap-1 text-xs sm:text-sm">
								<span className="font-semibold text-green-700">Correcta:</span>
								{correctAnswers?.map((CA, idx) => (
									<div key={`CA${question.id}-${CA.id}`} className="text-xs">
										<strong>({idx + 1}):</strong> {CA.value}
									</div>
								))}
							</div>
							<div className="flex flex-col gap-1 text-xs sm:text-sm text-red-900">
								<span className="font-semibold">Respuesta:</span>
								{respData.map((RD, idx) => (
									<div key={`Res${question.id}-${idx}`} className="text-xs">
										<strong>({idx + 1}):</strong> {RD}
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
				<div className="flex flex-col gap-2 w-full sm:w-auto min-w-[150px]">
					<div
						className={`text-xs sm:text-sm font-semibold ${
							parseFloat(score) < maxScore
								? parseFloat(score) === 0
									? 'text-red-700'
									: 'text-deep-orange-500'
								: 'text-green-500'
						}`}
					>
						Puntaje: {score}/{maxScore}
					</div>
					<div className="flex flex-row sm:flex-col gap-2">
						<Input
							label="Puntaje"
							error={errorInput}
							value={score}
							onChange={handleChange}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
							className="w-20 sm:w-full"
						/>
						<div className="flex gap-1">
							{localEditing && (
								<Button
									title="Cancelar"
									size="sm"
									variant="outlined"
									color="red"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									onClick={() => {
										setScore(initialScore);
										setLocalEditing(false);
										setEditing(false);
									}}
								>
									<X size={15} />
								</Button>
							)}
							<Button
								title="Guardar"
								size="sm"
								color="green"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								disabled={errorInput || !localEditing || !answered}
								onClick={() => {
									handleSave();
								}}
							>
								<Save size={15} />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</ListItem>
	);
};

export default ReviewItemList;
