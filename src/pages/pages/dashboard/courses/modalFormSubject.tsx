import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
	Switch,
} from '@material-tailwind/react';
import { subject } from '../../../../types/utilities';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
	createSubject,
	updateSubject,
} from '../../../../features/subjectSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store';
type Inputs = {
	name: string;
	hours: string;
};
const ModalFormSubject = ({
	subjectSelected,
	openNewSubject,
	handleOpen,
	maxOrderNumber,
}: {
	subjectSelected: subject | null;
	openNewSubject: boolean;
	handleOpen: () => void;
	maxOrderNumber: number | null;
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const [isActive, setIsActive] = useState(
		subjectSelected ? subjectSelected?.status : true
	);
	const { id } = useParams<{ id: string }>();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			name: subjectSelected?.name,
			hours: `${subjectSelected?.hours}`,
		},
	});
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const newSubject: subject = {
			id: subjectSelected?.id ? subjectSelected.id : null,
			name: data.name,
			hours: parseFloat(data.hours ? data.hours : '0'),
			order: subjectSelected?.order
				? subjectSelected.order
				: maxOrderNumber
				? maxOrderNumber + 1
				: 1,
			course_id: parseInt(id ? id : '-1'),
			status: isActive,
		};
		handleOpen();
		if (subjectSelected) {
			await dispatch(updateSubject(newSubject));
		} else {
			await dispatch(createSubject(newSubject));
		}
	};
	return (
		<Dialog
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			open={openNewSubject}
			handler={handleOpen}
			size="xl"
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{subjectSelected
						? `Editar  ${subjectSelected.name}`
						: 'Nueva Asignación'}
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="container mx-auto p-3">
						<div className="flex flex-row gap-2 w-full">
							<div className="flex flex-col w-full">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="text"
									label="Nombre"
									placeholder="Nombre"
									maxLength={500}
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register('name', {
										required: {
											value: true,
											message: 'El nombre es requerido',
										},
									})}
									aria-invalid={errors.name ? 'true' : 'false'}
								/>
								{errors.name && (
									<span className="text-red-500 text-sm/[8px] py-2">
										{errors.name.message}
									</span>
								)}
							</div>
							<div className="flex flex-col w-full">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="text"
									label="Horas"
									placeholder="Horas"
									maxLength={500}
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register(
										'hours',

										{
											required: {
												value: true,
												message: 'la Hora es requerida',
											},
											validate: async (value: string) => {
												const regex = /^\d+(\.\d+)?$/;
												if (!regex.test(value))
													return 'Debe ser nuemrico con decimales separados por puntos';
												return true;
											},
										}
									)}
									aria-invalid={errors.name ? 'true' : 'false'}
								/>
								{errors.hours && (
									<span className="text-red-500">
										{errors.hours.message}
									</span>
								)}
							</div>
						</div>
						<div className="flex flex-row gap-3 py-3">
							<div className="basis-1/2">
								<div className="flex flex-row gap-5">
									<div>
										<label
											htmlFor="Nombre"
											className="text-sx text-black"
										>
											Estatus
										</label>
										<br />
										<Switch
											defaultChecked={
												subjectSelected ? isActive : true
											}
											onChange={() => {
												setIsActive(!isActive);
											}}
											crossOrigin={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
									</div>
								</div>
							</div>
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
						onClick={handleOpen}
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
						<span>{subjectSelected ? 'Actualizar' : 'Crear'}</span>
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
};

export default ModalFormSubject;
