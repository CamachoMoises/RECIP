import {
	Input,
	Option,
	Select,
	Typography,
} from '@material-tailwind/react';
import { UserState, subject } from '../../../../types/utilidades';

const NewCourseSubject = ({
	subjectItem,
	day,
	user,
	course_student_id,
}: {
	subjectItem: subject;
	day: { id: number; name: string };
	user: UserState;
	course_student_id: number | undefined;
}) => {
	const SD = subjectItem.subject_days?.find(
		(sd) => sd.day === day.id + 1 && sd.status && subjectItem.status
	);

	return (
		<>
			<div className="grid grid-cols-4 gap-4 py-2 px-2">
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
				{SD && (
					<>
						<div className="flex flex-col gap-2">
							<Input
								type="date"
								label="Fecha"
								required={true}
								crossOrigin={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							/>
							{SD.id}
							{course_student_id}
							{subjectItem.id}
							{subjectItem.course_id}
							<br />
							<Input
								type="time"
								label="Hora de inicio"
								required={true}
								crossOrigin={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							/>
						</div>
						<div className="flex flex-row gap-2">
							<Input
								type="number"
								inputMode="numeric"
								label="Horas de clase"
								className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
							/>
							<Typography
								variant="h6"
								className="w-60"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Max: {subjectItem.hours}Hrs
							</Typography>
						</div>
						<div className="flex flex-row gap-2">
							<Select
								label="Selecionar Instructor"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{user.instructorList.map((instr) => (
									<Option key={instr.id} value={`${instr.id}`}>
										{instr.name} {instr.last_name}
									</Option>
								))}
							</Select>
						</div>
					</>
				)}
			</div>
		</>
	);
};

export default NewCourseSubject;
