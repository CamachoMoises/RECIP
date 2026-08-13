import {
	Document,
	Image,
	Page,
	StyleSheet,
	Text,
	View,
} from '@react-pdf/renderer';
import moment from 'moment';
import {
	assessmentState,
	courseStudentAssessmentDay,
	schedule,
} from '../../../types/utilities';

const styles = StyleSheet.create({
	page: {
		padding: 12,
		fontSize: 8,
		backgroundColor: 'white',
		fontFamily: 'Helvetica',
	},
	outerBox: {
		borderWidth: 2,
		borderColor: '#263238',
		backgroundColor: '#e0e0e0',
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
		backgroundColor: '#9e9e9e',
	},
	cellHeader: {
		backgroundColor: '#e0e0e0',
		fontWeight: 'bold',
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
	day,
	signatures,
	schedules,
}: {
	assessment: assessmentState;
	logoBase64: string;
	day?: number;
	signatures?: Record<
		number,
		{ student?: string; instructor?: string; fcaa?: string }
	>;
	schedules?: schedule[];
}) => {
	moment.locale('es');
	const CSA = assessment.courseStudentAssessmentSelected;
	const assessmentDays = CSA?.CourseStudentAssessmentDays ?? [];
	const findDay = (dayNum: number) =>
		assessmentDays.find((CSAD) => Number(CSAD.day) === dayNum);
	console.log(
		'[CSAssessmentPDF] CourseStudentAssessmentDays:',
		assessmentDays,
	);
	const license = ['', 'ATP', 'Commercial', 'Privado', 'FANB'];
	const regulation = ['', 'INAC', 'No-INAC'];
	const jerarquia = ['', 'PIC', 'SIC', 'SFI', 'SFE'];
	const courseDays = CSA?.course?.days ?? 0;
	const maxDay = day ?? courseDays;
	const loadedDayNumbers = assessmentDays
		.map((CSAD) => CSAD.day)
		.filter((d): d is number => !!d && d > 0);
	const maxLoadedDay = loadedDayNumbers.length
		? Math.max(...loadedDayNumbers)
		: 0;
	const lastDayToShow = maxLoadedDay
		? maxLoadedDay
		: maxDay > 0 && maxDay <= courseDays
			? maxDay
			: courseDays;
	const days = courseDays
		? Array.from(
				{
					length:
						lastDayToShow > 0
							? Math.min(courseDays, lastDayToShow)
							: 0,
				},
				(_, i) => ({
					id: i,
					name: `Dia ${i + 1}`,
				}),
			)
		: [];

	let sumLanding = 0;
	let sumTakeOff = 0;
	for (const key in assessmentDays) {
		const landing = assessmentDays[parseInt(key)].landing;
		const takeoff = assessmentDays[parseInt(key)].takeoff;
		sumLanding += landing ? landing : 0;
		sumTakeOff += takeoff ? takeoff : 0;
	}

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
	let sumLandingDay = 0;
	let sumLandingNight = 0;
	let sumTrainingTime = 0;
	let sumCheckTime = 0;
	assessmentDays.forEach((CSAD) => {
		sumTakeoffDay += CSAD.takeoff_day || 0;
		sumTakeoffNight += CSAD.takeoff_night || 0;
		sumLandingDay += CSAD.landing_day || 0;
		sumLandingNight += CSAD.landing_night || 0;
		sumTrainingTime += Number(CSAD.training_time) || 0;
		sumCheckTime += Number(CSAD.check_time) || 0;
	});

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
	const scheduleDayDate: Record<number, string> = {};
	const scheduleDayInstructor: Record<number, string> = {};
	(schedules ?? []).forEach((s) => {
		const dayNum =
			s.subject_day?.day ??
			subjectDaysById[Number(s.subject_days_id)];
		if (!dayNum || scheduleDayDate[dayNum]) return;
		scheduleDayDate[dayNum] = s.date;
		const inst = s.instructor?.user;
		if (inst) {
			scheduleDayInstructor[dayNum] =
				`${inst.name} ${inst.last_name}`;
		}
	});
	const getDayDate = (dayItemId: number) => {
		const dayNum = dayItemId + 1;
		const scheduleDate = scheduleDayDate[dayNum];
		return scheduleDate
			? moment(scheduleDate).format(dateFormat)
			: getEvaluationDate(CSA?.date, dayItemId).format(dateFormat);
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
								Registro De Entrenamiento De Vuelo Del Piloto
							</Text>
							<Text style={styles.headerText}>
								{CSA?.course?.name} - Curso{' '}
								{CSA?.course?.course_level.name}
							</Text>
						</View>
					</View>

					{/* Info table */}
					<View style={styles.table}>
						<View style={styles.row}>
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
						<View style={styles.row}>
							<Text style={[styles.cell, { flex: 1 }]}>
								<Text style={styles.cellBold}>Cliente: AMB</Text>
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
						<View style={styles.row}>
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
									Fecha de revisión:
								</Text>{' '}
								{lastScheduleDate
									? moment(lastScheduleDate).format(dateFormat)
									: courseDate}
							</Text>
						</View>
						<View style={styles.row}>
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

					{/* Evaluación Tipo */}
					<View style={styles.table}>
						<View style={styles.row}>
							<Text
								style={[styles.cell, styles.cellHeader, { flex: 2 }]}
							>
								Dia
							</Text>
							{days.map((dayItem, index) => (
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
						<View style={styles.row}>
							<Text
								style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}
							>
								Evaluación Tipo
							</Text>
							{days.map((dayItem, index) => {
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
						<View style={styles.row}>
							<Text
								style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}
							>
								Evaluación en el FFS / Proficiencia:
							</Text>
							<Text style={[styles.cell, { flex: 4 }]}>
								(1) Insatisfactorio. (2) Por Debajo de los Estándares.
								(3) Satisfactorio. (4) Excelente
							</Text>
						</View>
					</View>

					{/* Periodo de Entrenamiento */}
					<View style={styles.table}>
						<View style={styles.row}>
							<Text
								style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}
							>
								Periodo de Entrenamiento
							</Text>
							<Text style={[styles.cell, { flex: 4 }]}>
								<Text style={styles.cellBold}>Fecha:</Text>{' '}
								{days.map((dayItem, index) => (
									<Text key={index}>
										{getDayDate(dayItem.id)}
										{index < days.length - 1 ? ' / ' : ''}
									</Text>
								))}
							</Text>
						</View>
					</View>

					{/* Periodo de formación */}
					<View style={styles.table}>
						<View style={styles.row}>
							<Text
								style={[
									styles.cell,
									styles.cellHeader,
									{ flex: 2, fontSize: 7 },
								]}
							>
								Periodo de formación
							</Text>
							{days.map((dayItem, index) => (
								<Text
									key={`pf-h-${index}`}
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
						<View style={styles.row}>
							<Text
								style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}
							>
								Fecha:
							</Text>
							{days.map((dayItem, index) => (
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
						<View style={styles.row}>
							<Text
								style={[styles.cell, { flex: 2, fontWeight: 'bold' }]}
							>
								Iniciales de instructor
							</Text>
							{days.map((dayItem, index) => (
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
											styles.cellHeader,
											{ flex: 2 },
										]}
									>
										{sub.name}
									</Text>
									{days.map((dayItem, dIndex) => (
										<Text
											key={`s-${index}-h-${dIndex}`}
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
								{sub.subject_lessons?.map((SL, slIndex) => (
									<View
										key={`SL-${index}-${slIndex}`}
										style={styles.row}
									>
										<Text
											style={[
												styles.cell,
												{ flex: 2, fontWeight: 'bold' },
											]}
										>
											{SL.name}
										</Text>
										{days.map((dayItem, dIndex) => {
											const dayActive = SL.subject_lesson_days?.find(
												(SLD) => SLD.day === dayItem.id + 1,
											);
											const CSALD =
												dayActive?.course_student_assessment_lesson_days;
											const tryCount =
												CSALD && CSALD.length > 0 ? CSALD[0] : null;
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
														...(dayActive ? [styles.cellGray] : []),
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
								style={[styles.cell, styles.cellHeader, { flex: 2 }]}
							>
								Resumen de Evaluación/Proficiencia por día
							</Text>
							{days.map((dayItem, index) => {
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

					{/* Resumen de despegues y aterrizajes */}
					<View style={styles.table}>
						<View style={styles.row}>
							<Text
								style={[
									styles.cell,
									styles.cellHeader,
									{ flex: 6, textAlign: 'center' },
								]}
							>
								RESUMEN DE DESPEGUES Y ATERRIZAJES
							</Text>
						</View>
						<View style={styles.row}>
							<Text style={[styles.cell, { flex: 2 }]}>
								DESPEGUES DIURNOS
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{sumTakeoffDay}
							</Text>
							<Text style={[styles.cell, { flex: 2 }]}>
								DESPEGUES NOCTURNOS
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{sumTakeoffNight}
							</Text>
							<Text style={[styles.cell, { flex: 2 }]}>
								DESPEGUES
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
						<View style={styles.row}>
							<Text style={[styles.cell, { flex: 2 }]}>
								ATERRIZAJES DIURNOS
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{sumLandingDay}
							</Text>
							<Text style={[styles.cell, { flex: 2 }]}>
								ATERRIZAJES NOCTURNOS
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{sumLandingNight}
							</Text>
							<Text style={[styles.cell, { flex: 2 }]}>
								ATERRIZAJES
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
						<View style={styles.row}>
							<Text style={[styles.cell, { flex: 2 }]}>
								TIEMPO DE ENTRENAMIENTO (HORAS)
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{formatHours(sumTrainingTime)}
							</Text>
							<Text style={[styles.cell, { flex: 2 }]}>
								TIEMPO DE CHEQUEO (HORAS)
							</Text>
							<Text
								style={[
									styles.cell,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								{formatHours(sumCheckTime)}
							</Text>
							<Text style={[styles.cell, { flex: 2 }]}> </Text>
							<Text style={[styles.cell, { flex: 1 }]}> </Text>
						</View>
					</View>

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
						<View style={styles.row}>
							<Text
								style={[
									styles.cell,
									styles.cellHeader,
									{ flex: 1, textAlign: 'center' },
								]}
							>
								Dia
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
								<View key={`daydetail-${index}`} style={styles.row}>
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
											? (typeLabelMap[dayCSAD.type] ?? dayCSAD.type)
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
						<View style={styles.row}>
							<Text
								style={[styles.cell, styles.cellHeader, { flex: 1 }]}
							>
								Avales
							</Text>
							<Text
								style={[styles.cell, styles.cellHeader, { flex: 1 }]}
							>
								Firma digital
							</Text>
						</View>
						<View style={styles.row}>
							<Text style={[styles.cell, { flex: 1 }]}>
								Recomendado para: Tipo evaluación de habilitación.{' '}
								{CSA?.approve ? '✔' : '✘'}
							</Text>
							<Text style={[styles.cell, { flex: 1 }]}> </Text>
						</View>
					</View>

					{/* Firmas por día */}
					<View style={styles.table}>
						<View style={styles.row}>
							<Text
								style={[styles.cell, styles.cellHeader, { flex: 1 }]}
							>
								Dia
							</Text>
							<Text
								style={[styles.cell, styles.cellHeader, { flex: 1 }]}
							>
								Firma del alumno
							</Text>
							<Text
								style={[styles.cell, styles.cellHeader, { flex: 1 }]}
							>
								Firma del instructor
							</Text>
							<Text
								style={[styles.cell, styles.cellHeader, { flex: 1 }]}
							>
								Firma Chequeador / Ins. Inac
							</Text>
						</View>
						{[...assessmentDays]
							.sort((a, b) => Number(a.day) - Number(b.day))
							.map((csad, index) => {
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
											) : (
												<Text style={styles.noSignature}>—</Text>
											)}
										</View>
									</View>
								);
							})}
					</View>

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
