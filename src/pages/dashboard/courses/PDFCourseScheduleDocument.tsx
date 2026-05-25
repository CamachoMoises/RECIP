import {
	Document,
	Page,
	View,
	Text,
	StyleSheet,
	Image,
} from '@react-pdf/renderer';
import moment from 'moment';
import { CourseState, user } from '../../../types/utilities'; // ajusta el path

const styles = StyleSheet.create({
	page: {
		padding: 10,
		fontSize: 8,
		backgroundColor: 'white',
	},
	// --- Contenedor externo ---
	outerBox: {
		borderWidth: 2,
		borderColor: '#263238',
		backgroundColor: '#9e9e9e',
		padding: 4,
		gap: 4,
	},
	// --- Header ---
	headerRow: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		marginBottom: 4,
	},
	logo: {
		width: 80,
	},
	headerTextBlock: {
		flexDirection: 'column',
		alignItems: 'center',
	},
	headerText: {
		fontSize: 9,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	// --- Info del estudiante ---
	infoBox: {
		backgroundColor: 'white',
		borderWidth: 2,
		borderColor: '#263238',
		padding: 4,
		marginBottom: 4,
	},
	infoRow: {
		flexDirection: 'row',
	},
	infoCell: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#2e7d32',
		padding: 3,
		fontSize: 7,
	},
	// --- Título cronograma ---
	scheduleTitle: {
		backgroundColor: 'white',
		borderWidth: 1,
		borderColor: '#263238',
		padding: 3,
		marginBottom: 3,
	},
	scheduleTitleText: {
		fontSize: 9,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	// --- Tabla ---
	table: {
		width: '100%',
		borderWidth: 1,
		borderColor: '#9e9e9e',
	},
	tableHeaderRow: {
		flexDirection: 'row',
		backgroundColor: '#f3f4f6',
	},
	tableRow: {
		flexDirection: 'row',
	},
	cellId: {
		width: 20,
		borderWidth: 1,
		borderColor: '#374151',
		padding: 2,
		fontSize: 7,
		textAlign: 'center',
		backgroundColor: 'white',
	},
	cellModule: {
		width: 120,
		borderWidth: 1,
		borderColor: '#374151',
		padding: 2,
		fontSize: 7,
		textAlign: 'center',
		backgroundColor: 'white',
	},
	cellDate: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#374151',
		padding: 2,
		fontSize: 7,
		textAlign: 'center',
		backgroundColor: 'white',
	},
	cellHours: {
		width: 60,
		borderWidth: 1,
		borderColor: '#374151',
		padding: 2,
		fontSize: 7,
		textAlign: 'center',
		backgroundColor: 'white',
	},
	cellInstructor: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#374151',
		padding: 2,
		fontSize: 7,
		textAlign: 'center',
		backgroundColor: 'white',
	},
	cellEmpty: {
		backgroundColor: '#4b5563',
		borderWidth: 1,
		borderColor: '#374151',
		padding: 2,
		height: 14,
	},
	// --- Tabla resultados ---
	resultsTable: {
		marginTop: 4,
		borderWidth: 1,
		borderColor: '#9e9e9e',
	},
	resultsRow: {
		flexDirection: 'row',
		backgroundColor: '#f3f4f6',
	},
	resultsCell: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#1f2937',
		padding: 3,
		fontSize: 7,
	},
	resultsCellFull: {
		borderWidth: 1,
		borderColor: '#1f2937',
		padding: 3,
		fontSize: 7,
	},
});

