import { Typography } from '@material-tailwind/react';
import {
	CourseState,
	subject,
	subjectState,
	user,
} from '../../../../types/utilidades';
import './pdfStyle.css';
import moment from 'moment';

const PDFCourseSchedule = ({
	studentSelect,
	course,
	subjectList,
	days,
}: {
	course: CourseState;
	subjectList: subject[];
	studentSelect: user | null | undefined;
	days: {
		id: number;
		name: string;
	}[];
}) => {
	moment.locale('es');
	const fechaFormateada = moment().format('dddd, D MMMM YYYY');
	return (
		<div className="printable">
			<div className="flex flex-row justify-between">
				<img
					src="/images/logo.png"
					alt="Descripción de la imagen"
					width={150}
				/>
				<p className="pt-6">{fechaFormateada}</p>
			</div>
			<div className="pt-2">
				<Typography
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Buen día {studentSelect?.name} {studentSelect?.last_name} se
					encuentra agendado el curso {course.courseSelected?.name}{' '}
					{course.courseSelected?.course_type.name}{' '}
					{course.courseSelected?.course_level.name} Iniciado en la
					fecha {course.courseStudent?.date} teniendo el siguiente
					cronograma:
				</Typography>
			</div>
			{days.map((day) => (
				<div key={`${day.id}-day`} className="pt-2 flex flex-col">
					<div className="flex flex-row gap-3">
						<Typography
							variant="h5"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{day.name}
						</Typography>
						<Typography
							variant="h6"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Asignaciones
						</Typography>
					</div>
					{subjectList.map((subjectItem) => {
						const SD = subjectItem.subject_days?.find(
							(sd) =>
								sd.day === day.id + 1 &&
								sd.status &&
								subjectItem.status
						);
						const schedule = course.scheduleList?.find(
							(schedule) =>
								schedule.subject_days_subject_id === subjectItem.id &&
								schedule.subject_days_id === SD?.id
						);
						return (
							<div key={`${subjectItem.id}-subject`} className="pt-2">
								<Typography
									variant="lead"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{subjectItem.name}
								</Typography>
								{SD ? (
									<div className="flex flex-row gap-3">
										<Typography
											variant="small"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Fecha:
											{moment(schedule?.date).format(
												'dddd, D MMMM YYYY'
											)}{' '}
											({schedule?.hour})
										</Typography>
										<Typography
											variant="small"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											duracion: {subjectItem.hours}horas
										</Typography>
									</div>
								) : (
									<>
										<Typography
											variant="small"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Nop aplica
										</Typography>
									</>
								)}
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
};

export default PDFCourseSchedule;
