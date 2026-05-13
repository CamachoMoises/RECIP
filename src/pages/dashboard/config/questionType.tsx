import {
	Button,
	Card,
	CardBody,
	Input,
	Typography,
} from '@material-tailwind/react';
import { questionType } from '../../../../types/utilities';
import { Pencil, Save, X } from 'lucide-react';
import { useState } from 'react';

const QuestionType = ({
	QT,
	updateQuestionTypeFunc,
}: {
	QT: questionType;
	updateQuestionTypeFunc: (
		questionTypeId: number,
		value: number
	) => Promise<void>;
}) => {
	const [value, setValue] = useState(QT.value);
	const [edit, setEdit] = useState(false);
	return (
		<>
			<Card
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<CardBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="flex flex-col justify-center"
				>
					<div className="flex flex-col">
						<Typography
							variant="h6"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{QT.name}
						</Typography>
						{edit ? (
							<>
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									value={value}
									onChange={(e) => {
										setValue(parseFloat(e.target.value));
									}}
									type="number"
									label="Valor"
									placeholder="Valor"
									maxLength={2}
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
								/>
							</>
						) : (
							<>
								<Typography
									variant="small"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									valor:{QT.value} Pto
									{QT.value > 0 && QT.value != 1 ? 's' : ''}
								</Typography>
							</>
						)}
						<br />
						<div className="w-full flex flex-row  gap-5 justify-center">
							<Button
								title="Editar el Curso"
								variant={edit ? 'outlined' : 'filled'}
								size="sm"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								onClick={() => {
									setEdit(!edit);
								}}
							>
								{edit ? <X size={20} /> : <Pencil size={20} />}
							</Button>
							{edit && (
								<>
									<Button
										title="Guardar"
										size="sm"
										disabled={!(value > 0)}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										onClick={() => {
											updateQuestionTypeFunc(QT.id, value);
											setEdit(false);
										}}
									>
										<Save size={20} />
									</Button>
								</>
							)}
						</div>
					</div>
				</CardBody>
			</Card>
		</>
	);
};

export default QuestionType;
