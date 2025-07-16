import {
	Input,
	Option,
	Select,
	Typography,
} from '@material-tailwind/react';
import {
	UserState,
	courseStudent,
	schedule,
	subject,
	subjectDays,
} from '../../../../types/utilities';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store';
import {
	createSchedule,
	setDay,
	updateSchedule,
} from '../../../../features/courseSlice';
import moment from 'moment';

type FormInputs = {
	date: string;
	hour: string;
	classTime: string;
	instructor_id: string;
};

const NewCourseSubject = ({
	hours,
	subjectItem,
	user,
	course_student,
	student_id,
	SD,
	schedule,
	approve,
	canViewContent,
}: {
	hours: number;
	subjectItem: subject;
	approve: boolean | undefined;
	user: UserState;
	course_student: courseStudent | null;
	student_id: number;
	SD: subjectDays | undefined;
	schedule: schedule | undefined;
	canViewContent: boolean;
}) => {
	const dispatch = useDispatch<AppDispatch>();

	// Calculate initial date
	let initialDate = schedule?.date || course_student?.date;
	if (initialDate && !schedule?.date && SD?.day) {
		initialDate = moment(initialDate, 'YYYY-MM-DD')
			.add(SD.day - 1, 'days')
			.format('YYYY-MM-DD');
	}

	// Calculate start time
	const hoursPassed = hours - subjectItem.hours;
	const startTime = moment('08:00', 'HH:mm').add(
		hoursPassed,
		'hours'
	);

	// Form setup
	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<FormInputs>({
		defaultValues: {
			date: initialDate ? initialDate : moment().format('YYYY-MM-DD'),
			hour: schedule?.hour || startTime.format('HH:mm'),
			classTime: schedule?.classTime
				? `${schedule.classTime}`
				: `${subjectItem.hours}`,
			instructor_id: schedule?.instructor_id
				? `${schedule.instructor_id}`
				: undefined,
		},
	});

	const onSubmit: SubmitHandler<FormInputs> = async (data) => {
		dispatch(setDay(SD?.day || 1));

		const req: schedule = {
			id: schedule?.id,
			instructor_id: parseInt(data.instructor_id),
			course_id: subjectItem.course_id,
			subject_days_id: SD?.id || -1,
			student_id: student_id,
			subject_id: subjectItem.id || -1,
			course_student_id: course_student?.id || -1,
			date: data.date,
			hour: data.hour,
			classTime: parseFloat(data.classTime || '0'),
		};

		if (schedule) {
			await dispatch(updateSchedule(req));
		} else {
			await dispatch(createSchedule(req));
		}
	};

	// Determine background color based on state
	const bgColor = () => {
		if (!SD || student_id < 0) return 'bg-gray-300';
		if (schedule && SD && student_id > 0) return 'bg-green-100';
		return '';
	};

	return (
		<div
			className={`grid grid-cols-1 md:grid-cols-4 gap-4 py-2 px-2 rounded-sm ${bgColor()}`}
		>
			{/* Subject Name */}
			<div className="md:col-span-1">
				<Typography
					variant="h6"
					className="w-full"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{subjectItem.name}
				</Typography>
			</div>

			{/* Inactive Subject Message */}
			{!subjectItem.status && (
				<div className="md:col-span-3 flex justify-center">
					<Typography
						variant="h5"
						className="w-full text-center"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						La asignación está inactiva
					</Typography>
				</div>
			)}

			{/* Subject Form */}
			{SD && student_id > 0 && (
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="md:col-span-3"
				>
					<div className="flex flex-col md:flex-row gap-4">
						{/* Date and Time Inputs */}
						<div className="flex flex-col gap-2 w-full md:w-auto">
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="date"
								disabled={approve || !canViewContent}
								label="Fecha"
								{...register('date', {
									required: {
										value: true,
										message: 'La fecha es requerida',
									},
								})}
								crossOrigin={undefined}
								placeholder={undefined}
							/>
							{errors.date && (
								<Typography
									variant="small"
									color="red"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{errors.date.message}
								</Typography>
							)}

							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="time"
								label="Hora de inicio"
								disabled={approve || !canViewContent}
								{...register('hour', {
									required: {
										value: true,
										message: 'La hora es requerida',
									},
								})}
								crossOrigin={undefined}
								placeholder={undefined}
							/>
							{errors.hour && (
								<Typography
									variant="small"
									color="red"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{errors.hour.message}
								</Typography>
							)}
						</div>

						{/* Class Hours Input */}
						<div className="flex flex-col md:flex-row gap-2 items-center">
							<div className="w-full">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="text"
									disabled={approve || !canViewContent}
									{...register('classTime', {
										required: {
											value: true,
											message: 'Las horas son requeridas',
										},
										validate: (value: string) => {
											const regex = /^\d+(\.\d+)?$/;
											if (!regex.test(value)) {
												return 'Debe ser numérico con decimales separados por puntos';
											}
											if (parseFloat(value) > subjectItem.hours) {
												return `No debe superar las horas máximas (${subjectItem.hours})`;
											}
											return true;
										},
									})}
									label="Horas de clase"
									className="[&::-webkit-inner-spin-button]:appearance-none"
									crossOrigin={undefined}
									placeholder={undefined}
								/>
								{errors.classTime && (
									<Typography
										variant="small"
										color="red"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{errors.classTime.message}
									</Typography>
								)}
							</div>
							<Typography
								variant="small"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Máx: {subjectItem.hours} Hrs
							</Typography>
						</div>

						{/* Instructor Select */}
						<div className="w-full">
							<Controller
								name="instructor_id"
								control={control}
								rules={{ required: 'El instructor es requerido' }}
								render={({ field }) => (
									<Select
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										label="Seleccionar Instructor"
										disabled={approve || !canViewContent}
										{...field}
										placeholder={undefined}
									>
										{user.instructorList.map((instructor) => (
											<Option
												key={`instr-${instructor.id}`}
												value={`${instructor.instructor?.id}`}
											>
												{instructor.name} {instructor.last_name}
											</Option>
										))}
									</Select>
								)}
							/>
							{errors.instructor_id && (
								<Typography
									variant="small"
									color="red"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{errors.instructor_id.message}
								</Typography>
							)}
						</div>
					</div>
					<input type="submit" hidden />
				</form>
			)}
		</div>
	);
};

export default NewCourseSubject;
