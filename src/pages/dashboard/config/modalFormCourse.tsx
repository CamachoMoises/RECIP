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
} from '../../../types/utilities';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import {
	createCourse,
	updateCourse,
} from '../../../features/courseSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
type Inputs = {
	name: string;
	description: string;
	code: string;
	days: string;
	sessions: string;
	uses_sessions: boolean;
	hours: number;
	plane_model: string;
	course_type: string;
	course_level: string;
};

const MAX_DAYS = 15;
const MAX_SESSIONS = 30;

const buildCountOptions = (max: number, singular: string, plural: string) =>
	Array.from({ length: max }, (_, i) => ({
		value: `${i + 1}`,
		label: i + 1 === 1 ? `1 ${singular}` : `${i + 1} ${plural}`,
	}));

const course_days = buildCountOptions(MAX_DAYS, 'día', 'días');
const course_sessions = buildCountOptions(
	MAX_SESSIONS,
	'sesión',
	'sesiones',
);

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
	// Implementación del modal para el formulario de nuevo curso o edición de un curso
	const [isActive, setIsActive] = useState(
		courseSelected ? courseSelected?.status : true,
	);

	const dispatch = useDispatch<AppDispatch>();

	const {
		register,
		handleSubmit,
		control,
		watch,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			name: courseSelected?.name,
			description: courseSelected?.description,
			code: courseSelected?.code,
			hours: courseSelected?.hours,
			plane_model: courseSelected?.plane_model,
			course_type: courseSelected?.course_type.id
				? `${courseSelected.course_type.id}`
				: '',
			course_level: courseSelected?.course_level.id
				? `${courseSelected.course_level.id}`
				: '',
			days: courseSelected ? `${courseSelected.days}` : '3',
			sessions: `${
				courseSelected?.sessions ?? courseSelected?.days ?? 3
			}`,
			uses_sessions: courseSelected?.uses_sessions ?? false,
		},
	});

	const usesSessions = watch('uses_sessions');

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const newCourseType: courseType | undefined = courseTypes.find(
			(course) => course.id === parseInt(data.course_type),
		);
		const newCourseLevel: courseLevel | undefined = courseLevel.find(
			(level) => level.id === parseInt(data.course_level),
		);
		if (newCourseType && newCourseLevel) {
			const req: course = {
				id: courseSelected?.id ? courseSelected.id : null,
				name: data.name,
				description: data.description,
				code: data.code,
				hours: data.hours,
				days: parseInt(data.days),
				uses_sessions: data.uses_sessions,
				sessions: parseInt(data.sessions),
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
						<div className="flex flex-col lg:grid lg:grid-cols-4 gap-4">
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
									type="text"
									label="Codigo"
									placeholder="Codigo"
									maxLength={500}
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register('code', {
										required: {
											value: true,
											message: 'El Codigo es requerido',
										},
									})}
									aria-invalid={errors.code ? 'true' : 'false'}
								/>
								{errors.code && (
									<span className="text-red-500 text-sm/[8px] py-2">
										{errors.code.message}
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
							<label
								htmlFor="programa_por_sesiones"
								className="text-sx text-black"
							>
								Programa por sesiones
							</label>
							<br />
							<Controller
								name="uses_sessions"
								control={control}
								render={({ field }) => (
									<Switch
										id="programa_por_sesiones"
										checked={field.value}
										onChange={(event) =>
											field.onChange(event.target.checked)
										}
										crossOrigin={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									/>
								)}
							/>
						</div>
						<div className="">
							{usesSessions ? (
								<Controller
									name="sessions"
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
											label="Número de sesiones"
										>
											{course_sessions.map((option) => (
												<Option
													key={option.value}
													value={option.value}
												>
													{option.label}
												</Option>
											))}
										</Select>
									)}
								/>
							) : (
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
											label="Número de días"
										>
											{course_days.map((option) => (
												<Option
													key={option.value}
													value={option.value}
												>
													{option.label}
												</Option>
											))}
										</Select>
									)}
								/>
							)}
							{errors.days && !usesSessions && (
								<span className="text-red-500">
									El número de días es requerido
								</span>
							)}
							{errors.sessions && usesSessions && (
								<span className="text-red-500">
									El número de sesiones es requerido
								</span>
							)}
						</div>

							<div className="">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="text"
									required
									label="Modelo del Avion"
									placeholder="Modelo del Avion"
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
					<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
						variant="text"
						color="red"
						onClick={handleOpen}
						className="mr-1"
						placeholder={undefined}
					>
						<span>Cancelar</span>
					</Button>
					<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
						variant="gradient"
						color="green"
						type="submit"
						placeholder={undefined}
					>
						<span>{courseSelected ? 'Actualizar' : 'Crear'}</span>
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
};

export default ModalFormCourse;