// ─── Subcomponente tabla de horario ───────────────────────────────────────────
const ScheduleTable = ({
	data,
	courseHours,
}: {
	data: any[];
	courseHours?: number;
}) => {
	const MIN_ROWS = 18;
	const emptyRows =
		data.length < MIN_ROWS
			? Array.from({ length: MIN_ROWS - data.length })
			: [];

	const startsWithBienvenida = data[0]?.subject.name
		.toLowerCase()
		.includes('bienvenida');

	return (
		<View style={styles.table}>
			{/* Encabezado */}
			<View style={styles.tableHeaderRow}>
				<Text
					style={[
						styles.cellId,
						{ backgroundColor: '#f3f4f6', fontWeight: 'bold' },
					]}
				>
					Id
				</Text>
				<Text
					style={[
						styles.cellModule,
						{ backgroundColor: '#f3f4f6', fontWeight: 'bold' },
					]}
				>
					Módulo
				</Text>
				<Text
					style={[
						styles.cellDate,
						{ backgroundColor: '#f3f4f6', fontWeight: 'bold' },
					]}
				>
					Fecha / Hora Inicio
				</Text>
				<Text
					style={[
						styles.cellHours,
						{ backgroundColor: '#f3f4f6', fontWeight: 'bold' },
					]}
				>
					Horas Totales ({courseHours ?? 48})
				</Text>
				<Text
					style={[
						styles.cellInstructor,
						{ backgroundColor: '#f3f4f6', fontWeight: 'bold' },
					]}
				>
					Instructor
				</Text>
			</View>

			{/* Filas con datos */}
			{data.map((row, index) => {
				const id = startsWithBienvenida
					? index === 0
						? null
						: index
					: index + 1;
				return (
					<View key={index} style={styles.tableRow}>
						<Text style={styles.cellId}>{id ?? ' '}</Text>
						<Text style={styles.cellModule}>{row.subject.name}</Text>
						<Text style={styles.cellDate}>
							{moment(row.date).format('DD-MM-YYYY')} /{' '}
							{moment(row.hour, 'HH:mm:ss').format('HH:mm')}
						</Text>
						<Text style={styles.cellHours}>{row.classTime}</Text>
						<Text style={styles.cellInstructor}>
							{row.instructor.user.name}{' '}
							{row.instructor.user.last_name}
						</Text>
					</View>
				);
			})}

			{/* Filas vacías */}
			{emptyRows.map((_, i) => (
				<View key={`empty-${i}`} style={styles.tableRow}>
					<View style={[styles.cellId, styles.cellEmpty]} />
					<View style={[styles.cellModule, styles.cellEmpty]} />
					<View style={[styles.cellDate, styles.cellEmpty]} />
					<View style={[styles.cellHours, styles.cellEmpty]} />
					<View style={[styles.cellInstructor, styles.cellEmpty]} />
				</View>
			))}
		</View>
	);
};

