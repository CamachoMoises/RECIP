import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import { Fragment } from 'react';
import moment from 'moment';
import {
	ordinalLabel,
	ordinalNoun,
	usesSessions,
} from '../../../utils/programSize';
import {
	assessmentState,
	courseStudentAssessmentDay,
	schedule,
} from '../../../types/utilities';

/**
 * Máximo de columnas de ordinal por bloque de tabla.
 *
 * Las tablas de "columna por ordinal" reparte el ancho de la página con `flex: 1` en
 * cada celda y `wrap={false}` en la fila, así que sin tope cada columna encoge a
 * `1 / (2 + total)` del ancho. Con muchas sesiones las etiquetas ("Entrenamiento",
 * "Sin tipo") dejan de entrar y la fila no puede partirse entre páginas.
 *
 * Con 8 ningún curso existente cambia el PDF: el máximo real de `days` hoy es 7. El
 * chunking solo entra en juego a partir del noveno ordinal, que es justamente el caso
 * de un curso programado por sesiones.
 */
const MAX_ORDINAL_COLUMNS = 8;

const chunk = <T,>(items: T[], size: number): T[][] => {
	const out: T[][] = [];
	for (let i = 0; i < items.length; i += size) {
		out.push(items.slice(i, i + size));
	}
	return out;
};

const styles = StyleSheet.create({
	page: {
		padding: 12,
		fontSize: 8,
		backgroundColor: '#e0e0e0',
		fontFamily: 'Helvetica',
	},
	outerBox: {
		borderWidth: 2,
		borderColor: '#263238',
		padding: 4,
		gap: 3,
	},
	// --- Header ---
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 3,
		gap: 8,
	},
	logo: {
		width: 70,
	},
	headerTextBlock: {
		flexDirection: 'column',
		alignItems: 'center',
	},
	headerText: {
		fontSize: 10,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	// --- Cells ---
	cell: {
		borderWidth: 1,
		borderColor: '#263238',
		padding: 3,
		fontSize: 7,
		backgroundColor: 'white',
	},
	cellBold: {
		fontWeight: 'bold',
	},
	cellGray: {
		backgroundColor: '#e0e0e0',
	},
	cellHeader: {
		backgroundColor: '#e0e0e0',
		fontWeight: 'bold',
	},
	cellGreen: {
		backgroundColor: '#d6e3bc',
	},
	cellPeach: {
		backgroundColor: '#fabf8f',
	},
	// --- Tables ---
	table: {
		width: '100%',
		borderWidth: 2,
		borderColor: '#263238',
		backgroundColor: 'white',
		marginBottom: 3,
	},
	row: {
		flexDirection: 'row',
	},
	// --- Footer legal ---
	legal: {
		borderWidth: 1,
		borderColor: '#263238',
		padding: 6,
		marginTop: 3,
		fontSize: 7,
		lineHeight: 1.4,
		textAlign: 'justify',
		backgroundColor: 'white',
	},
	// --- Firmas ---
	sigImage: {
		width: 60,
		height: 26,
		objectFit: 'contain',
	},
	noSignature: {
		color: '#9ca3af',
		fontSize: 6,
		fontStyle: 'italic',
		textAlign: 'center',
	},
});

