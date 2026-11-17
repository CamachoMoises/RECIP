import {
	Button,
	ButtonGroup,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
	List,
	ListItem,
	Switch,
	Typography,
} from '@material-tailwind/react';
import { subject, subjectLesson } from '../../../types/utilities';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
	createSubject,
	createSubjectLesson,
	fetchSubject,
	reorderSubjectLessons,
	updateSubject,
	updateSubjectLesson,
} from '../../../features/subjectSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { Plus, Save, X } from 'lucide-react';
import LessonDetail from './lessonDetail';
import { axiosPostDefault } from '../../../services/axios';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';

type Inputs = {
	name: string;
	hours: number;
};

const ModalFormSubject = ({
	subjectSelected,
	openNewSubject,
	handleOpen,
	maxOrderSubject,
	maxOrderLessonSelected,
	courseType,
	ordinals,
	ordinalNoun,
}: {
	subjectSelected: subject | null;
	openNewSubject: boolean;
	handleOpen: () => void;
	maxOrderSubject: number | null;
	maxOrderLessonSelected: number | null;
	courseType: number;
	ordinals: {
		id: number;
		name: string;
	}[];
	ordinalNoun: string;
}) => {
	const [openNewSubjectLesson, setOpenNewSubjectLesson] =
		useState(false);
	const [lessonState, setLessonState] = useState<string>();
	const [savingLesson, setSavingLesson] = useState(false);
	const [movingLessonId, setMovingLessonId] = useState<number | null>(
		null,
	);
	const dispatch = useDispatch<AppDispatch>();
	const [isActive, setIsActive] = useState(
		subjectSelected ? subjectSelected?.status : true,
	);
	const [isSchedulable, setSchedulable] = useState(
		subjectSelected ? subjectSelected?.is_schedulable : true,
	);
	const subject_lessons = subjectSelected?.subject_lessons
		? subjectSelected.subject_lessons
		: [];
	/**
	 * El orden manual vive en `subject_lesson.order`. Se ordena en el cliente
	 * solo para pintar la lista y armar el `ids` que espera
	 * `PUT /api/subjects/lesson/order` (`order ASC, id ASC`, igual que el
	 * backend); no se modifica el estado de Redux aquí.
	 */
	const orderedLessons = [...subject_lessons].sort(
		(a, b) => a.order - b.order || (a.id ?? 0) - (b.id ?? 0),
	);
	const { id } = useParams<{ id: string }>();
	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<Inputs>({
		defaultValues: {
			name: subjectSelected?.name,
			hours: subjectSelected?.hours,
		},
	});
	const handleChangeStatusDay = async (
		event: React.ChangeEvent<HTMLInputElement>,
		day: { id: number; name: string },
		subject_lesson_id: number | undefined,
		subject_lesson_days_id: number,
	) => {
		const req = {
			status_lesson: event.target.checked,
			course_id: subjectSelected?.course_id,
			subject_id: subjectSelected?.id,
			subject_lesson_id: subject_lesson_id,
			subject_lesson_days_id: subject_lesson_days_id,
			day: day.id + 1,
		};
		await axiosPostDefault('api/subjects/subjects_lesson_days', req);
	};
	const closeNewLesson = () => {
		setOpenNewSubjectLesson(false);
		setLessonState(undefined);
	};
	const handleNewLesson = async () => {
		if (
			!subjectSelected ||
			!lessonState?.trim() ||
			savingLesson
		) {
			return;
		}
		const maxOrderLesson = maxOrderLessonSelected
			? maxOrderLessonSelected
			: 0;
		const newLesson: subjectLesson = {
			id: undefined,
			course_id: subjectSelected.course_id,
			subject_id: subjectSelected.id ? subjectSelected.id : -1,
			name: lessonState.trim(),
			order: maxOrderLesson + 1,
			status: true,
		};
		setSavingLesson(true);
		try {
			await dispatch(createSubjectLesson(newLesson)).unwrap();
			closeNewLesson();
			toast.success('Tema agregado');
		} catch (error) {
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al crear el tema',
			);
		} finally {
			setSavingLesson(false);
		}
	};
	/**
	 * Devuelve `true` cuando el `PUT` se guardó: `lessonDetail` solo cierra el
	 * modo edición con una respuesta exitosa.
	 */
	const handleEditLesson = async (
		id: number,
		lesson: string,
		order: number,
		status: boolean,
	): Promise<boolean> => {
		if (!subjectSelected || !lesson.trim()) return false;
		const editedLesson: subjectLesson = {
			id,
			course_id: subjectSelected.course_id,
			subject_id: subjectSelected.id ? subjectSelected.id : -1,
			name: lesson.trim(),
			order: order,
			status,
		};
		try {
			await dispatch(updateSubjectLesson(editedLesson)).unwrap();
			toast.success('Tema actualizado');
			return true;
		} catch (error) {
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al actualizar el tema',
			);
			return false;
		}
	};
	/**
	 * Sube/baja un tema una posición y persiste con
	 * `PUT /api/subjects/lesson/order`. `ids` es la lista completa de temas de
	 * la sección en el orden final; el thunk reemplaza
	 * `subjectSelected.subject_lessons` con la respuesta ya ordenada, así que
	 * no hace falta un `fetchSubject()` extra.
	 */
	const handleMoveLesson = async (
		lessonId: number | undefined,
		direction: -1 | 1,
	) => {
		if (!subjectSelected?.id || !lessonId || movingLessonId) return;

		const ids = orderedLessons
			.map((lesson) => lesson.id)
			.filter((id): id is number => !!id);
		const from = ids.indexOf(lessonId);
		const to = from + direction;
		if (from === -1 || to < 0 || to >= ids.length) return;

		[ids[from], ids[to]] = [ids[to], ids[from]];

		setMovingLessonId(lessonId);
		try {
			await dispatch(
				reorderSubjectLessons({
					subject_id: subjectSelected.id,
					ids,
				}),
			).unwrap();
		} catch (error) {
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al guardar el orden de los temas',
			);
		} finally {
			setMovingLessonId(null);
		}
	};
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const hours = !data.hours ? 0 : data.hours;
		const newSubject: subject = {
			id: subjectSelected?.id ? subjectSelected.id : null,
			name: data.name,
			hours: hours,
			order: subjectSelected?.order
				? subjectSelected.order
				: maxOrderSubject
					? maxOrderSubject + 1
					: 1,
			course_id: parseInt(id ? id : '-1'),
			status: isActive,
			is_schedulable: isSchedulable,
		};
		if (subjectSelected) {
			try {
				await dispatch(updateSubject(newSubject)).unwrap();
				await dispatch(
					fetchSubject(newSubject.id ? newSubject.id : -1),
				).unwrap();
				toast.success('Sección actualizada');
			} catch (error) {
				toast.error(
					typeof error === 'string'
						? error
						: 'Error al actualizar la sección',
				);
			}
		} else {
			try {
				await dispatch(createSubject(newSubject)).unwrap();
				toast.success('Sección creada');
				handleOpen();
			} catch (error) {
				toast.error(
					typeof error === 'string'
						? error
						: 'Error al crear la sección',
				);
			}
		}
	};
	return createPortal(
		<Dialog
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			open={openNewSubject}
			handler={handleOpen}
			className="flex max-h-[90vh] flex-col overflow-hidden"
			size="xl"
		>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex min-h-0 flex-1 flex-col"
			>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="flex flex-col items-start gap-1 pr-12"
				>
					<span className="text-xl font-semibold text-slate-900">
						{subjectSelected
							? `Editar ${subjectSelected.name}`
							: 'Nueva sección'}
					</span>
					<span className="text-sm font-normal text-slate-500">
						{subjectSelected
							? 'Actualiza los datos de la sección y administra sus temas.'
							: 'Completa los datos para crear una nueva sección.'}
					</span>
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="min-h-0 flex-1 overflow-y-auto"
				>
					<div className="flex flex-col gap-5">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
							<div className="flex flex-col">
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
							<div className="flex flex-col">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="text"
									label="Horas"
									pattern="^\d+(\.\d+)?$"
									disabled={!isSchedulable}
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
										},
									)}
									aria-invalid={errors.hours ? 'true' : 'false'}
								/>
								{errors.hours && (
									<span className="text-red-500">
										{errors.hours.message}
									</span>
								)}
							</div>
						</div>
						<div className="flex flex-wrap items-start gap-6">
							<div className="flex flex-col gap-1">
								<label
									htmlFor="Nombre"
									className="text-xs font-medium uppercase tracking-wide text-slate-500"
								>
									Activo
								</label>
								<Switch
									className="h-full w-full checked:bg-[#134475]"
									containerProps={{
										className: 'w-11 h-6',
									}}
									circleProps={{
										className:
											'before:hidden left-0.5 border-none',
									}}
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
							<div className="flex flex-col gap-1">
								<label
									htmlFor="Nombre"
									className="text-xs font-medium uppercase tracking-wide text-slate-500"
								>
									Programable
								</label>
								<Switch
									className="h-full w-full checked:bg-[#134475]"
									containerProps={{
										className: 'w-11 h-6',
									}}
									circleProps={{
										className:
											'before:hidden left-0.5 border-none',
									}}
									defaultChecked={
										subjectSelected ? isSchedulable : true
									}
									onChange={() => {
										const newValue = !isSchedulable;
										setSchedulable(newValue);
										if (!newValue) {
											setValue('hours', 0);
										}
									}}
									crossOrigin={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								/>
							</div>
						</div>

						{courseType === 2 && subjectSelected && (
							<div className="border-t border-slate-100 pt-4">
								<div className="flex flex-wrap items-start justify-between gap-2">
									<div className="flex flex-col">
										<Typography
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											variant="h6"
											className="text-slate-900"
										>
											Temas del módulo
										</Typography>
										<Typography
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											variant="small"
											className="font-normal text-slate-500"
										>
											{orderedLessons.length > 0
												? `Usa las flechas para cambiar el orden (se guarda solo) y marca el ${ordinalNoun.toLowerCase()} en que se imparte cada tema.`
												: 'Aún no hay temas creados en esta sección.'}
										</Typography>
									</div>
									{!openNewSubjectLesson && (
										<Button
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											placeholder={undefined}
											size="sm"
											className="flex items-center gap-1.5"
											onClick={() => {
												setOpenNewSubjectLesson(true);
												setLessonState(undefined);
											}}
										>
											<Plus size={16} />
											Agregar tema
										</Button>
									)}
								</div>

								{openNewSubjectLesson && (
									<div className="mt-3 flex flex-col gap-2 rounded-lg bg-slate-100 p-3 sm:flex-row sm:items-end">
										<div className="w-full">
											<Input
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												type="text"
												value={lessonState ?? ''}
												onChange={(e) => {
													setLessonState(
														e.target.value,
													);
												}}
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														e.preventDefault();
														handleNewLesson();
													}
													if (e.key === 'Escape') {
														e.preventDefault();
														closeNewLesson();
													}
												}}
												label="Nombre del tema"
												placeholder="Nombre del tema"
												maxLength={500}
												autoFocus
												className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
												crossOrigin={undefined}
											/>
										</div>
										<ButtonGroup
											size="sm"
											variant="outlined"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											className="shrink-0 self-end"
										>
											<Button
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												placeholder={undefined}
												title="Guardar tema"
												disabled={
													!lessonState?.trim() ||
													savingLesson
												}
												className="flex items-center gap-1.5"
												onClick={handleNewLesson}
											>
												<Save size={16} />
												Guardar
											</Button>
											<Button
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												placeholder={undefined}
												title="Cancelar"
												disabled={savingLesson}
												className="flex items-center gap-1.5"
												onClick={closeNewLesson}
											>
												<X size={16} />
												Cancelar
											</Button>
										</ButtonGroup>
									</div>
								)}

								<div className="mt-3 flex flex-col gap-2">
									{orderedLessons.length > 0 ? (
										<>
											<div className="flex items-center justify-between px-1">
												<Typography
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													variant="small"
													className="font-semibold text-slate-600"
												>
													Listado de temas
												</Typography>
												<Typography
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													variant="small"
													className="font-normal text-slate-400"
												>
													{orderedLessons.length}{' '}
													{orderedLessons.length === 1
														? 'tema en total'
														: 'temas en total'}
												</Typography>
											</div>
											<List
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												className="p-0"
											>
												{orderedLessons.map((SL, index) => {
													const subjectLessonDays =
														SL.subject_lesson_days
															? SL.subject_lesson_days
															: [];
													return (
														<ListItem
															key={
																SL.id ??
																`SL-${index}`
															}
															className={`flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-2 ${
																SL.status
																	? 'bg-slate-50'
																	: 'bg-gray-200'
															}`}
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															<LessonDetail
																SL={SL}
																ordinals={ordinals}
																handleChangeStatusDay={
																	handleChangeStatusDay
																}
																subjectLessonDays={
																	subjectLessonDays
																}
																handleEditLesson={
																	handleEditLesson
																}
																handleMoveLesson={
																	handleMoveLesson
																}
																isFirst={index === 0}
																isLast={
																	index ===
																	orderedLessons.length -
																		1
																}
																moving={
																	movingLessonId !==
																	null
																}
															/>
														</ListItem>
													);
												})}
											</List>
										</>
									) : (
										<div className="rounded-lg border border-dashed border-slate-300 py-6">
											<Typography
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												variant="small"
												className="text-center font-normal text-slate-500"
											>
												Sin temas creados
											</Typography>
										</div>
									)}
								</div>
							</div>
						)}
					</div>
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="gap-2 border-t border-slate-100"
				>
					<Button
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
						variant="text"
						color="red"
						onClick={handleOpen}
						disabled={isSubmitting}
					>
						Cancelar
					</Button>
					<Button
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
						variant="gradient"
						color="green"
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting
							? 'Guardando...'
							: subjectSelected
								? 'Actualizar'
								: 'Crear'}
					</Button>
				</DialogFooter>
			</form>
		</Dialog>,
		document.getElementById('portal-root') || document.body,
	);
};

export default ModalFormSubject;
