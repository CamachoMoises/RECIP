import { useState } from 'react';
import { test } from '../../../../types/utilities';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
	Button,
	Input,
	List,
	ListItem,
	Switch,
	Typography,
} from '@material-tailwind/react';
import { Pencil, Save, X } from 'lucide-react';
type Inputs = {
	duration: number;
	min_score: number;
};
const TestParams = ({
	test,
	updateTestFunc,
}: {
	test: test;
	updateTestFunc: (
		test: test,
		data: {
			duration: number;
			min_score: number;
			status: boolean;
		}
	) => Promise<void>;
}) => {
	const [edit, setEdit] = useState(false);
	const [statusChanged, setStatusChanged] = useState(false);
	const [isActive, setIsActive] = useState(test.status);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			duration: test.duration,
			min_score: test.min_score,
		},
	});

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const newData = { ...data, status: isActive };
		updateTestFunc(test, newData);
		setEdit(false);
	};
	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<List
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<ListItem
					className=" flex flex-row justify-between"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Typography
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Duracion de la prueba
					</Typography>

					{edit ? (
						<>
							<div className="">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="number"
									label="Minutos"
									placeholder="Minutos"
									maxLength={5}
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
						</>
					) : (
						<>
							<Typography
								onClick={() => setEdit(!edit)}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{test.duration} Minutos
							</Typography>
						</>
					)}
				</ListItem>
				<ListItem
					className=" flex flex-row justify-between"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Typography
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Nota minima aprobatoria
					</Typography>
					{edit ? (
						<>
							<div className="">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="number"
									label="Puntos"
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
						</>
					) : (
						<>
							<Typography
								onClick={() => setEdit(!edit)}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{test.min_score} Puntos
							</Typography>
						</>
					)}
				</ListItem>
			</List>
			{edit && (
				<div className="flex flex-col gap-3 p-3 justify-center">
					<div className="flex flex-row gap-5">
						<div className="text-left">
							<label htmlFor="Nombre" className="text-sx text-black">
								Estatus
							</label>
							<br />
							<Switch
								className="h-full w-full checked:bg-[#134475]"
								containerProps={{
									className: 'w-11 h-6',
								}}
								circleProps={{
									className: 'before:hidden left-0.5 border-none',
								}}
								defaultChecked={test.status}
								onChange={() => {
									setStatusChanged(true);
									setIsActive(!isActive);
								}}
								crossOrigin={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							/>
						</div>
					</div>
					<div className="flex flex-row gap-5">
						{statusChanged && isActive && (
							<Typography
								color="red"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Activar este examen desactiva el resto
							</Typography>
						)}
					</div>
				</div>
			)}
			<div className="flex flex-row gap-3 my-2 justify-center">
				<div>
					<Button
						size="sm"
						title={edit ? 'Cancelar' : 'Cambiar Encabezado'}
						variant={edit ? 'outlined' : 'filled'}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={() => {
							setEdit(!edit);
						}}
					>
						{edit ? <X size={15} /> : <Pencil size={15} />}
					</Button>
				</div>
				{edit && (
					<div>
						<Button
							title="Guardar"
							size="sm"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							type="submit"
						>
							<Save size={15} />
						</Button>
					</div>
				)}
			</div>
		</form>
	);
};

export default TestParams;
