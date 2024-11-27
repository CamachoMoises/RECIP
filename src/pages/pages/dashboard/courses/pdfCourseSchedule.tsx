import { Typography } from '@material-tailwind/react';
import {
	CourseState,
	subject,
	user,
} from '../../../../types/utilidades';
import './pdfStyle.css';
import moment from 'moment';
import { Check } from 'lucide-react';

const PDFCourseSchedule = ({
	studentSelect,
	course,
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
	const type_trip = ['', 'PIC', 'SIC', 'TRIP'];
	const license = ['', 'ATP', 'Commercial', 'Privado'];
	const regulation = ['', 'INAC', 'No-INAC'];
	return (
		<div className="printable">
			<div className="flex flex-row justify-between">
				<div className="flex flex-col bg-gray-400 w-full border-4  border-blue-gray-800 p-2 gap-2">
					<div className="flex flex-row justify-around">
						<img
							src="/images/logo.png"
							alt="Descripción de la imagen"
							width={125}
						/>

						<div className="flex-col justify-center text-center">
							<Typography
								variant="h6"
								color="black"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{course.courseSelected?.name}{' '}
								{course.courseSelected?.course_level.name}
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
									<td className="border border-green-800 px-2 text-xs">
										Nombre del Piloto
									</td>
									<td className="border border-green-800 px-2  text-xs">
										{studentSelect?.name} {studentSelect?.last_name}
									</td>
									<td className="border border-green-800 px-2  text-xs">
										<div className="flex flex-row gap-3">
											Tipo: <Check size={15} color="green" />
											{
												type_trip[
													course.courseStudent?.type_trip
														? course.courseStudent.type_trip
														: 0
												]
											}{' '}
										</div>
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2  text-xs">
										Identificacion
									</td>
									<td className="border border-green-800 px-2  text-xs">
										{studentSelect?.user_doc_type?.symbol}-
										{studentSelect?.doc_number}
									</td>
									<td className="border border-green-800 px-2  text-xs">
										<div className="flex flex-row gap-3">
											Licencia:
											<Check size={15} color="green" />
											{
												license[
													course.courseStudent?.license
														? course.courseStudent.license
														: 0
												]
											}
										</div>
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2  text-xs">
										Fecha de inicio
									</td>
									<td className="border border-green-800 px-2  text-xs">
										{moment(course.courseStudent?.date).format(
											'DD-MM-YYYY'
										)}
									</td>
									<td className="border border-green-800 px-2 text-xs">
										<div className="flex flex-row gap-3">
											Normativa: <Check size={15} color="green" />
											{
												regulation[
													course.courseStudent?.regulation
														? course.courseStudent.regulation
														: 0
												]
											}
										</div>
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

						<div className={`flex flex-col`}>
							{/* Tabla 1 */}

							<Table
								columns={['Módulo', 'Fecha', 'Horas', 'Instructor']}
								data={data}
							/>
						</div>
					</div>
				</div>
				{/* 
				<p className="pt-6">{fechaFormateada}</p> */}
			</div>
		</div>
	);
};

const Table: React.FC<{ columns: string[]; data: any[] }> = ({
	columns,
	data,
}) => {
	// console.log(data);

	const add_files =
		data.length < 8
			? Array.from({ length: 8 - data.length }, (_, i) => ({
					id: i,
					name: `item ${i + 1}`,
			  }))
			: [];
	return (
		<table className="table-auto border-collapse border border-gray-300">
			<thead className="bg-gray-100">
				<tr>
					{columns.map((col, index) => (
						<th
							key={index}
							className="border border-gray-800 px-4 py-2 text-center text-xs"
						>
							{col}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((row, index) => (
					<tr key={index} className="hover:bg-gray-50">
						<td className="border border-gray-800 px-4 py-2 h-11 w-40 overflow-hidden bg-white text-xs text-center font-bold">
							{index ? (
								<>
									{index} <br />
								</>
							) : (
								''
							)}
							{row.subject_day.subject.name}
						</td>
						<td className="border border-gray-800 px-4 py-2 bg-white text-xs text-center">
							{moment(row.date).format('DD-MM-YYYY')}
						</td>
						<td className="border border-gray-800 px-4 py-2 bg-white text-xs text-center">
							{row.classTime}
						</td>
						<td className="border border-gray-800 px-4 py-2 bg-white text-xs text-center">
							{row.instructor.user.name}{' '}
							{row.instructor.user.last_name}
						</td>
					</tr>
				))}
				{add_files.map((row, index) => (
					<tr key={index} className="hover:bg-gray-50">
						<td className="border border-gray-800 px-4 py-2 w-40 h-11 bg-gray-600 text-xs text-center font-bold">
							{' '}
						</td>
						<td className="border border-gray-800 px-4 py-2  h-11 bg-gray-600 text-xs text-center font-bold">
							{' '}
						</td>
						<td className="border border-gray-800 px-4 py-2  h-11 bg-gray-600 text-xs text-center font-bold">
							{' '}
						</td>
						<td className="border border-gray-800 px-4 py-2  h-11 bg-gray-600 text-xs text-center font-bold">
							{' '}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default PDFCourseSchedule;