const CSAssessmentPDFDocument = ({
	assessment,
	logoBase64,
	firmaBase64,
	signatures,
	schedules,
}: {
	assessment: assessmentState;
	logoBase64: string;
	firmaBase64?: string;
	signatures?: Record<
		number,
		{ student?: string; instructor?: string; fcaa?: string }
	>;
	schedules?: schedule[];
}) => {
	moment.locale('es');
	const CSA = assessment.courseStudentAssessmentSelected;
	const programCourse = CSA?.course;
	const assessmentDays = CSA?.CourseStudentAssessmentDays ?? [];
	const findDay = (dayNum: number) =>
		assessmentDays.find((CSAD) => Number(CSAD.day) === dayNum);
	const license = ['', 'TLA', 'Commercial', 'Privado', 'FANB'];
	const regulation = ['', 'INAC', 'No-INAC'];
	const jerarquia = ['', 'PIC', 'SIC', 'SFI', 'SFE', 'PI'];
	const daysWithLessons = new Set<number>();
	(assessment.daysSubjectList ?? []).forEach((sub) =>
		(sub.subject_lessons ?? []).forEach((SL) =>
			(SL.subject_lesson_days ?? []).forEach((SLD) => {
				if (
					(SLD.course_student_assessment_lesson_days?.length ?? 0) >
						0 &&
					SLD.day
				) {
					daysWithLessons.add(Number(SLD.day));
				}
			}),
		),
	);
	const evaluatedDays = [...assessmentDays]
		.filter(
			(CSAD) =>
				daysWithLessons.has(Number(CSAD.day)) && Number(CSAD.day) > 0,
		)
		.sort((a, b) => Number(a.day) - Number(b.day));
	const days = evaluatedDays.map((CSAD) => ({
		id: Number(CSAD.day) - 1,
		name: ordinalLabel(programCourse, Number(CSAD.day)),
	}));

	// El chequeador/inspector solo firma el último día: `buildSignatures` no trae
	// `signature_3_*` para los demás. Se usa el mismo criterio (máximo `day` de
	// todos los CSAD, no solo los evaluados) para que coincidan las dos listas.
	const lastAssessedDayNum = assessmentDays.length
		? Math.max(...assessmentDays.map((CSAD) => Number(CSAD.day)))
		: 0;

	// Bloques de columnas para las tablas de "columna por ordinal". Con un solo
	// bloque (programa legacy) el render es idéntico al de siempre.
	const dayChunks = chunk(days, MAX_ORDINAL_COLUMNS);

	const formatHours = (value: number) => {
		if (!value) return '0';
		return String(Math.round(value * 100) / 100);
	};
	const getEvaluationDate = (
		baseDate: string | undefined,
		step: number,
	) => {
		let daysToAdd = 0;
		let weekdaysAdded = 0;
		while (weekdaysAdded < step) {
			daysToAdd++;
			const dayOfWeek = moment(baseDate).add(daysToAdd, 'days').day();
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
	const typeLabelMap: Record<string, string> = {};
	typeValues.forEach((type) => {
		typeLabelMap[type.value] = type.label;
	});
	const despeguesText = (day?: courseStudentAssessmentDay) => {
		if (!day) return '';
		const takeoffDay = Number(day.takeoff_day) || 0;
		const takeoffNight = Number(day.takeoff_night) || 0;
		if (takeoffDay > 0 || takeoffNight > 0) {
			return `${takeoffDay}D/${takeoffNight}N`;
		}
		return day.takeoff != null ? String(Number(day.takeoff)) : '';
	};
	const aterrizajesText = (day?: courseStudentAssessmentDay) => {
		if (!day) return '';
		const landingDay = Number(day.landing_day) || 0;
		const landingNight = Number(day.landing_night) || 0;
		if (landingDay > 0 || landingNight > 0) {
			return `${landingDay}D/${landingNight}N`;
		}
		return day.landing != null ? String(Number(day.landing)) : '';
	};
	const firstAirport = assessmentDays.find(
		(CSAD) => CSAD.airport,
	)?.airport;
	const courseScoreAverage = CSA?.course_score_average;
	const proficiencyLabel = (score: number | undefined) => {
		if (score == null) return '';
		if (score < 3) return 'Insatisfactorio';
		if (score < 4) return 'Satisfactorio';
		return 'Excelente';
	};
	let sumTakeoffDay = 0;
	let sumTakeoffNight = 0;
	let sumTakeOff = 0;
	let sumLandingDay = 0;
	let sumLandingNight = 0;
	let sumLanding = 0;
	let sumLandingPrecision = 0;
	let sumLandingNonPrecision = 0;
	let sumLandingGps = 0;
	let sumLandingCircuit = 0;
	let sumLandingVisual = 0;
	let sumTrainingTime = 0;
	let sumCheckTime = 0;
	let sumIfrTime = 0;
	let sumVfrTime = 0;
	// Un único paso de acumulación: cada total del RESUMEN se calcula aquí desde
	// su campo homónimo del CSAD, y las celdas del PDF solo lo renderizan.
	// Los contadores de despegues/aterrizajes vienen como `INTEGER` nullable de
	// la BD, por eso pasan por `Number(...)` en vez de sumar directo.
	assessmentDays.forEach((CSAD) => {
		sumTakeoffDay += CSAD.takeoff_day || 0;
		sumTakeoffNight += CSAD.takeoff_night || 0;
		sumTakeOff += CSAD.takeoff || 0;
		sumLandingDay += CSAD.landing_day || 0;
		sumLandingNight += CSAD.landing_night || 0;
		sumLanding += CSAD.landing || 0;
		sumLandingPrecision += CSAD.landing_precision || 0;
		sumLandingNonPrecision += CSAD.landing_non_precision || 0;
		sumLandingGps += CSAD.landing_gps || 0;
		sumLandingCircuit += CSAD.landing_circuit || 0;
		sumLandingVisual += CSAD.landing_visual || 0;
		sumTrainingTime += Number(CSAD.training_time) || 0;
		sumCheckTime += Number(CSAD.check_time) || 0;
		sumIfrTime += Number(CSAD.ifr_time) || 0;
		sumVfrTime += Number(CSAD.vfr_time) || 0;
	});

	const landingTypeSums: { label: string; value: number }[] = [
		{ label: 'Precisión', value: sumLandingPrecision },
		{ label: 'No precisión', value: sumLandingNonPrecision },
		{ label: 'GPS', value: sumLandingGps },
		{ label: 'Circuito', value: sumLandingCircuit },
		{ label: 'Visual', value: sumLandingVisual },
	];

	const dateFormat = 'DD-MM-YYYY';
	const courseDate = CSA?.course_student?.date
		? moment(CSA.course_student.date).format(dateFormat)
		: '';
	const usercode = CSA?.course_student?.instructor_code ?? '';
	const subjectDaysById: Record<number, number> = {};
	(assessment.daysSubjectList ?? []).forEach((sub) =>
		(sub.subject_days ?? []).forEach((sd) => {
			if (sd.id != null && sd.day) {
				subjectDaysById[Number(sd.id)] = Number(sd.day);
			}
		}),
	);
	// Un ordinal puede tener varias fechas (varias sesiones el mismo día), por
	// lo que se acumulan todas y se muestran separadas por " / ".
	const scheduleDayDates: Record<number, string[]> = {};
	const scheduleDayInstructor: Record<number, string> = {};
	(schedules ?? []).forEach((s) => {
		const dayNum =
			s.subject_day?.day ??
			subjectDaysById[Number(s.subject_days_id)];
		if (!dayNum) return;
		if (!scheduleDayDates[dayNum]) scheduleDayDates[dayNum] = [];
		if (s.date && !scheduleDayDates[dayNum].includes(s.date)) {
			scheduleDayDates[dayNum].push(s.date);
		}
		const inst = s.instructor?.user;
		if (inst && !scheduleDayInstructor[dayNum]) {
			scheduleDayInstructor[dayNum] =
				`${inst.name} ${inst.last_name}`;
		}
	});
	const getDayDate = (dayItemId: number) => {
		const dayNum = dayItemId + 1;
		const scheduleDates = scheduleDayDates[dayNum];
		if (scheduleDates?.length) {
			return scheduleDates
				.map((d) => moment(d).format(dateFormat))
				.join(' / ');
		}
		// Modo legacy: cada ordinal es un día de calendario, así que estimar contando
		// días hábiles desde la fecha base es una aproximación razonable.
		if (!usesSessions(programCourse)) {
			return getEvaluationDate(CSA?.date, dayItemId).format(dateFormat);
		}
		// Modo sesiones: el ordinal NO es un día de calendario, así que estimar un
		// offset daría una fecha inventada. Se usa la última fecha realmente agendada
		// y, si no hay ninguna, se deja la celda vacía en vez de mentir.
		return lastScheduleDate ? moment(lastScheduleDate).format(dateFormat) : '';
	};
	const getInstructorInitials = (dayItemId: number) => {
		const name = scheduleDayInstructor[dayItemId + 1];
		if (!name) return '';
		return name
			.trim()
			.split(/\s+/)
			.map((w) => w.charAt(0).toUpperCase())
			.join('');
	};
	const lastScheduleDate = (schedules ?? [])
		.map((s) => s.date)
		.filter(Boolean)
		.sort()
		.pop();
	return (
		<Document>
			<Page size="LETTER" style={styles.page}>
				<View style={styles.outerBox}>
					{/* Header */}
					<View style={styles.headerRow}>
						<Image style={styles.logo} src={logoBase64} />
						<View style={styles.headerTextBlock}>
							<Text style={styles.headerText}>
								Registro Progresivo de Entrenamiento en FFS Nivel C
							</Text>
							<Text style={styles.headerText}>
								{CSA?.course?.name}{' '}
								{/* {CSA?.course?.course_level.name} */}
							</Text>
						</View>
					</View>

					{/* Info table */}
					<View style={styles.table}>
						<View style={styles.row} wrap={false}>
							<Text
								style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}
							>
								Nombre del Piloto:{'\n'}
								{CSA?.student?.user?.name}{' '}
								{CSA?.student?.user?.last_name}
							</Text>
							<Text
								style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}
							>
								Documento de Identificacion:{'\n'}
								{CSA?.student?.user?.user_doc_type?.symbol}-
								{CSA?.student?.user?.doc_number}
							</Text>
							<Text
								style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}
							>
								Fecha del Curso:{'\n'}
								{courseDate}
							</Text>
						</View>
						<View style={styles.row} wrap={false}>
							<Text style={[styles.cell, { flex: 1 }]}>
								<Text style={styles.cellBold}>Cliente:</Text>{' '}
								{CSA?.course_student?.client}
								{'\n'}
							</Text>
							<Text style={[styles.cell, { flex: 1 }]}>
								<Text style={styles.cellBold}>Jerarquia:</Text> {'✔ '}
								{
									jerarquia[
										CSA?.course_student?.type_trip
											? CSA.course_student.type_trip
											: 0
									]
								}
							</Text>
							<Text style={[styles.cell, { flex: 1 }]}>
								<Text style={styles.cellBold}>Regulacion:</Text>{' '}
								{'✔ '}
								{
									regulation[
										CSA?.course_student?.regulation
											? CSA.course_student.regulation
											: 0
									]
								}
							</Text>
						</View>
						<View style={styles.row} wrap={false}>
							<Text style={[styles.cell, { flex: 1 }]}>
								<Text style={styles.cellBold}>
									País del participante:
								</Text>
								{'\n'}
								{CSA?.student?.user?.country_name}
							</Text>
							<Text style={[styles.cell, { flex: 1 }]}>
								<Text style={styles.cellBold}>Tipo de Licencia:</Text>{' '}
								{'✔ '}
								{
									license[
										CSA?.course_student?.license
											? CSA.course_student.license
											: 0
									]
								}
							</Text>
							<Text style={[styles.cell, { flex: 1 }]}>
								<Text style={styles.cellBold}>Codigo:</Text>
								{'\n'}
								{usercode}
							</Text>
							<Text style={[styles.cell, { flex: 1 }]}>
								<Text style={styles.cellBold}>Certificado:</Text>
								{'\n'}
								CEA 360ATC
							</Text>

							<Text style={[styles.cell, { flex: 1 }]}>
								<Text style={styles.cellBold}>
									Fecha de evaluación:
								</Text>{' '}
								{lastScheduleDate
									? moment(lastScheduleDate).format(dateFormat)
									: courseDate}
							</Text>
						</View>
						<View style={styles.row} wrap={false}>
							<Text style={[styles.cell, { flex: 1 }]}>
								<Text style={styles.cellBold}>Modelo de avión:</Text>
								{'\n'}
								{CSA?.course?.plane_model}
							</Text>
							<Text style={[styles.cell, { flex: 2 }]}>
								<Text style={styles.cellBold}>
									Base de operaciones piloto:
								</Text>
								{'\n'}
								{firstAirport}
							</Text>

							<Text style={[styles.cell, { flex: 1 }]}>
								<Text style={styles.cellBold}>Tipo de curso:</Text>
								{'\n'}
								{CSA?.course?.name}
							</Text>
						</View>
					</View>

					{days.length > 0 &&
						dayChunks.map((chunkDays, chunkIndex) => (
							<View key={`days-chunk-${chunkIndex}`} break={chunkIndex > 0}>
								{/* Evaluación Tipo */}
								<View style={styles.table}>
									<View style={styles.row} wrap={false}>
										<Text
											style={[
												styles.cell,
												styles.cellHeader,
												{ flex: 2 },
											]}
										>
											{ordinalNoun(programCourse)}
										</Text>
										{chunkDays.map((dayItem, index) => (
											<Text
												key={`type-h-${index}`}
												style={[
													styles.cell,
													styles.cellHeader,
													{ flex: 1, textAlign: 'center' },
												]}
											>
												{dayItem.id + 1}
											</Text>
										))}
									</View>
									<View style={styles.row} wrap={false}>
										<Text
											style={[
												styles.cell,
												{ flex: 2, fontWeight: 'bold' },
											]}
										>
											Evaluación Tipo
										</Text>
										{chunkDays.map((dayItem, index) => {
											const dayType = findDay(dayItem.id + 1);
											return (
												<Text
													key={`type-v-${index}`}
													style={[
														styles.cell,
														{ flex: 1, textAlign: 'center' },
													]}
												>
													{dayType?.type && typeLabelMap[dayType.type]
														? typeLabelMap[dayType.type]
														: 'Sin tipo'}
												</Text>
											);
										})}
									</View>
									<View style={styles.row} wrap={false}>
										<Text
											style={[
												styles.cell,
												{ flex: 2, fontWeight: 'bold' },
											]}
										>
											Evaluación en el FFS / Proficiencia:
										</Text>
										<Text style={[styles.cell, { flex: 4 }]}>
											(1) Insatisfactorio. (2) Por Debajo de los
											Estándares. (3) Satisfactorio. (4) Excelente
										</Text>
									</View>
								</View>

								{/* Periodo de Entrenamiento */}
								<View style={styles.table}>
									<View style={styles.row}>
										<Text
											style={[
												styles.cell,
												{ flex: 2, fontWeight: 'bold' },
											]}
										>
											Periodo de Entrenamiento
										</Text>
										<Text style={[styles.cell, { flex: 4 }]}>
											<Text style={styles.cellBold}>Fecha de la sesión:</Text>{' '}
											{chunkDays.map((dayItem, index) => (
												<Text key={index}>
													{getDayDate(dayItem.id)}
													{index < chunkDays.length - 1 ? ' / ' : ''}
												</Text>
											))}
										</Text>
									</View>
								</View>

								{/* Periodo de formación */}
								<View style={styles.table}>
									<View style={styles.row} fixed>
										<Text
											style={[
												styles.cell,
												styles.cellGreen,
												{ flex: 2, fontSize: 7 },
											]}
										>
											{ordinalNoun(programCourse)}
										</Text>
										{chunkDays.map((dayItem, index) => (
											<Text
												key={`pf-h-${index}`}
												style={[
													styles.cell,
													styles.cellGreen,
													{ flex: 1, textAlign: 'center' },
												]}
											>
												{dayItem.id + 1}
											</Text>
										))}
									</View>
									<View style={styles.row} wrap={false}>
										<Text
											style={[
												styles.cell,
												{ flex: 2, fontWeight: 'bold' },
											]}
										>
											Fecha:
										</Text>
										{chunkDays.map((dayItem, index) => (
											<Text
												key={`pf-f-${index}`}
												style={[
													styles.cell,
													{ flex: 1, textAlign: 'center' },
												]}
											>
												{getDayDate(dayItem.id)}
											</Text>
										))}
									</View>
									<View style={styles.row} wrap={false}>
										<Text
											style={[
												styles.cell,
												{ flex: 2, fontWeight: 'bold' },
											]}
										>
											Iniciales de instructor
										</Text>
										{chunkDays.map((dayItem, index) => (
											<Text
												key={`pf-i-${index}`}
												style={[
													styles.cell,
													{ flex: 1, textAlign: 'center' },
												]}
											>
												{getInstructorInitials(dayItem.id)}
											</Text>
										))}
									</View>

									{assessment.daysSubjectList?.map((sub, index) => (
										<View key={`subject-${index}`}>
											<View style={styles.row}>
												<Text
													style={[
														styles.cell,
														styles.cellGreen,
														{ flex: 2 },
													]}
												>
													{sub.name}
												</Text>
												{chunkDays.map((dayItem, dIndex) => (
													<Text
														key={`s-${index}-h-${dIndex}`}
														style={[
															styles.cell,
															styles.cellGreen,
															{ flex: 1, textAlign: 'center' },
														]}
													>
														{dayItem.id + 1}
													</Text>
												))}
											</View>
											{sub.subject_lessons?.map((SL, slIndex) => (
												<View
													key={`SL-${index}-${slIndex}`}
													style={styles.row}
													wrap={false}
												>
													<Text
														style={[
															styles.cell,
															{ flex: 2, fontWeight: 'bold' },
														]}
													>
														{SL.name}
													</Text>
													{chunkDays.map((dayItem, dIndex) => {
														const dayActive =
															SL.subject_lesson_days?.find(
																(SLD) => SLD.day === dayItem.id + 1,
															);
														const CSALD =
															dayActive?.course_student_assessment_lesson_days;
														const tryCount =
															CSALD && CSALD.length > 0
																? CSALD[0]
																: null;
														const score = tryCount?.score ?? '';
														const score2 =
															tryCount?.score_2 && tryCount.score <= 2
																? ` / ${tryCount.score_2}`
																: '';
														const score3 =
															tryCount?.score_3 &&
															tryCount.score_2 &&
															tryCount.score_2 <= 2
																? ` / ${tryCount.score_3}`
																: '';
														return (
															<Text
																key={`s-${index}-${dIndex}`}
																style={[
																	styles.cell,
																	{
																		flex: 1,
																		textAlign: 'center',
																	},
																	...(dayActive
																		? [styles.cellGray]
																		: []),
																]}
															>
																{score}
																{score2}
																{score3}
															</Text>
														);
													})}
												</View>
											))}
										</View>
									))}
								</View>

								{/* Resumen de Evaluación/Proficiencia por día */}
								<View style={styles.table}>
									<View style={styles.row}>
										<Text
											style={[
												styles.cell,
												styles.cellHeader,
												{ flex: 2 },
											]}
										>
											Resumen de Evaluación/Proficiencia por día
										</Text>
										{chunkDays.map((dayItem, index) => {
											const dayAverage = findDay(
												dayItem.id + 1,
											)?.score_average;
											return (
												<Text
													key={`avg-${index}`}
													style={[
														styles.cell,
														{ flex: 1, textAlign: 'center' },
													]}
												>
													{dayAverage != null ? dayAverage : ''}
												</Text>
											);
									})}
								</View>
							</View>
						</View>
					))}
					{/* Resumen de despegues y aterrizajes */}
					<View style={styles.table} break>
						<View style={styles.row} wrap={false}>
							<Text
								style={[
									styles.cell,
									styles.cellPeach,
									{ flex: 6, textAlign: 'center' },
								]}
							>
								DESPEGUES
							</Text>
						</View>
						<View style={styles.row} wrap={false}>
							<Text
								style={[styles.cell, styles.cellBold, { flex: 2 }]}
							>
								Diurnos
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{sumTakeoffDay}
							</Text>
							<Text
								style={[styles.cell, styles.cellBold, { flex: 2 }]}
							>
								Nocturnos
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{sumTakeoffNight}
							</Text>
							<Text
								style={[styles.cell, styles.cellBold, { flex: 2 }]}
							>
								Total
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{sumTakeOff}
							</Text>
						</View>
						<View style={styles.row} wrap={false}>
							<Text
								style={[
									styles.cell,
									styles.cellPeach,
									{ flex: 6, textAlign: 'center' },
								]}
							>
								ATERRIZAJES
							</Text>
						</View>
						<View style={styles.row} wrap={false}>
							<Text
								style={[styles.cell, styles.cellBold, { flex: 2 }]}
							>
								Diurnos
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{sumLandingDay}
							</Text>
							<Text
								style={[styles.cell, styles.cellBold, { flex: 2 }]}
							>
								Nocturnos
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{sumLandingNight}
							</Text>
							<Text
								style={[styles.cell, styles.cellBold, { flex: 2 }]}
							>
								Total
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{sumLanding}
							</Text>
						</View>
						<View style={styles.row} wrap={false}>
							<Text
								style={[
									styles.cell,
									styles.cellPeach,
									{ flex: 6, textAlign: 'center' },
								]}
							>
								ATERRIZAJES POR TIPO
							</Text>
						</View>
						<View style={styles.row} wrap={false}>
							{landingTypeSums.map((item, index) => (
								<Fragment key={`landing-type-${index}`}>
									<Text
										style={[
											styles.cell,
											styles.cellBold,
											{ flex: 2 },
										]}
									>
										{item.label}
									</Text>
									<Text
										style={[
											styles.cell,
											{ flex: 1, textAlign: 'center' },
										]}
									>
										{item.value}
									</Text>
								</Fragment>
							))}
						</View>
						<View style={styles.row} wrap={false}>
							<Text
								style={[
									styles.cell,
									{ flex: 2, textAlign: 'center' },
								]}
							>
								HORAS IFR
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{formatHours(sumIfrTime)}
							</Text>
							<Text style={[styles.cell, { flex: 2 }]}>
								HORAS VFR
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{formatHours(sumVfrTime)}
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 2, textAlign: 'center' },
								]}
							>
								HORAS DE{'\n'}ENTRENAMIENTO
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{formatHours(sumTrainingTime)}
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 2, textAlign: 'center' },
								]}
							>
								HORAS DE CHEQUEO
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{formatHours(sumCheckTime)}
							</Text>

							<Text
								style={[
									styles.cell,
									styles.cellPeach,
									{ flex: 2, textAlign: 'center' },
								]}
							>
								HORAS TOTALES EN FFS
							</Text>
							<Text
								style={[
									styles.cell,
									styles.cellPeach,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{formatHours(sumTrainingTime + sumCheckTime)}
							</Text>
						</View>
					</View>

					{days.length > 0 && (
						<>
							{/* Detalle de evaluación por día */}
							<View style={styles.table}>
								<View style={styles.row}>
									<Text
										style={[
											styles.cell,
											styles.cellHeader,
											{ flex: 6, textAlign: 'center' },
										]}
									>
										DETALLE DE EVALUACIÓN POR DÍA
									</Text>
								</View>
								<View style={styles.row} fixed>
									<Text
										style={[
											styles.cell,
											styles.cellHeader,
											{ flex: 1, textAlign: 'center' },
										]}
									>
										{ordinalNoun(programCourse)}
									</Text>
									<Text
										style={[
											styles.cell,
											styles.cellHeader,
											{ flex: 2, textAlign: 'center' },
										]}
									>
										Tipo
									</Text>
									<Text
										style={[
											styles.cell,
											styles.cellHeader,
											{ flex: 2, textAlign: 'center' },
										]}
									>
										Despegues
									</Text>
									<Text
										style={[
											styles.cell,
											styles.cellHeader,
											{ flex: 2, textAlign: 'center' },
										]}
									>
										Aterrizajes
									</Text>
									<Text
										style={[
											styles.cell,
											styles.cellHeader,
											{ flex: 1, textAlign: 'center' },
										]}
									>
										Promedio
									</Text>
									<Text
										style={[
											styles.cell,
											styles.cellHeader,
											{ flex: 3, textAlign: 'center' },
										]}
									>
										Observaciones
									</Text>
								</View>
								{days.map((dayItem, index) => {
									const dayCSAD = findDay(dayItem.id + 1);
									return (
										<View
											key={`daydetail-${index}`}
											style={styles.row}
											wrap={false}
										>
											<Text
												style={[
													styles.cell,
													{ flex: 1, textAlign: 'center' },
												]}
											>
												{dayItem.id + 1}
											</Text>
											<Text
												style={[
													styles.cell,
													{ flex: 2, textAlign: 'center' },
												]}
											>
												{dayCSAD?.type
													? (typeLabelMap[dayCSAD.type] ??
														dayCSAD.type)
													: ''}
											</Text>
											<Text
												style={[
													styles.cell,
													{ flex: 2, textAlign: 'center' },
												]}
											>
												{despeguesText(dayCSAD)}
											</Text>
											<Text
												style={[
													styles.cell,
													{ flex: 2, textAlign: 'center' },
												]}
											>
												{aterrizajesText(dayCSAD)}
											</Text>
											<Text
												style={[
													styles.cell,
													{ flex: 1, textAlign: 'center' },
												]}
											>
												{dayCSAD?.score_average != null
													? dayCSAD.score_average
													: ''}
											</Text>
											<Text style={[styles.cell, { flex: 3 }]}>
												{dayCSAD?.comments ? dayCSAD.comments : ''}
											</Text>
										</View>
									);
								})}
							</View>
						</>
					)}
					{/* Proficiencia del curso */}
					{courseScoreAverage != null && (
						<View style={styles.table}>
							<View style={styles.row}>
								<Text style={[styles.cell, { flex: 6 }]}>
									<Text style={styles.cellBold}>
										Proficiencia del curso (entrenamiento o chequeo o
										experiencia reciente):
									</Text>{' '}
									{courseScoreAverage} (
									{proficiencyLabel(courseScoreAverage)})
								</Text>
							</View>
						</View>
					)}

					{/* Avales */}
					<View style={styles.table}>
						<View style={styles.row} wrap={false}>
							<Text
								style={[styles.cell, styles.cellHeader, { flex: 1 }]}
							>
								Avales
							</Text>
							<Text
								style={[styles.cell, styles.cellHeader, { flex: 1 }]}
							>
								Firma: Director de 360ATC
							</Text>
						</View>
						<View style={styles.row} wrap={false}>
							<Text style={[styles.cell, { flex: 1 }]}>
								Recomendado para: Tipo evaluación de habilitación.{' '}
								{CSA?.approve ? '✔' : '✘'}
							</Text>
							<View
								style={[
									styles.cell,
									{
										flex: 1,
										alignItems: 'center',
										justifyContent: 'center',
									},
								]}
							>
								{firmaBase64 && (
									<Image style={styles.sigImage} src={firmaBase64} />
								)}
							</View>
						</View>
					</View>

					{days.length > 0 && (
						<>
							{/* Firmas por día */}
							<View style={styles.table}>
								<View style={styles.row} fixed>
									<Text
										style={[
											styles.cell,
											styles.cellHeader,
											{ flex: 1 },
										]}
									>
										{ordinalNoun(programCourse)}
									</Text>
									<Text
										style={[
											styles.cell,
											styles.cellHeader,
											{ flex: 1 },
										]}
									>
										Firma del alumno
									</Text>
									<Text
										style={[
											styles.cell,
											styles.cellHeader,
											{ flex: 1 },
										]}
									>
										Firma del instructor
									</Text>
									<Text
										style={[
											styles.cell,
											styles.cellHeader,
											{ flex: 1 },
										]}
									>
										Firma Chequeador / Inspector INAC
									</Text>
								</View>
								{evaluatedDays.map((csad, index) => {
									const dayNum = Number(csad.day);
									const daySigs = signatures?.[dayNum] ?? {};
									return (
										<View
											key={`firmas-${index}`}
											style={styles.row}
											wrap={false}
										>
											<Text
												style={[
													styles.cell,
													{ flex: 1, textAlign: 'center' },
												]}
											>
												{dayNum}
											</Text>
											<View
												style={[
													styles.cell,
													{
														flex: 1,
														alignItems: 'center',
														justifyContent: 'center',
													},
												]}
											>
												{daySigs.student ? (
													<Image
														style={styles.sigImage}
														src={daySigs.student}
													/>
												) : (
													<Text style={styles.noSignature}>—</Text>
												)}
											</View>
											<View
												style={[
													styles.cell,
													{
														flex: 1,
														alignItems: 'center',
														justifyContent: 'center',
													},
												]}
											>
												{daySigs.instructor ? (
													<Image
														style={styles.sigImage}
														src={daySigs.instructor}
													/>
												) : (
													<Text style={styles.noSignature}>—</Text>
												)}
											</View>
											<View
												style={[
													styles.cell,
													{
														flex: 1,
														alignItems: 'center',
														justifyContent: 'center',
													},
												]}
											>
											{daySigs.fcaa ? (
												<Image
													style={styles.sigImage}
													src={daySigs.fcaa}
												/>
											) : dayNum === lastAssessedDayNum ? (
												<Text style={styles.noSignature}>—</Text>
											) : (
												<Text style={styles.noSignature}>
													No aplica
												</Text>
											)}
											</View>
										</View>
									);
								})}
							</View>
						</>
					)}
					{/* Legal */}
					<View style={styles.legal}>
						<Text>
							Por medio del presente, autorizo a CEA 360 ATC, de forma
							expresa el registro en audio y video de la sesión de
							entrenamiento con el único fin de recibir instrucción,
							evaluación técnica y retroalimentación operativa. Esta
							captura de imagen y voz se gestionará bajo estricta
							confidencialidad, garantizando que el material no será
							difundido públicamente ni utilizado con fines
							comerciales. Asimismo, se reconoce el derecho a revocar
							este consentimiento y a solicitar el borrado seguro del
							contenido audiovisual según la normativa vigente de
							protección de datos.
						</Text>
					</View>
				</View>
			</Page>
		</Document>
	);
};

export default CSAssessmentPDFDocument;
