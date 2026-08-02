import moment from 'moment';
import './pdfStyle.css';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { Typography } from '@material-tailwind/react';
import { Check, X } from 'lucide-react';

const CSA_PDF = ({ day }: { day: number }) => {
	moment.locale('es');
	const license = ['', 'ATP', 'Commercial', 'Privado', 'FANB'];
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
				}),
			)
		: [];
	// console.log(assessment.daysSubjectList);
	let sumLanding = 0;
	let sumTakeOff = 0;
	for (const key in assessment.courseStudentAssessmentSelected
		?.CourseStudentAssessmentDays) {
		const landing =
			assessment.courseStudentAssessmentSelected
				.CourseStudentAssessmentDays[parseInt(key)].landing;
		const takeoff =
			assessment.courseStudentAssessmentSelected
				.CourseStudentAssessmentDays[parseInt(key)].takeoff;
		sumLanding += landing ? landing : 0;

		sumTakeOff += takeoff ? takeoff : 0;
	}
	const timeToSeconds = (time?: string) => {
		if (!time) return 0;
		const parts = time.split(':').map(Number);
		return parts[0] * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
	};
	const secondsToTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return [hours, minutes, secs]
			.map((part) => String(part).padStart(2, '0'))
			.join(':');
	};
	const getEvaluationDate = (
		baseDate: string | undefined,
		step: number,
	) => {
		let daysToAdd = 0;
		let weekdaysAdded = 0;
		while (weekdaysAdded < step) {
			daysToAdd++;
			const dayOfWeek = moment(baseDate)
				.add(daysToAdd, 'days')
				.day();
			if (dayOfWeek !== 0 && dayOfWeek !== 6) {
				weekdaysAdded++;
			}
		}
		return moment(baseDate).add(daysToAdd, 'days');
	};
	const typeValues = [
		{ value: 'entrenamiento', label: 'Entrenamiento' },
		{ value: 'reentrenamiento', label: 'Reentrenamiento' },
		{ value: 'chequeo', label: 'Chequeo' },
		{ value: 're-chequeo', label: 'Re-chequeo' },
		{ value: 'experiencia_reciente', label: 'Experiencia reciente' },
	];
	const selectedTypes = new Set(
		assessment.courseStudentAssessmentSelected?.CourseStudentAssessmentDays
			?.map((CSAD) => CSAD.type)
			.filter((type): type is string => Boolean(type)) ?? [],
	);
	const firstAirport =
		assessment.courseStudentAssessmentSelected?.CourseStudentAssessmentDays?.find(
			(CSAD) => CSAD.airport,
		)?.airport;
	const courseScoreAverage =
		assessment.courseStudentAssessmentSelected?.course_score_average;
	const proficiencyLabel = (score: number | undefined) => {
		if (score == null) return '';
		if (score < 3) return 'Insatisfactorio';
		if (score < 4) return 'Satisfactorio';
		return 'Excelente';
	};
	let sumTakeoffDay = 0;
	let sumTakeoffNight = 0;
	let sumLandingDay = 0;
	let sumLandingNight = 0;
	let sumTrainingTime = 0;
	let sumCheckTime = 0;
	assessment.courseStudentAssessmentSelected?.CourseStudentAssessmentDays?.forEach(
		(CSAD) => {
			sumTakeoffDay += CSAD.takeoff_day || 0;
			sumTakeoffNight += CSAD.takeoff_night || 0;
			sumLandingDay += CSAD.landing_day || 0;
			sumLandingNight += CSAD.landing_night || 0;
			sumTrainingTime += timeToSeconds(CSAD.training_time);
			sumCheckTime += timeToSeconds(CSAD.check_time);
		},
	);
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
												?.course_student?.date,
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
												?.course_student?.date,
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
										{firstAirport}
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										<strong> Certificado:</strong> CEA 360ATC
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
				<div className="flex flex-col border border-blue-gray-800 bg-white my-2">
					<table className="table-auto border-collapse border border-gray-300">
						<tbody>
							<tr>
								<td className="border border-blue-gray-800 px-2 text-xs">
									<strong>Evaluación Tipo:</strong>
								</td>
								{typeValues.map((type, index) => (
									<td
										key={index}
										className="border border-blue-gray-800 px-2 text-xs"
									>
										{selectedTypes.has(type.value) ? (
											<strong>{type.label}</strong>
										) : (
											type.label
										)}
									</td>
								))}
							</tr>
							<tr>
								<td className="border border-blue-gray-800 px-2 text-xs">
									<strong>
										Evaluación en el FFS / Proficiencia :
									</strong>
								</td>
								<td
									colSpan={5}
									className="border border-blue-gray-800 px-2 text-xs"
								>
									(1) Insatisfactorio. (2) Por Debajo de los
									Estándares. (3) Satisfactorio. (4) Excelente
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div className="flex flex-col border border-blue-gray-800 bg-white my-2">
					<table className="table-auto border-collapse border border-gray-300">
						<tbody>
							<tr>
								<td className="border border-blue-gray-800 px-2 text-xs">
									<strong>Periodo de Entrenamiento</strong>
								</td>
								<td
									colSpan={3}
									className="border border-blue-gray-800 px-2 text-xs"
								>
									<strong>Fecha:</strong>{' '}
									{days.map((day, index) => (
										<span key={index}>
											{getEvaluationDate(
												assessment
													.courseStudentAssessmentSelected
													?.date,
												day.id,
											).format('DD-MM-YYYY')}
											{index < days.length - 1 &&
												' / '}
										</span>
									))}
								</td>
							</tr>
						</tbody>
					</table>
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
									{days.map((day, index) => (
										<td
											key={`fecha-${index}`}
											className="border border-blue-gray-800 px-2 text-xs"
										>
											{getEvaluationDate(
												assessment
													.courseStudentAssessmentSelected
													?.date,
												day.id,
											).format('DD-MM-YYYY')}
										</td>
									))}
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
																(SLD) => SLD.day === day.id + 1,
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

					<div className="flex flex-col border border-blue-gray-800 bg-white my-2">
						<table className="table-auto border-collapse border border-gray-300">
							<thead className="bg-gray-300">
								<tr>
									<th
										colSpan={3}
										className="border border-blue-gray-800 px-2 text-xs w-36"
									>
										<strong>
											Resumen de Evaluación/Proficiencia por
											día
										</strong>
									</th>
									{days.map((day, index) => {
										const dayAverage =
											assessment
												.courseStudentAssessmentSelected
												?.CourseStudentAssessmentDays?.find(
													(CSAD) =>
														CSAD.day ===
														day.id + 1,
												)?.score_average;
										return (
											<th
												key={index}
												className="border border-blue-gray-800 px-2 w-16 text-xs"
											>
												{dayAverage != null
													? dayAverage
													: ''}
											</th>
										);
									})}
								</tr>
							</thead>
						</table>
					</div>

					<div className="flex flex-col border border-blue-gray-800 bg-white my-2">
						<table className="table-auto border border-gray-300">
							<thead className="bg-gray-300">
								<th
									colSpan={6}
									className="border border-blue-gray-800 px-2 text-xs"
								>
									<strong>RESUMEN DE DESPEGUES Y ATERRIZAJES </strong>
								</th>
							</thead>
							<tbody>
								<tr>
									<td className="border border-blue-gray-800 px-2 text-xs">
										DESPEGUES DIURNOS
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										{sumTakeoffDay}
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										DESPEGUES NOCTURNOS
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										{sumTakeoffNight}
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										DESPEGUES
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										{sumTakeOff}
									</td>
								</tr>
								<tr>
									<td className="border border-blue-gray-800 px-2 text-xs">
										ATERRIZAJES DIURNOS
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										{sumLandingDay}
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										ATERRIZAJES NOCTURNOS
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										{sumLandingNight}
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										ATERRIZAJES
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										{sumLanding}
									</td>
								</tr>
								<tr>
									<td className="border border-blue-gray-800 px-2 text-xs">
										TIEMPO DE ENTRENAMIENTO
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										{secondsToTime(sumTrainingTime)}
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										TIEMPO DE CHEQUEO
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										{secondsToTime(sumCheckTime)}
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs"></td>
									<td className="border border-blue-gray-800 px-2 text-xs"></td>
								</tr>
							</tbody>
						</table>
					</div>
					{courseScoreAverage != null && (
						<div className="flex flex-col border border-blue-gray-800 bg-white my-2">
							<table className="table-auto border border-gray-300">
								<tbody>
									<tr>
										<td className="border border-blue-gray-800 px-2 text-xs">
											<strong>
												Proficiencia del curso
												(entrenamiento o chequeo o
												experiencia reciente):
											</strong>{' '}
											{courseScoreAverage} (
											{proficiencyLabel(
												courseScoreAverage,
											)}
											)
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					)}
					<div className="flex flex-col border border-blue-gray-800 bg-white my-2">
						<table className="table-auto border border-gray-300">
							<thead className="bg-gray-300">
								<th className="border border-blue-gray-800 px-2 text-xs">
									<strong>Avales</strong>
								</th>
								<th className="border border-blue-gray-800 px-2 text-xs">
									<strong>Firma digital</strong>
								</th>
							</thead>
							<tbody>
								<tr>
									<td className="border border-blue-gray-800 px-2 text-xs">
										<div className="flex flex-row gap-2">
											Recomendado para: Tipo evaluación de
											habilitación.
											{assessment.courseStudentAssessmentSelected
												?.approve ? (
												<Check size={15} color="green" />
											) : (
												<X size={15} color="red" />
											)}
										</div>
									</td>
									<td className="border border-blue-gray-800 px-2 text-xs">
										.
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div className="flex flex-col border border-blue-gray-800 bg-white my-2">
						<table className="table-auto border border-gray-300">
							<thead className="bg-gray-300">
								<tr>
									<th className="border border-blue-gray-800 px-2 text-xs">
										<strong>Dia</strong>
									</th>
									<th
										colSpan={3}
										className="border border-blue-gray-800 px-2 text-xs"
									>
										<strong>Observaciones</strong>
									</th>
								</tr>
							</thead>
							<tbody>
								{days.map((day, index) => {
									const dayComments =
										assessment.courseStudentAssessmentSelected?.CourseStudentAssessmentDays?.find(
											(CSAD_C) => CSAD_C.day === day.id + 1,
										);
									return (
										<tr key={`comments-${index}`}>
											<td className="border border-blue-gray-800 px-2 text-xs">
												{day.id + 1}
											</td>
											<td
												colSpan={3}
												className="border border-blue-gray-800 px-2 text-xs"
											>
												{dayComments?.comments
													? dayComments.comments
													: 'Sin observaciones'}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
				<div className="my-4 border border-blue-gray-800 p-3 text-xs leading-relaxed">
					Por medio del presente, autorizo a CEA 360 ATC, de forma
					expresa el registro en audio y video de la sesión de
					entrenamiento con el único fin de recibir instrucción,
					evaluación técnica y retroalimentación operativa. Esta captura
					de imagen y voz se gestionará bajo estricta confidencialidad,
					garantizando que el material no será difundido públicamente ni
					utilizado con fines comerciales. Asimismo, se reconoce el
					derecho a revocar este consentimiento y a solicitar el borrado
					seguro del contenido audiovisual según la normativa vigente de
					protección de datos.
				</div>
			</div>
		</div>
	);
};

export default CSA_PDF;
