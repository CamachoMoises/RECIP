import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
	Option,
	Select,
	Switch,
	Textarea,
} from '@material-tailwind/react';
import { course, courseType } from '../../../../types/utilidades';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import {
	createCourse,
	updateCourse,
} from '../../../../features/courseSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store';
type Inputs = {
	name: string;
	description: string;
	days: string;
	hours: number;
	course_type: string;
};
const ModalFormCourse = ({
	courseSelected,
	openNewCourse,
	handleOpen,
	courseTypes,
}: {
	courseSelected: course | null;
	openNewCourse: boolean;
	handleOpen: () => void;
	courseTypes: courseType[];
}) => {
	const course_days = [
		{ value: '1', label: '1 dia' },
		{ value: '2', label: '2 dias' },
		{ value: '3', label: '3 dias' },
		{ value: '4', label: '4 dias' },
	];

	// Implementación del modal para el formulario de nuevo curso o edición de un curso
	const [isActive, setIsActive] = useState(
		courseSelected ? courseSelected?.status : true
	);

	const dispatch = useDispatch<AppDispatch>();

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			name: courseSelected?.name,
			description: courseSelected?.description,
			hours: courseSelected?.hours,
			course_type: courseSelected?.course_type.id
				? `${courseSelected.course_type.id}`
				: '',
			days: courseSelected?.days ? `${courseSelected.days}` : '',
		},
	});
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const newCourseType: courseType | undefined = courseTypes.find(
			(course) => course.id === parseInt(data.course_type)
		);
		if (newCourseType) {
			const req: course = {
				id: courseSelected?.id ? courseSelected.id : null,
				name: data.name,
				description: data.description,
				hours: data.hours,
				days: parseInt(data.days),
				type: parseInt(data.course_type),
				status: isActive,
				course_type: newCourseType,
			};
			handleOpen();
			if (courseSelected) {
				await dispatch(updateCourse(req));
			} else {
				await dispatch(createCourse(req));
			}
		}
	};

	return (
		<Dialog
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			open={openNewCourse}
			handler={handleOpen}
			size="xl"
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{courseSelected
						? `Editar a ${courseSelected.name}`
						: 'Nuevo Curso'}
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="container mx-auto p-3">
						<div className="grid grid-cols-4 gap-4">
							<div className="">
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
							<div className="">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="number"
									label="Horas"
									placeholder="Horas"
									maxLength={500}
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register('hours', {})}
									aria-invalid={errors.name ? 'true' : 'false'}
								/>
							</div>
							<div className="">
								<Controller
									name="course_type"
									control={control}
									rules={{
										required: true,
									}}
									render={({ field }) => (
										<Select
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											{...field}
											label="Seleccionar Tipo de curso"
										>
											{courseTypes.map((courseType) => (
												<Option
													key={courseType.id}
													value={`${courseType.id}`}
												>
													{courseType.name}
												</Option>
											))}
										</Select>
									)}
								/>
								{errors.course_type && (
									<span className="text-red-500">
										El tipo de curso es requerido
									</span>
								)}
							</div>

							<div className="">
								<Controller
									name="days"
									control={control}
									rules={{
										required: true,
									}}
									render={({ field }) => (
										<Select
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											{...field}
											label="Duracion del curso "
										>
											{course_days.map((courseDay) => (
												<Option
													key={courseDay.value}
													value={`${courseDay.value}`}
												>
													{courseDay.label}
												</Option>
											))}
										</Select>
									)}
								/>
								{errors.days && (
									<span className="text-red-500">
										La duracion del curso es requerida
									</span>
								)}
							</div>
							<div className="flex flex-col col-span-4">
								<Textarea
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									label="Descripción del curso"
									maxLength={500}
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									{...register('description', {
										required: {
											value: true,
											message: 'El campo de descripción es requerido',
										},
									})}
									aria-invalid={errors.description ? 'true' : 'false'}
								/>
								{errors.description && (
									<span className="text-red-500">
										El campo de descripción es requerido
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
												courseSelected ? isActive : true
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
						<span>{courseSelected ? 'Actualizar' : 'Crear'}</span>
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
};

export default ModalFormCourse;
