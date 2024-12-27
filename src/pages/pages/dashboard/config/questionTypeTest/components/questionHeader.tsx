import { Button, Input, Typography } from '@material-tailwind/react';
import { Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';
import { question } from '../../../../../../types/utilities';
// import { useDispatch } from 'react-redux';
// import { AppDispatch } from '../../../../../../store';

const QuestionHeader = ({
	question,
	editHeader,
	setEditHeader,
}: {
	question: question;
	editHeader: boolean;
	setEditHeader: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const [headerState, setHeaderState] = useState(question.header);
	// const dispatch = useDispatch<AppDispatch>();
	const updateTestQuestion = async () => {
		const newQuestion = { ...question, header: headerState };
		console.log(newQuestion);

		// dispatch()
	};
	return (
		<div className="flex flex-col justify-center gap-3 pt-3">
			{editHeader ? (
				<>
					<Input
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						value={headerState}
						onChange={(e) => {
							setHeaderState(e.target.value);
						}}
						type="text"
						label="Encabezado"
						placeholder="Encabezado"
						maxLength={2}
						className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
						crossOrigin={undefined}
					/>
				</>
			) : (
				<Typography
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					variant="h6"
				>
					{question.header}
				</Typography>
			)}

			<div className="flex flex-row justify-center gap-4">
				<Button
					size="sm"
					title={editHeader ? 'Cancelar' : 'Cambiar Encabezado'}
					variant={editHeader ? 'outlined' : 'filled'}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					onClick={() => {
						setEditHeader(!editHeader);
					}}
				>
					{editHeader ? <X size={15} /> : <Pencil size={10} />}
				</Button>
				{editHeader && (
					<Button
						title="Guardar"
						size="sm"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={() => {
							updateTestQuestion();
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
