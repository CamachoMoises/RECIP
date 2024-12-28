import { AppDispatch } from '../../../../store';
import { useDispatch } from 'react-redux';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
} from '@material-tailwind/react';
import { createQuestionTest } from '../../../../features/testSlice';
type Inputs = {
	header: string;
};
const NewQuestionTest = ({
	open,
	testId,
	courseId,
	questionTypeId,
	setOpen,
}: {
	open: boolean;
	testId: number;
	courseId: number;
	questionTypeId: number;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>();
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const dataTest = {
			...data,
			test_id: testId,
			course_id: courseId,
			question_type_id: questionTypeId,
		};
		await dispatch(createQuestionTest(dataTest));
		setOpen(false);
	};
	return (
		<Dialog
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			open={open}
			handler={setOpen}
			size="xl"
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Nueva Pregunta
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="">
						<Input
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							type="text"
							label="Encabezado"
							placeholder="Encabezado"
							maxLength={500}
							className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
							crossOrigin={undefined}
							{...register('header', {
								required: {
									value: true,
									message: 'La duracion es requerida',
								},
							})}
							aria-invalid={errors.header ? 'true' : 'false'}
						/>
						{errors.header && (
							<span className="text-red-500 text-sm/[8px] py-2">
								{errors.header.message}
							</span>
						)}
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

export default NewQuestionTest;
