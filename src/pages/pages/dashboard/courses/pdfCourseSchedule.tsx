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
	const data = course.scheduleList;
	const isSplit = data.length > 12;
	const table1Data = isSplit ? data.slice(0, 12) : data;
	const table2Data = isSplit ? data.slice(12) : [];

	// const fechaFormateada = moment().format('dddd, D MMMM YYYY');
	return (
		<div className="printable">
			<div className="flex flex-row justify-between">
				<div className="flex flex-col bg-gray-400 w-full border-4  border-blue-gray-800 p-2 gap-2">
					<div className="flex flex-row justify-between">
						<img
							src="/images/logo.png"
							alt="Descripción de la imagen"
							width={120}
						/>

						<div className="flex-col justify-center text-center">
							<Typography
								variant="h6"
								color="black"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{course.courseSelected?.name}
							</Typography>
							<Typography
								variant="h6"
								color="black"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{course.courseSelected?.description}{' '}
								{course.courseSelected?.course_type.name}
							</Typography>
						</div>
					</div>
					<div className="flex flex-col border-4  border-blue-gray-800  bg-white p-2 ">
						<table className="table-auto ">
							<tbody>
								<tr>
									<td className="border border-green-800 px-2">
										Nombre
									</td>
									<td className="border border-green-800 px-2">
										{studentSelect?.name} {studentSelect?.last_name}
									</td>
									<td className="border border-green-800 px-2">
										Nombre
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2">
										Identificacion
									</td>
									<td className="border border-green-800 px-2">
										{studentSelect?.user_doc_type?.symbol}-
										{studentSelect?.doc_number}
									</td>
									<td className="border border-green-800 px-2">
										Nombre
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2">
										Fecha de inicio
									</td>
									<td className="border border-green-800 px-2">
										{moment(course.courseStudent?.date).format(
											'DD-MM-YYYY'
										)}
									</td>
									<td className="border border-green-800 px-2">
										Nombre
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div></div>
					<div className="flex flex-col">
						<div className="flex w-full bg-white border border-blue-gray-800  pb-3">
							<Typography
								variant="h6"
								color="black"
								className="text-center w-full"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Modulos de la{' '}
								{course.courseSelected?.course_type.name}
							</Typography>
						</div>
						<div
							className={`flex flex-wrap ${
								isSplit ? 'justify-between' : 'justify-center'
							}`}
						>
							{/* Tabla 1 */}
							<div className="w-full overflow-hidden">
								<Table
									columns={['Módulo', 'Fecha', 'Horas', 'Instructor']}
									data={table1Data}
								/>
							</div>

							{/* Tabla 2 (solo si hay datos adicionales) */}
							{table2Data.length > 0 && (
								<div className="w-full overflow-hidden">
									<Table
										columns={[
											'Módulo',
											'Fecha',
											'Horas',
											'Instructor',
										]}
										data={table2Data}
									/>
								</div>
							)}
						</div>
						{/* <table className="table-auto border-blue-gray-800">
							<thead className="bg-gray-400 border border-blue-gray-800">
								<tr>
									<th>Song</th>
									<th>Artist</th>
									<th>Year</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className="border border-blue-gray-800 px-2">
										Nombre
									</td>
									<td className="border border-blue-gray-800 px-2">
										{studentSelect?.name} {studentSelect?.last_name}
									</td>
									<td className="border border-blue-gray-800 px-2">
										Nombre
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2">
										Identificacion
									</td>
									<td className="border border-green-800 px-2">
										{studentSelect?.user_doc_type?.symbol}-
										{studentSelect?.doc_number}
									</td>
									<td className="border border-green-800 px-2">
										Nombre
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2">
										Fecha de inicio
									</td>
									<td className="border border-green-800 px-2">
										{moment(course.courseStudent?.date).format(
											'DD-MM-YYYY'
										)}
									</td>
									<td className="border border-green-800 px-2">
										Nombre
									</td>
								</tr>
							</tbody>
						</table> */}
					</div>
				</div>
				{/* 
				<p className="pt-6">{fechaFormateada}</p> */}
			</div>
			{/* <div className="pt-2">
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
			))} */}
		</div>
	);
};

const Table: React.FC<{ columns: string[]; data: any[] }> = ({
	columns,
	data,
}) => {
	return (
		<table className="table-auto border-collapse border border-gray-300 w-full">
			<thead className="bg-gray-100">
				<tr>
					{columns.map((col, index) => (
						<th
							key={index}
							className="border border-gray-800 px-4 py-2 text-center"
						>
							{col}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((row, index) => (
					<tr key={index} className="hover:bg-gray-50">
						<td className="border border-gray-800 px-4 py-2 bg-white text-xs text-center font-bold">
							{index ? (
								<>
									{' '}
									{index} <br />
								</>
							) : (
								''
							)}
							{row.subject_day.subject.name}
						</td>
						<td className="border border-gray-800 px-4 py-2 bg-white text-xs text-center">
							{row.date}
						</td>
						<td className="border border-gray-800 px-4 py-2 bg-white text-xs text-center">
							{row.hour}
						</td>
						<td className="border border-gray-800 px-4 py-2 bg-white text-xs text-center">
							{row.instructor.user.name}{' '}
							{row.instructor.user.last_name}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default PDFCourseSchedule;
