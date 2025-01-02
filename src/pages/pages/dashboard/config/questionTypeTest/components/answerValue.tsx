import { Button, Input, Typography } from '@material-tailwind/react';
import { answer } from '../../../../../../types/utilities';
import { Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import { updateAnswerQuestionTest } from '../../../../../../features/testSlice';
const AnswerValue = ({
	answer,
	questionId,
	editHeader,
	editAnswer,
	setEditAnswer,
}: {
	answer: answer;
	questionId: number;
	editAnswer: boolean;
	editHeader: boolean;
	setEditAnswer: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const [editAnswerLocal, setEditAnswerLocal] = useState(false);
	const [answerState, setAnswerState] = useState(answer.value);
	const updateAnswerQuestion = async () => {
		const newAnswer: answer = { ...answer, value: answerState };
		dispatch(
			updateAnswerQuestionTest({
				answerData: newAnswer,
				question_id: questionId,
			})
		);
	};
	return (
		<div className="flex flex-col gap-3">
			{editAnswerLocal ? (
				<div className="flex flex-col justify-center align-middle">
					<Input
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						value={answerState}
						required
						maxLength={500}
						onChange={(e) => {
							setAnswerState(e.target.value);
						}}
						type="text"
						label="Respuesta"
						placeholder="Respuesta"
						className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
						crossOrigin={undefined}
					/>
				</div>
			) : (
				<div className="flex flex-row gap-4">
					<Typography
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						variant="small"
						className="text-left"
					>
						{answer.value}
					</Typography>
				</div>
			)}
			<div className="flex flex-row justify-center gap-1 ps-4">
				<div>
					<Button
						size="sm"
						title={
							editAnswer && editAnswerLocal
								? 'Cancelar'
								: 'Cambiar Respuesta'
						}
						disabled={editAnswer != editAnswerLocal || editHeader}
						variant={
							editAnswer && editAnswerLocal ? 'outlined' : 'filled'
						}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={() => {
							setEditAnswer(!editAnswer);
							setEditAnswerLocal(!editAnswerLocal);
						}}
					>
						{editAnswer && editAnswerLocal ? (
							<X size={15} />
						) : (
							<Pencil size={10} />
						)}
					</Button>
				</div>
				{editAnswerLocal && (
					<div>
						<Button
							title="Guardar"
							size="sm"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							onClick={async () => {
								await updateAnswerQuestion();
								setEditAnswer(false);
								setEditAnswerLocal(false);
							}}
						>
							<Save size={15} />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default AnswerValue;
