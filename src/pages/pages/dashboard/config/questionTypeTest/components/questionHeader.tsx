import { Button, Input, Typography } from '@material-tailwind/react';
import { Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';
import { question } from '../../../../../../types/utilities';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../../../store';
import { updateQuestionTest } from '../../../../../../features/testSlice';

const QuestionHeader = ({
	question,
	editHeader,
	editAnswer,
	setEditHeader,
}: {
	question: question;
	editHeader: boolean;
	editAnswer: boolean;
	setEditHeader: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const [headerState, setHeaderState] = useState(question.header);
	const dispatch = useDispatch<AppDispatch>();
	const updateTestQuestion = async () => {
		const newQuestion = { ...question, header: headerState };
		dispatch(updateQuestionTest(newQuestion));
	};
	return (
		<div className="flex flex-row justify-start gap-3 pt-3">
			{editHeader ? (
				<>
					<Input
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						value={headerState}
						required
						onChange={(e) => {
							setHeaderState(e.target.value);
						}}
						type="text"
						label="Encabezado"
						placeholder="Encabezado"
						className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
						crossOrigin={undefined}
					/>
				</>
			) : (
				<div className="flex flex-row gap-4">
					<Typography
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						variant="h5"
						className="text-left"
					>
						Encabezado:
					</Typography>

					<Typography
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						variant="h6"
						className="text-left"
					>
						{question.header}
					</Typography>
				</div>
			)}

			<div className="flex flex-row justify-center gap-4">
				<div>
					<Button
						size="sm"
						title={editHeader ? 'Cancelar' : 'Cambiar Encabezado'}
						variant={editHeader ? 'outlined' : 'filled'}
						placeholder={undefined}
						disabled={editAnswer}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={() => {
							setEditHeader(!editHeader);
						}}
					>
						{editHeader ? <X size={15} /> : <Pencil size={10} />}
					</Button>
				</div>
				{editHeader && (
					<Button
						title="Guardar"
						size="sm"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={async () => {
							await updateTestQuestion();
							setEditHeader(false);
						}}
					>
						<Save size={15} />
					</Button>
				)}
			</div>
		</div>
	);
};

export default QuestionHeader;
