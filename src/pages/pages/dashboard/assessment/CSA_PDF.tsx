import moment from 'moment';
import './pdfStyle.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { Typography } from '@material-tailwind/react';
import { Check } from 'lucide-react';

const CSA_PDF = ({ day }: { day: number }) => {
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
	const license = ['', 'ATP', 'Commercial', 'Privado'];
	const regulation = ['', 'INAC', 'No-INAC'];
	const { assessment } = useSelector((state: RootState) => {
		return {
			assessment: state.assessment,
		};
	});
	const days = assessment.courseStudentAssessmentSelected?.course
		?.days
		? Array.from(
				{
					length:
						assessment.courseStudentAssessmentSelected.course.days <=
						day
							? assessment.courseStudentAssessmentSelected.course.days
							: day,
				},
				(_, i) => ({
					id: i,
					name: `Dia ${i + 1}`,
				})
		  )
		: [];
	// console.log(assessment.daysSubjectList);

	return (
		<div className="printable">
			<div className="flex flex-col text-center gap-2">
				<img
					src="/images/logo.png"
					alt="Descripción de la imagen"
					width={125}
				/>
				<Typography
					variant="h5"
					color="black"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Registro De Entrenamiento De Vuelo Del Piloto
				</Typography>
				<Typography
					variant="h5"
					color="black"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{assessment.courseStudentAssessmentSelected?.course?.name} -
					Curso{' '}
					{
						assessment.courseStudentAssessmentSelected?.course
							?.course_level.name
					}
				</Typography>
				<div className="flex flex-col border-4 w-full gap-2">
					<div className="flex flex-col border border-blue-gray-800 bg-white">
						<table className="table-auto ">
							<tbody>
								<tr>
									<td
										colSpan={2}
										className="border border-blue-gray-800 px-2 text-xs"
									>
										<strong> Nombre del Piloto:</strong> <br />
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.name
										}{' '}
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.last_name
										}
									</td>
									<td
										colSpan={2}
										className="border border-blue-gray-800 px-2 text-xs"
									>
										<strong> Documento de Identificacion:</strong>{' '}
										<br />
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
									<td
										colSpan={2}
										className="border border-blue-gray-800 px-2 text-xs"
									>
										<strong>Fecha del Curso:</strong> <br />
										{moment(
											assessment.courseStudentAssessmentSelected
												?.course_student?.date
										).format('DD-MM-YYYY')}
									</td>
								</tr>
								<tr>
									<td
										colSpan={4}
										className="border border-blue-gray-800 px-2 text-xs"
									>
										<strong> Cliente:</strong> <br />
									</td>

									<td
										colSpan={2}
										className="border border-blue-gray-800 px-2 text-xs"
									>
										<div className="flex flex-row gap-1">
											<strong>Objetivos:</strong> <br />
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
									<td className="border border-blue-gray-800 px-2 text-xs">
										<strong> Certificado Piloto Numero:</strong>{' '}
									</td>

									<td
										colSpan={2}
										className="border border-blue-gray-800 px-2 text-xs"
									>
										<div className="flex flex-row gap-1">
											<strong> Tipo de Licencia:</strong>{' '}
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
									<td className="border border-blue-gray-800 px-2 text-xs">
										<strong> Curso Numero:</strong>
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										<strong> Revisión:</strong>{' '}
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										<strong> Fecha de revisión:</strong>{' '}
										{moment(
											assessment.courseStudentAssessmentSelected
												?.course_student?.date
										).format('DD-MM-YYYY')}
									</td>
								</tr>
								<tr>
									<td className="border border-blue-gray-800 px-2 text-xs">
										<strong>Modelo de avión:</strong> <br />
										{
											assessment.courseStudentAssessmentSelected
												?.course?.plane_model
										}
									</td>

									<td
										colSpan={2}
										className="border border-blue-gray-800 px-2 text-xs"
									>
										<strong>Base de operaciones piloto:</strong>{' '}
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										<strong> Certificado 360ATC::</strong>
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										<strong> Tipo de curso:</strong> <br />
										{
											assessment.courseStudentAssessmentSelected
												?.course?.name
										}
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										<strong> País del participante:</strong> <br />
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.country_name
										}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div className="flex flex-col border-4 w-full gap-2">
					<div className="flex flex-col border border-blue-gray-800 bg-white">
						<table className="table-auto border-collapse border border-gray-300">
							<thead className="bg-gray-300">
								<tr>
									<th
										colSpan={3}
										className="border border-blue-gray-800 px-2 text-xs w-36"
									>
										<strong>Periodo de formación </strong>
									</th>
									{days.map((day, index) => {
										return (
											<th
												key={index}
												className="border border-blue-gray-800 px-2 text-xs"
											>
												{day.id + 1}
											</th>
										);
									})}
								</tr>
							</thead>
							<tbody>
								<tr>
									<td className="border border-blue-gray-800 px-2 text-xs">
										<strong>Fecha:</strong>
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										{moment(
											assessment.courseStudentAssessmentSelected
												?.course_student?.date
										).format('DD-MM-YYYY')}
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										{moment(
											assessment.courseStudentAssessmentSelected
												?.course_student?.date
										)
											.add(days.length, 'days')
											.format('DD-MM-YYYY')}
									</td>
								</tr>
								<tr>
									<td
										colSpan={3}
										className="border border-blue-gray-800 px-2 text-xs"
									>
										<strong>Iniciales de instructor</strong>
									</td>
									{days.map((day, index) => {
										return (
											<td
												key={`td-${index}`}
												className="border border-blue-gray-800 px-2 text-xs"
											>
												{day.id + 1} FF
											</td>
										);
									})}
								</tr>
							</tbody>
						</table>
						{assessment.daysSubjectList?.map((sub, index) => {
							return (
								<table
									key={`subject-${index}`}
									className="table-auto border-collapse border border-gray-300"
								>
									<thead className="bg-gray-300">
										<tr>
											<th
												colSpan={3}
												className="border border-blue-gray-800 px-2 text-xs w-36"
											>
												<strong>{sub.name}</strong>
											</th>
											{days.map((day, index) => {
												return (
													<th
														key={index}
														className="border border-blue-gray-800 px-2 w-16 text-xs"
													>
														{day.id + 1}
													</th>
												);
											})}
										</tr>
									</thead>
									<tbody>
										{sub.subject_lessons?.map((SL, index) => {
											return (
												<tr key={`SL-${index}`}>
													<td
														colSpan={3}
														className="border border-blue-gray-800 px-2 text-xs w-36"
													>
														<strong>{SL.name}</strong>
													</td>
													{days.map((day, index) => {
														const dayActive =
															SL.subject_lesson_days?.find(
																(SLD) => SLD.day === day.id + 1
															);
														const CSALD =
															dayActive?.course_student_assessment_lesson_days;
														const tryCount =
															CSALD && CSALD.length > 0
																? CSALD[0]
																: null;

														return (
															<td
																key={`td-${index}`}
																className={`border border-blue-gray-800 w-16 px-2 text-xs ${
																	dayActive ? 'bg-gray-400' : ''
																}`}
															>
																{tryCount?.score}{' '}
																{tryCount?.score_2 &&
																	tryCount.score <= 2 &&
																	` / ${tryCount.score_2}`}
																{tryCount?.score_3 &&
																	tryCount.score_2 &&
																	tryCount.score_2 <= 2 &&
																	` / ${tryCount.score_3}`}
															</td>
														);
													})}
												</tr>
											);
										})}
									</tbody>
								</table>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CSA_PDF;
