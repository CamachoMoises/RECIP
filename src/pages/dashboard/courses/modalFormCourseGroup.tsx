import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
	Select,
	Option,
	Typography,
} from '@material-tailwind/react';
import { courseGroup, course } from '../../../types/utilities';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import {
	createCourseGroup,
	updateCourseGroup,
} from '../../../features/courseGroupSlice';
import { fetchCourses } from '../../../features/courseSlice';
import { useEffect } from 'react';
import toast from 'react-hot-toast';

type Inputs = {
	title: string;
	date: string;
	user_code: string;
	course_id: string;
};

const ModalFormCourseGroup = ({
	courseGroupSelected,
	open,
	handleOpen,
	onSuccess,
}: {
	courseGroupSelected: courseGroup | null;
	open: boolean;
	handleOpen: (group?: courseGroup | null) => void;
	onSuccess?: () => void;
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const { courseList } = useSelector(
		(state: RootState) => state.courses,
	);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		trigger,
		formState: { errors, isValid },
	} = useForm<Inputs>({
		defaultValues: {
			title: '',
			date: '',
			user_code: '',
			course_id: '',
		},
		mode: 'onChange',
	});

	useEffect(() => {
		if (open) {
			dispatch(fetchCourses());
			if (courseGroupSelected) {
				reset({
					title: courseGroupSelected.title || '',
					date: courseGroupSelected.date
						? courseGroupSelected.date.split('T')[0]
						: '',
					user_code: courseGroupSelected.user_code || '',
					course_id: courseGroupSelected.course_id
						? courseGroupSelected.course_id.toString()
						: '',
				});
			} else {
				reset({
					title: '',
					date: '',
					user_code: '',
					course_id: '',
				});
			}
		}
	}, [open, dispatch, courseGroupSelected, reset]);

	useEffect(() => {
		if (!courseGroupSelected) {
			trigger();
		}
	}, [
		watch('title'),
		watch('course_id'),
		courseGroupSelected,
		trigger,
	]);

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		if (!courseGroupSelected && !data.course_id) {
			setValue('course_id', '', { shouldValidate: true });
			return;
		}
		try {
			const payload: {
				title: string;
				date?: string;
				user_code?: string;
				course_id?: number;
			} = {
				title: data.title,
				date: data.date || undefined,
				user_code: data.user_code || undefined,
			};
			if (!courseGroupSelected && data.course_id) {
				payload.course_id = parseInt(data.course_id);
			}
			if (courseGroupSelected) {
				await dispatch(
					updateCourseGroup({
						id: courseGroupSelected.id,
						...payload,
					}),
				).unwrap();
				toast.success('Grupo actualizado');
			} else {
				await dispatch(createCourseGroup(payload)).unwrap();
				toast.success('Grupo creado');
			}
			if (onSuccess) onSuccess();
			handleOpen();
			reset();
		} catch (error: any) {
			toast.error(error?.message || 'Error al guardar el grupo');
		}
	};

	return (
		<Dialog
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			open={open}
			handler={() => handleOpen()}
			size="lg"
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{courseGroupSelected
						? `Editar Grupo`
						: 'Nuevo Grupo de Cursos'}
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="flex flex-col gap-4">
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Título"
								placeholder="Ej: Grupo Alpha"
								maxLength={500}
								className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
								crossOrigin={undefined}
								{...register('title', {
									required: {
										value: true,
										message: 'El título es requerido',
									},
								})}
								aria-invalid={errors.title ? 'true' : 'false'}
							/>
							{errors.title && (
								<span className="text-red-500 text-sm py-1">
									{errors.title.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Código personalizado (opcional)"
								placeholder="Ej: GA-2025"
								maxLength={50}
								className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
								crossOrigin={undefined}
								{...register('user_code')}
							/>
							<Typography
								variant="small"
								color="gray"
								className="mt-1"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Si se deja vacío, se genera automáticamente
								(CG-XXXXXXX)
							</Typography>
						</div>
						<div>
							<Select
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								label={
									courseGroupSelected
										? 'Curso (no editable)'
										: 'Curso *'
								}
								placeholder="Seleccione un curso"
								value={watch('course_id')}
								onChange={(value) => {
									if (value) {
										setValue('course_id', value);
										trigger('course_id');
									}
								}}
								disabled={!!courseGroupSelected}
								className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
								error={!!errors.course_id}
							>
								{courseList.map((course: course) => (
									<Option
										key={course.id}
										value={course.id!.toString()}
									>
										{course.name}
									</Option>
								))}
							</Select>
							<Typography
								variant="small"
								color="gray"
								className="mt-1"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{courseGroupSelected
									? 'El curso no se puede cambiar después de crear el grupo'
									: 'Los pilotos asignados deben pertenecer a este curso'}
							</Typography>
							{errors.course_id && (
								<span className="text-red-500 text-sm py-1">
									{errors.course_id.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="date"
								label="Fecha (opcional)"
								placeholder="Fecha"
								className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
								crossOrigin={undefined}
								{...register('date')}
							/>
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
							handleOpen();
							reset();
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
						disabled={!courseGroupSelected && !isValid}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<span>
							{courseGroupSelected ? 'Actualizar' : 'Crear'}
						</span>
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
};

export default ModalFormCourseGroup;
