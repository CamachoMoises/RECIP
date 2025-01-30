import moment from 'moment';
import './pdfStyle.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { Typography } from '@material-tailwind/react';
import { Check } from 'lucide-react';

const CSA_PDF = () => {
	moment.locale('es');
	// const day_names = [
	// 	'Manejo General',
	// 	'Manejo General y Asimétrico',
	// 	'Manejo de Vuelo Normal y Asimétrico',
	// 	'Procedimientos Anormales',
	// 	'Procedimientos Anormales y de Emergencia',
	// 	'',
	// 	'',
	// 	'',
	// 	'',
	// 	'',
	// ];
	const type_trip = ['', 'PIC', 'SIC', 'TRIP'];
	const license = ['', 'ATP', 'Commercial', 'Privado'];
	const regulation = ['', 'INAC', 'No-INAC'];
	const { assessment } = useSelector((state: RootState) => {
		return {
			assessment: state.assessment,
		};
	});
	return (
		<div className="printable">
			<div className="flex flex-row justify-between">
				<div className="flex flex-col border-4 w-full p-1 gap-2">
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
								Registro De Entrenamiento De Vuelo Del Piloto <br />
								{
									assessment.courseStudentAssessmentSelected?.course
										?.name
								}{' '}
								- Curso{' '}
								{
									assessment.courseStudentAssessmentSelected?.course
										?.course_level.name
								}
							</Typography>
						</div>
					</div>
					<div className="flex flex-col border-4  border-blue-gray-800  bg-white p-2 ">
						<table className="table-auto ">
							<tbody>
								<tr>
									<td className="border border-green-800 px-2 text-xs">
										<strong> Nombre del Piloto:</strong>{' '}
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.name
										}{' '}
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.last_name
										}
									</td>
									<td className="border border-green-800 px-2 col-span-2 text-xs">
										<div className="flex flex-row gap-3">
											<strong>Tipo:</strong>{' '}
											<Check size={15} color="green" />
											{
												type_trip[
													assessment.courseStudentAssessmentSelected
														?.course_student?.type_trip
														? assessment
																.courseStudentAssessmentSelected
																?.course_student?.type_trip
														: 0
												]
											}{' '}
										</div>
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2  text-xs">
										<strong>Identificacion:</strong>{' '}
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.user_doc_type?.symbol
										}
										-
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.doc_number
										}
									</td>
									<td className="border border-green-800 px-2  text-xs">
										<div className="flex flex-row gap-3">
											<strong>Licencia:</strong>
											<Check size={15} color="green" />
											{
												license[
													assessment.courseStudentAssessmentSelected
														?.course_student?.license
														? assessment
																.courseStudentAssessmentSelected
																?.course_student?.license
														: 0
												]
											}
										</div>
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2  text-xs">
										<strong>Fecha de inicio:</strong>{' '}
										{moment(
											assessment.courseStudentAssessmentSelected
												?.course_student?.date
										).format('DD-MM-YYYY')}
									</td>

									<td className="border border-green-800 px-2 text-xs">
										<div className="flex flex-row gap-3">
											<strong>Normativa:</strong>{' '}
											<Check size={15} color="green" />
											{
												regulation[
													assessment.courseStudentAssessmentSelected
														?.course_student?.regulation
														? assessment
																.courseStudentAssessmentSelected
																?.course_student?.regulation
														: 0
												]
											}
										</div>
									</td>
								</tr>
								<tr>
									<td className="border border-green-800 px-2  text-xs">
										<strong>Correo:</strong>
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.email
										}
									</td>
									<td className="border border-green-800 px-2  text-xs">
										<strong>Telefono:</strong>
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.phone
										}
										<div className="fle flex-row">
											<strong>Pais:</strong>
											{
												assessment.courseStudentAssessmentSelected
													?.student?.user?.country_name
											}
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
								{
									assessment.courseStudentAssessmentSelected?.course
										?.name
								}
							</Typography>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CSA_PDF;
