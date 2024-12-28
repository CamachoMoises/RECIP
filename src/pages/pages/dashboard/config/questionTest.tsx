import { Button, Input, Typography } from '@material-tailwind/react';
import { List, Pencil, Save, X } from 'lucide-react';
import {
	questionType,
	testQuestionType,
} from '../../../../types/utilities';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QuestionTest = ({
	QT,
	TQT,
	updateTestQuestion,
}: {
	QT: questionType;
	TQT: testQuestionType;
	updateTestQuestion: (
		testQuestion: testQuestionType,
		amount: number
	) => Promise<void>;
}) => {
	const navigate = useNavigate();
	const [edit, setEdit] = useState(false);
	const [amount, setAmount] = useState(TQT.amount);

	return (
		<>
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				{QT.name}: <br />
				{edit ? (
					<>
						<Input
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							value={amount}
							onChange={(e) => {
								setAmount(parseFloat(e.target.value));
							}}
							type="number"
							label="Cantidad"
							placeholder="Cantidad"
							maxLength={2}
							className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
							crossOrigin={undefined}
						/>
					</>
				) : (
					<>
						{TQT ? (
							<>
								<span>
									{TQT.amount} Pregunta{TQT.amount != 1 ? 's' : ''}
								</span>
							</>
						) : (
							'Sin datos'
						)}
					</>
				)}
			</Typography>
			<div className="flex flex-row gap-5 justify-end">
				<Button
					size="sm"
					title={edit ? 'Cancelar' : 'Cambiar cantidad preguntas'}
					variant={edit ? 'outlined' : 'filled'}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					onClick={() => {
						setEdit(!edit);
					}}
				>
					{edit ? <X size={12} /> : <Pencil size={12} />}
				</Button>
				{edit ? (
					<>
						<Button
							title="Guardar"
							size="sm"
							disabled={!(amount >= 0)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							onClick={() => {
								updateTestQuestion(TQT, amount);
								setEdit(false);
							}}
						>
							<Save size={20} />
						</Button>
					</>
				) : (
					<>
						<Button
							title={`Lista de preguntas de ${QT.name}`}
							size="sm"
							disabled={!(amount > 0)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							onClick={() => {
								navigate(
									`../config/testQuestion/${TQT.test_id}/${QT.id}`
								);
							}}
						>
							<List size={20} />
						</Button>
					</>
				)}
			</div>
		</>
	);
};

export default QuestionTest;