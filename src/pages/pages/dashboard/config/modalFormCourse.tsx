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
import {
	course,
	courseLevel,
	courseType,
} from '../../../../types/utilities';
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
	plane_model: string;
	course_type: string;
	course_level: string;
};
const ModalFormCourse = ({
	courseSelected,
	openNewCourse,
	handleOpen,
	courseTypes,
	courseLevel,
}: {
	courseSelected: course | null;
	openNewCourse: boolean;
	handleOpen: () => void;
	courseTypes: courseType[];
	courseLevel: courseLevel[];
}) => {
	const course_days = [
		{ value: '1', label: '1 dias' },
		{ value: '2', label: '2 dias' },
		{ value: '3', label: '3 dias' },
		{ value: '4', label: '4 dias' },
		{ value: '5', label: '5 dias' },
		{ value: '6', label: '6 dias' },
		{ value: '7', label: '7 dias' },
		{ value: '8', label: '8 dias' },
		{ value: '9', label: '9 dias' },
		{ value: '10', label: '10 dias' },
		{ value: '11', label: '11 dias' },
		{ value: '12', label: '12 dias' },
		{ value: '13', label: '13 dias' },
		{ value: '14', label: '14 dias' },
		{ value: '15', label: '15 dias' },
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
			plane_model: courseSelected?.plane_model,
			course_type: courseSelected?.course_type.id
				? `${courseSelected.course_type.id}`
				: '',
			course_level: courseSelected?.course_level.id
				? `${courseSelected.course_level.id}`
				: '',
			days: courseSelected?.course_level.id === 1 ? `6` : '3',
		},
	});
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const newCourseType: courseType | undefined = courseTypes.find(
			(course) => course.id === parseInt(data.course_type)
		);
		const newCourseLevel: courseLevel | undefined = courseLevel.find(
			(level) => level.id === parseInt(data.course_level)
		);
		if (newCourseType && newCourseLevel) {
			const req: course = {
				id: courseSelected?.id ? courseSelected.id : null,
				name: data.name,
				description: data.description,
				hours: data.hours,
				days: parseInt(data.days),
				type: parseInt(data.course_type),
				level: parseInt(data.course_level),
				plane_model: data.plane_model,
				status: isActive,
				course_type: newCourseType,
				course_level: newCourseLevel,
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
			className="overflow-y-scroll lg:overflow-hidden max-h-[90vh]"
			size="xl"
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{courseSelected
						? `Editar ${courseSelected.name} ${courseSelected.course_level.name}`
						: 'Nuevo Curso'}
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="container mx-auto p-3">
						<div className=" flex flex-col lg:grid lg:grid-cols-4 gap-4">
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
									disabled={true}
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
											label="Seleccionar Nivel de curso"
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
									name="course_level"
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
											label="Seleccionar Nivel de curso"
										>
											{courseLevel.map((CL) => (
												<Option key={CL.id} value={`${CL.id}`}>
													{CL.name}
												</Option>
											))}
										</Select>
									)}
								/>
								{errors.course_level && (
									<span className="text-red-500">
										El Nivel de curso es requerido
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
							<div className="">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="text"
									label="Modelo del Avion (Si aplica)"
									placeholder="Modelo del Avion (Si aplica)"
									maxLength={500}
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register('plane_model')}
									aria-invalid={errors.plane_model ? 'true' : 'false'}
								/>
								{errors.plane_model && (
									<span className="text-red-500 text-sm/[8px] py-2">
										{errors.plane_model.message}
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