// ─── Componente principal ─────────────────────────────────────────────────────
const PDFCourseScheduleDocument = ({
	course,
	studentSelect,
	logoBase64,
}: {
	course: CourseState;
	studentSelect: user | null | undefined;
	logoBase64: string;
}) => {
	moment.locale('es');

	const data = course.scheduleList;
	const type_trip = ['', 'PIC', 'SIC', 'SFI', 'SFE'];
	const license = ['', 'ATP', 'Commercial', 'Privado', 'FANB'];
	const regulation = ['', 'INAC', 'No-INAC'];
	const lastInstructor =
		data.length > 0
			? data[data.length - 1]?.instructor?.user
			: undefined;

	return (
		<Document>
			<Page size="LETTER" style={styles.page}>
				<View style={styles.outerBox}>
					{/* Header */}
					<View style={styles.headerRow}>
						<Image style={styles.logo} src={logoBase64} />
						<View style={styles.headerTextBlock}>
							<Text style={styles.headerText}>
								Curso {course.courseSelected?.course_level.name}{' '}
								{course.courseSelected?.name}
							</Text>
							<Text style={styles.headerText}>
								{course.courseSelected?.description}{' '}
								{course.courseSelected?.course_type.name}
							</Text>
						</View>
					</View>

					{/* Info del estudiante */}
					<View style={styles.infoBox}>
						<View style={styles.infoRow}>
							<Text style={styles.infoCell}>
								<Text style={{ fontWeight: 'bold' }}>
									Nombre del Piloto:{' '}
								</Text>
								{studentSelect?.name} {studentSelect?.last_name}
							</Text>
							<Text style={styles.infoCell}>
								<Text style={{ fontWeight: 'bold' }}>
									Jerarquia:{' '}
								</Text>
								{type_trip[course.courseStudent?.type_trip ?? 0]}
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Text style={styles.infoCell}>
								<Text style={{ fontWeight: 'bold' }}>
									Identificacion:{' '}
								</Text>
								{studentSelect?.user_doc_type?.symbol}-
								{studentSelect?.doc_number}
							</Text>
							<Text style={styles.infoCell}>
								<Text style={{ fontWeight: 'bold' }}>Licencia: </Text>
								{license[course.courseStudent?.license ?? 0]}
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Text style={styles.infoCell}>
								<Text style={{ fontWeight: 'bold' }}>
									Fecha de inicio:{' '}
								</Text>
								{moment(course.courseStudent?.date).format(
									'DD-MM-YYYY',
								)}
							</Text>
							<Text style={styles.infoCell}>
								<Text style={{ fontWeight: 'bold' }}>
									Normativa:{' '}
								</Text>
								{regulation[course.courseStudent?.regulation ?? 0]}
							</Text>
						</View>
						<View style={styles.infoRow}>
							<Text style={styles.infoCell}>
								<Text style={{ fontWeight: 'bold' }}>Correo: </Text>
								{studentSelect?.email}
							</Text>
							<Text style={styles.infoCell}>
								<Text style={{ fontWeight: 'bold' }}>Telefono: </Text>
								{studentSelect?.phone}
								{'  '}
								<Text style={{ fontWeight: 'bold' }}>Pais: </Text>
								{studentSelect?.country_name}
							</Text>
						</View>
					</View>

					{/* Título cronograma */}
					<View style={styles.scheduleTitle}>
						<Text style={styles.scheduleTitleText}>
							Cronograma de la{' '}
							{course.courseSelected?.course_type.name}
						</Text>
					</View>

					{/* Tabla horario */}
					<ScheduleTable
						data={data}
						courseHours={course.courseSelected?.hours}
					/>

					{/* Tabla resultados (si existe score) */}
					{course.courseStudent?.score && (
						<View style={styles.resultsTable}>
							<View style={styles.resultsRow}>
								<Text style={styles.resultsCell}>
									Resultados del examen:{' '}
									{course.courseStudent.approve &&
										course.courseStudent.score}
								</Text>
								<Text style={styles.resultsCell}>
									Corregido el: 100%
								</Text>
								<Text style={styles.resultsCell}>
									Fecha de completado:{' '}
									{moment(course.courseStudent.date)
										.add(course.courseSelected?.days ?? -1, 'days')
										.format('DD-MM-YYYY')}
								</Text>
							</View>
							<View style={styles.resultsRow}>
								<Text style={styles.resultsCell}>
									Resultados para repetir:{' '}
									{course.courseStudent.approve === false &&
										`${course.courseStudent.score} Puntos`}
								</Text>
								<Text style={styles.resultsCell}>
									Corregido el: 100%
								</Text>
								<Text style={styles.resultsCell}>
									Total de horas: {course.courseSelected?.hours}
									{'\n'}
									Total de dias: {course.courseSelected?.days}
								</Text>
							</View>
							<View style={styles.resultsRow}>
								<Text style={[styles.resultsCellFull, { flex: 1 }]}>
									Nombre del instructor:{' '}
									{lastInstructor
										? `${lastInstructor.name} ${lastInstructor.last_name}`
										: 'Sin instructor'}
								</Text>
							</View>
							<View style={styles.resultsRow}>
								<Text style={[styles.resultsCellFull, { flex: 1 }]}>
									El resultado de las pruebas inferiores al 85%:
									Reentrenamiento en módulos donde el conocimiento y
									compresión del estudiante es deficiente.
								</Text>
							</View>
						</View>
					)}
				</View>
			</Page>
		</Document>
	);
};

export default PDFCourseScheduleDocument;
