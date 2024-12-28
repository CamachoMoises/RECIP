import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
} from '@material-tailwind/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store';
import { createTest } from '../../../../features/testSlice';
type Inputs = {
	duration: number;
	min_score: number;
};
const NewTestModal = ({
	open,
	setOpen,
	courseId,
}: {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	courseId: number | null;
}) => {
	const dispatch = useDispatch<AppDispatch>();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>();
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		if (courseId) {
			const dataTest = { ...data, course_id: courseId };
			await dispatch(createTest(dataTest));
			setOpen(false);
		}
	};
	return (
		<Dialog
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			open={open}
			handler={setOpen}
			size="sm"
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Nuevo Examen
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="grid grid-cols-2 gap-4">
						<div className="">
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="number"
								label="Duracion de la prueba"
								placeholder="Minutos"
								maxLength={3}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('duration', {
									required: {
										value: true,
										message: 'La duracion es requerida',
									},
								})}
								aria-invalid={errors.duration ? 'true' : 'false'}
							/>
							{errors.duration && (
								<span className="text-red-500 text-sm/[8px] py-2">
									{errors.duration.message}
								</span>
							)}
						</div>
						<div className="">
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="number"
								label="Nota minima aprobatoria"
								placeholder="Puntos"
								maxLength={3}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('min_score', {
									required: {
										value: true,
										message: 'La calificacion es requerida',
									},
								})}
								aria-invalid={errors.min_score ? 'true' : 'false'}
							/>
							{errors.min_score && (
								<span className="text-red-500 text-sm/[8px] py-2">
									{errors.min_score.message}
								</span>
							)}
						</div>
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
						onClick={() => {
							setOpen(false);
						}}
						className="mr-1"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<span>Cancelar</span>
					</Button>
					<Button
						variant="gradient"
						color="green"
						type="submit"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<span>Crear</span>
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
};

export default NewTestModal;
