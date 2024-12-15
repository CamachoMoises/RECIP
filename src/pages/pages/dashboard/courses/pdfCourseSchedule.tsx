import { Typography } from '@material-tailwind/react';
import {
	CourseState,
	subject,
	user,
} from '../../../../types/utilities';
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
				<div className="flex flex-col bg-gray-400 w-full border-4  border-blue-gray-800 p-1 gap-2">
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
								Curso {course.courseSelected?.course_level.name}{' '}
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
									<td className="border border-green-800 px-2 text-xs">
										<strong> Nombre del Piloto:</strong>{' '}
										{studentSelect?.name} {studentSelect?.last_name}
									</td>
									<td className="border border-green-800 px-2 col-span-2 text-xs">
										<div className="flex flex-row gap-3">
											<strong>Tipo:</strong>{' '}
											<Check size={15} color="green" />
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
										<strong>Identificacion:</strong>{' '}
										{studentSelect?.user_doc_type?.symbol}-
										{studentSelect?.doc_number}
									</td>
									<td className="border border-green-800 px-2  text-xs">
										<div className="flex flex-row gap-3">
											<strong>Licencia:</strong>
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
										<strong>Fecha de inicio:</strong>{' '}
										{moment(course.courseStudent?.date).format(
											'DD-MM-YYYY'
										)}
									</td>

									<td className="border border-green-800 px-2 text-xs">
										<div className="flex flex-row gap-3">
											<strong>Normativa:</strong>{' '}
											<Check size={15} color="green" />
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
								<tr>
									<td className="border border-green-800 px-2  text-xs">
										<strong>Correo:</strong>
										{studentSelect?.email}
									</td>
									<td className="border border-green-800 px-2  text-xs">
										<strong>Telefono:</strong>
										{studentSelect?.phone}
										<div className="fle flex-row">
											<strong>Pais:</strong>
											{studentSelect?.country_name}
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					<div className="flex flex-col">
						<div className="flex w-full bg-white border border-blue-gray-800">
							<Typography
								variant="h6"
								color="black"
								className="text-center w-full"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Cronograma de la{' '}
								{course.courseSelected?.course_type.name}
							</Typography>
						</div>

						<div className="flex flex-col gap-3">
							{/* Tabla 1 */}

							<Table
								columns={[
									'Módulo',
									'Fecha / Hora Inicio',
									'Horas Totales',
									'Instructor',
								]}
								data={data}
							/>
							<table className="table-auto border-collapse border border-gray-300">
								<tbody className="bg-gray-100">
									<tr>
										<td className="border border-gray-800 px-4 text-left text-xs">
											Resultados del examen: %
										</td>
										<td className="border border-gray-800 px-4 text-left text-xs">
											Corregido el: %
										</td>
										<td className="border border-gray-800 px-4 text-left text-xs">
											Fecha de completado:{' '}
											{course.courseStudent && (
												<>
													{moment(course.courseStudent.date)
														.add(
															course.courseSelected?.days
																? course.courseSelected.days
																: -1,
															'days'
														)
														.format('DD-MM-YYYY')}
												</>
											)}
										</td>
									</tr>
									<tr>
										<td className="border border-gray-800 px-4  text-left text-xs">
											Resultados para repetir: %
										</td>
										<td className="border border-gray-800 px-4  text-left text-xs">
											Corregido el: %
										</td>
										<td className="border border-gray-800 px-4  text-left text-xs">
											Total de horas: {course.courseSelected?.hours}{' '}
											<br />
											Total de dias: {course.courseSelected?.days}
										</td>
									</tr>
									<tr>
										<td
											colSpan={3}
											className="border border-gray-800 px-4 py-2 text-left text-tahiti-600 text-xs"
										>
											Nombre del instructor:
										</td>
									</tr>
									<tr>
										<td
											colSpan={3}
											className="border border-gray-800 px-4 py-2 text-left text-xs"
										>
											El resultado de las pruebas inferiores al 85%:
											Reentrenamiento en módulos donde el conocimiento
											y compresión del estudiante es deficiente.
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const Table: React.FC<{ columns: string[]; data: any[] }> = ({
	columns,
	data,
}) => {
	const add_files =
		data.length < 18
			? Array.from({ length: 18 - data.length }, (_, i) => ({
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
						<td className="border border-gray-800 w-40 overflow-hidden bg-white text-xs text-center font-bold">
							{index ? <>{index} </> : ' '}
							{row.subject.name}
						</td>
						<td className="border border-gray-800 bg-white text-xs text-center">
							{moment(row.date).format('DD-MM-YYYY')} /{' '}
							{moment(row.hour, 'HH:mm:ss').format('HH:mm')}
						</td>
						<td className="border border-gray-800 bg-white text-xs text-center">
							{row.classTime}
						</td>
						<td className="border border-gray-800 bg-white text-xs text-center">
							{row.instructor.user.name}{' '}
							{row.instructor.user.last_name}
						</td>
					</tr>
				))}
				{add_files.map((row, index) => (
					<tr key={index} className="hover:bg-gray-50">
						<td className="border border-gray-800 w-40 h-6 bg-gray-600 text-xs text-center font-bold">
							{' '}
						</td>
						<td className="border border-gray-800  h-6 bg-gray-600 text-xs text-center font-bold">
							{' '}
						</td>
						<td className="border border-gray-800  h-6 bg-gray-600 text-xs text-center font-bold">
							{' '}
						</td>
						<td className="border border-gray-800  h-6 bg-gray-600 text-xs text-center font-bold">
							{' '}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default PDFCourseSchedule;
