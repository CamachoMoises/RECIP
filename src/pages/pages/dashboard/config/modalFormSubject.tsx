import {
	Button,
	Dialog,
	DialogBody,
	DialogHeader,
	Input,
	List,
	ListItem,
	Switch,
	Typography,
} from '@material-tailwind/react';
import { subject, subjectLesson } from '../../../../types/utilities';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
	createSubject,
	createSubjectLesson,
	fetchSubject,
	updateSubject,
	updateSubjectLesson,
} from '../../../../features/subjectSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store';
import { Plus, Save, X } from 'lucide-react';
import LessonDetail from './lessonDetail';
import { axiosPostDefault } from '../../../../services/axios';
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
	days,
}: {
	subjectSelected: subject | null;
	openNewSubject: boolean;
	handleOpen: () => void;
	maxOrderSubject: number | null;
	maxOrderLessonSelected: number | null;
	courseType: number;
	days: {
		id: number;
		name: string;
	}[];
}) => {
	const [openNewSubjectLesson, setOpenNewSubjectLesson] =
		useState(false);
	const [lessonState, setLessonState] = useState<string>();
	const dispatch = useDispatch<AppDispatch>();
	const [isActive, setIsActive] = useState(
		subjectSelected ? subjectSelected?.status : true
	);
	const subject_lessons = subjectSelected?.subject_lessons
		? subjectSelected.subject_lessons
		: [];
	const { id } = useParams<{ id: string }>();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			name: subjectSelected?.name,
			hours: courseType === 2 ? 0 : subjectSelected?.hours,
		},
	});
	const handleChangeStatusDay = async (
		event: React.ChangeEvent<HTMLInputElement>,
		day: { id: number; name: string },
		subject_lesson_id: number | null,
		subject_lesson_days_id: number
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
	const handleNewLesson = async () => {
		const maxOrderLesson = maxOrderLessonSelected
			? maxOrderLessonSelected
			: 0;
		if (subjectSelected && maxOrderLesson >= 0 && lessonState) {
			const newLesson: subjectLesson = {
				id: null,
				course_id: subjectSelected.course_id,
				subject_id: subjectSelected.id ? subjectSelected.id : -1,
				name: lessonState,
				order: maxOrderLesson + 1,
				status: true,
			};
			await dispatch(createSubjectLesson(newLesson));
		}
	};
	const handleEditLesson = async (
		id: number,
		lesson: string,
		order: number,
		status: boolean
	) => {
		if (subjectSelected && maxOrderLessonSelected) {
			const editedLesson: subjectLesson = {
				id,
				course_id: subjectSelected.course_id,
				subject_id: subjectSelected.id ? subjectSelected.id : -1,
				name: lesson,
				order: order,
				status,
			};
			await dispatch(updateSubjectLesson(editedLesson));
		}
	};
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const hours = courseType === 2 || !data.hours ? 0 : data.hours;
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
		};
		if (subjectSelected) {
			await dispatch(updateSubject(newSubject));
			await dispatch(
				fetchSubject(newSubject.id ? newSubject.id : -1)
			);
		} else {
			await dispatch(createSubject(newSubject));
			handleOpen();
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
						: 'Nueva Seccion'}{' '}
				</DialogHeader>
				<DialogBody
					className="h-[30rem] overflow-y-auto"
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
									type="number"
									label="Horas"
									disabled={courseType === 2}
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
											// validate: async (value: string) => {
											// 	const regex = /^\d+(\.\d+)?$/;
											// 	if (!regex.test(value))
											// 		return 'Debe ser nuemrico con decimales separados por puntos';
											// 	return true;
											// },
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
											Activo
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
						<div className="flex flex-row justify-end py-2">
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
								<span>
									{subjectSelected ? 'Actualizar' : 'Crear'}
								</span>
							</Button>
						</div>

						{courseType === 2 && subjectSelected && (
							<>
								<hr />

								<div className="flex flex-col gap-2 py-2">
									<Typography
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										variant="h5"
										className="text-center"
									>
										Temas de la seccion
									</Typography>
									{openNewSubjectLesson && (
										<div className="flex flex-col w-full">
											<Input
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												type="text"
												value={lessonState}
												onChange={(e) => {
													setLessonState(e.target.value);
												}}
												label="Nombre del tema"
												placeholder="Nombre"
												maxLength={500}
												className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
												crossOrigin={undefined}
												aria-invalid={errors.name ? 'true' : 'false'}
											/>
										</div>
									)}
									<div className="flex flex-row gap-3 justify-center">
										<Button
											size="sm"
											variant={
												openNewSubjectLesson ? 'outlined' : 'filled'
											}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											className="flex flex-row justify-center text-center"
											onClick={() => {
												setOpenNewSubjectLesson(
													!openNewSubjectLesson
												);
												setLessonState(undefined);
											}}
										>
											{openNewSubjectLesson ? (
												<X size={20} />
											) : (
												<Plus size={20} />
											)}
										</Button>
										{openNewSubjectLesson && (
											<Button
												size="sm"
												placeholder={undefined}
												disabled={!lessonState}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												className="flex flex-row justify-center text-center"
												onClick={async () => {
													await handleNewLesson();
												}}
											>
												<Save />
											</Button>
										)}
									</div>
									<div className="flex flex-col gap-2 py-2">
										{subject_lessons.length > 0 ? (
											<>
												<Typography
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													className="text-center"
												>
													Dias impartidos
												</Typography>
												<List
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{subject_lessons.map((SL, index) => {
														const subjectLessonDays =
															SL.subject_lesson_days
																? SL.subject_lesson_days
																: [];
														return (
															<ListItem
																key={`SL-${index}`}
																className={`flex justify-between ${
																	SL.status ? '' : 'bg-gray-400'
																}`}
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																<LessonDetail
																	SL={SL}
																	days={days}
																	maxOrderLessonSelected={
																		maxOrderLessonSelected
																	}
																	handleChangeStatusDay={
																		handleChangeStatusDay
																	}
																	subjectLessonDays={
																		subjectLessonDays
																	}
																	handleEditLesson={handleEditLesson}
																/>
															</ListItem>
														);
													})}
												</List>
											</>
										) : (
											<div className="pt-5">
												<Typography
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													variant="h6"
													className="text-center"
												>
													Sin temas creados
												</Typography>
											</div>
										)}
									</div>
								</div>
							</>
						)}
					</div>
				</DialogBody>
			</form>
		</Dialog>
	);
};

export default ModalFormSubject;
