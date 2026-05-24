import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
	Textarea,
} from '@material-tailwind/react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { createSuggestion } from '../../../features/userSlice';
import toast from 'react-hot-toast';

interface Props {
	open: boolean;
	handler: () => void;
}

const SuggestionDialog = ({ open, handler }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((state: RootState) => state.auth.user);
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');

	const handleSubmit = async () => {
		if (!title.trim() || !description.trim() || !user?.id) return;
		await dispatch(
			createSuggestion({ user_id: user.id, title, description }),
		);
		setTitle('');
		setDescription('');
		toast.success('Sugerencia enviada con éxito');
		handler();
	};

	return (
		<Dialog
			open={open}
			handler={handler}
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<DialogHeader
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Nueva Sugerencia
			</DialogHeader>
			<DialogBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<div className="flex flex-col gap-4">
					<Input
						label="Título"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Ej: Mejorar interfaz de evaluaciones"
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						crossOrigin={undefined}
					/>
					<Textarea
						label="Descripción"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe tu sugerencia en detalle..."
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					/>
				</div>
			</DialogBody>
			<DialogFooter
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Button
					variant="text"
					color="red"
					onClick={handler}
					className="mr-2"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Cancelar
				</Button>
				<Button
					variant="gradient"
					color="blue"
					onClick={handleSubmit}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Enviar Sugerencia
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default SuggestionDialog;
