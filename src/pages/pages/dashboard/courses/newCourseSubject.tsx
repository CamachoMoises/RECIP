import {
	Input,
	Option,
	Select,
	Typography,
} from '@material-tailwind/react';
import {
	UserState,
	schedule,
	subject,
	subject_days,
} from '../../../../types/utilidades';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store';
import {
	createSchedule,
	updateSchedule,
} from '../../../../features/courseSlice';
type Inputs = {
	date: string;
	hour: string;
	classTime: number;
	instructor_id: string;
};
const NewCourseSubject = ({
	subjectItem,
	user,
	course_student_id,
	student_id,
	SD,
	schedule,
}: {
	subjectItem: subject;
	user: UserState;
	course_student_id: number | undefined;
	student_id: number;
	SD: subject_days | undefined;
	schedule: schedule | undefined;
}) => {
	const dispatch = useDispatch<AppDispatch>();

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			date: schedule?.date,
			hour: schedule?.hour,
			classTime: schedule?.classTime,
			instructor_id: schedule?.instructor_id
				? `${schedule.instructor_id}`
				: undefined,
		},
	});

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const req: schedule = {
			id: schedule?.id,
			instructor_id: parseInt(data.instructor_id),
			course_id: subjectItem.course_id,
			subject_days_id: SD?.id ? SD.id : -1,
			student_id: student_id,
			subject_days_subject_id: subjectItem.id ? subjectItem.id : -1,
			course_student_id: course_student_id ? course_student_id : -1,
			date: data.date,
			hour: data.hour,
			classTime: data.classTime,
		};
		if (schedule) {
			await dispatch(updateSchedule(req));
		} else {
			await dispatch(createSchedule(req));
		}
	};

	return (
		<>
			<div
				className={`grid grid-cols-4 gap-4 py-2 px-2 ${
					schedule ? 'bg-green-100 200 rounded' : ''
				}`}
			>
				<div className="flex flex-row gap-2">
					<Typography
						variant="h6"
						className="w-60"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						{subjectItem.name}
					</Typography>
				</div>
				{!subjectItem.status && (
					<Typography
						variant="h5"
						className="w-full text-center"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						La asignacion esta inactiva
					</Typography>
				)}
				{SD && student_id > 0 && (
					<>
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="flex flex-row gap-3">
								<div className="flex flex-col gap-2">
									<Input
										type="date"
										label="Fecha"
										{...register('date', {
											required: {
												value: true,
												message: 'la fecha es requerida',
											},
										})}
										required={true}
										crossOrigin={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									/>
									{errors.date && (
										<span className="text-red-500">
											La fecha es requerida
										</span>
									)}
									<Input
										type="time"
										label="Hora de inicio"
										required={true}
										{...register('hour', {
											required: {
												value: true,
												message: 'la Hora es requerida',
											},
										})}
										crossOrigin={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									/>
									{errors.hour && (
										<span className="text-red-500">
											La hora es requerida
										</span>
									)}
								</div>
								<div className="flex flex-row gap-2">
									<Input
										type="number"
										inputMode="numeric"
										{...register('classTime')}
										label="Horas de clase"
										className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
									<Typography
										variant="h6"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Max: {subjectItem.hours}Hrs
									</Typography>
									<br />
								</div>
								<div className="flex flex-row gap-2">
									<Controller
										name="instructor_id"
										control={control}
										rules={{
											required: true,
										}}
										render={({ field }) => (
											<Select
												label="Selecionar Instructor"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												{...field}
											>
												{user.instructorList.map((instr) => (
													<Option
														key={`instr-${instr.id}`}
														value={`${instr.instructor?.id}`}
													>
														{instr.name} {instr.last_name}
													</Option>
												))}
											</Select>
										)}
									/>
								</div>
								<input type="submit" hidden />
								{errors.instructor_id && (
									<span className="text-red-500">
										El instructor es requerido
									</span>
								)}
							</div>
						</form>
					</>
				)}
			</div>
		</>
	);
};

export default NewCourseSubject;
