import {
	Document,
	Page,
	View,
	Text,
	StyleSheet,
	Image,
} from '@react-pdf/renderer';
import {
	courseGroupReportAttendance,
	courseGroupReportCourseStudent,
	courseGroupReportItem,
	courseGroupSignature,
} from '../../../types/utilities';

const styles = StyleSheet.create({
	page: {
		padding: 30,
		fontSize: 9,
		fontFamily: 'Helvetica',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
	},
	logo: {
		width: 140,
	},
	title: {
		fontSize: 13,
		fontWeight: 'bold',
		textAlign: 'center',
		textDecoration: 'underline',
		marginBottom: 14,
	},
	// Tabla superior: datos del curso
	infoTable: {
		width: '100%',
		borderWidth: 1,
		borderColor: '#000000',
		marginBottom: 10,
	},
	infoRow: {
		flexDirection: 'row',
	},
	infoHeaderCell: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#000000',
		backgroundColor: '#dbe5f1',
		padding: 4,
		fontSize: 8,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	infoValueCell: {
		flex: 1,
		borderWidth: 1,
		borderColor: '#000000',
		padding: 6,
		fontSize: 8,
		textAlign: 'center',
		minHeight: 20,
	},
	dayHeader: {
		fontSize: 9,
		fontWeight: 'bold',
		marginBottom: 6,
		textAlign: 'left',
	},
	// Tabla principal: asistencia
	table: {
		width: '100%',
		borderWidth: 1,
		borderColor: '#000000',
		marginBottom: 12,
	},
	tableHeader: {
		flexDirection: 'row',
	},
	tableHeaderCell: {
		fontWeight: 'bold',
		padding: 4,
		fontSize: 8,
		textAlign: 'center',
		borderWidth: 1,
		borderColor: '#000000',
		backgroundColor: '#dbe5f1',
	},
	tableRow: {
		flexDirection: 'row',
	},
	cellNum: {
		width: '6%',
		borderWidth: 1,
		borderColor: '#000000',
		padding: 4,
		fontSize: 8,
		textAlign: 'center',
		backgroundColor: '#dbe5f1',
	},
	cellName: {
		width: '32%',
		borderWidth: 1,
		borderColor: '#000000',
		padding: 4,
		fontSize: 8,
	},
	cellDoc: {
		width: '18%',
		borderWidth: 1,
		borderColor: '#000000',
		padding: 4,
		fontSize: 8,
		textAlign: 'center',
	},
	cellEmail: {
		width: '20%',
		borderWidth: 1,
		borderColor: '#000000',
		padding: 4,
		fontSize: 7.5,
		textAlign: 'center',
	},
	cellSignature: {
		width: '14%',
		borderWidth: 1,
		borderColor: '#000000',
		padding: 2,
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	cellDate: {
		width: '10%',
		borderWidth: 1,
		borderColor: '#000000',
		padding: 4,
		fontSize: 8,
		textAlign: 'center',
	},
	sigImage: {
		width: '100%',
		height: 30,
		objectFit: 'contain',
	},
	noSignature: {
		color: '#9ca3af',
		fontSize: 6,
		fontStyle: 'italic',
	},
	instructorFooter: {
		marginTop: 30,
		flexDirection: 'row',
		alignItems: 'flex-end',
		justifyContent: 'space-evenly',
	},
	instructorSigBlock: {
		alignItems: 'center',
		minWidth: 150,
	},
	instructorSigLabel: {
		fontSize: 9,
		fontWeight: 'bold',
		marginBottom: 2,
	},
	instructorLine: {
		width: 140,
		borderBottomWidth: 1,
		borderBottomColor: '#000000',
		marginTop: 16,
	},
	instructorSigImage: {
		width: 100,
		height: 28,
		objectFit: 'contain',
		marginLeft: 6,
	},
	footer: {
		position: 'absolute',
		bottom: 10,
		left: 30,
		right: 30,
		textAlign: 'center',
		fontSize: 6,
		color: '#9ca3af',
		borderTopWidth: 1,
		borderTopColor: '#e5e7eb',
		paddingTop: 4,
	},
});

const formatDate = (dateStr: string | null | undefined): string => {
	if (!dateStr) return '';
	const d = new Date(dateStr);
	return d.toLocaleDateString('es-ES', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

const addDays = (
	dateStr: string | null | undefined,
	days: number,
): string => {
	if (!dateStr) return '';
	const d = new Date(dateStr);
	d.setDate(d.getDate() + days);
	return d.toISOString().split('T')[0];
};

type Props = {
	group: courseGroupReportItem;
	students: courseGroupReportCourseStudent[];
	instructorSignatures: courseGroupSignature[];
	logoBase64: string;
};

const AttendanceListPDF = ({
	group,
	students,
	instructorSignatures,
	logoBase64,
}: Props) => {
	const course = group.course || null;
	const totalDays = course?.days || 1;
	const groupDate = group.date || students[0]?.date || null;

	const getAttendanceForDay = (
		cs: courseGroupReportCourseStudent,
		day: number,
	): courseGroupReportAttendance | undefined => {
		return (cs.attendances || []).find((a) => a.day === day);
	};

	const getStudentName = (
		cs: courseGroupReportCourseStudent,
	): string => {
		if (cs.student?.user) {
			return `${cs.student.user.name} ${cs.student.user.last_name}`.trim();
		}
		return `PC: ${cs.student?.user_id || cs.code || 'N/A'}`;
	};

	const getStudentDoc = (
		cs: courseGroupReportCourseStudent,
	): string => {
		return cs.student?.user?.doc_number
			? String(cs.student.user.doc_number)
			: '';
	};

	const getStudentEmail = (
		cs: courseGroupReportCourseStudent,
	): string => {
		return cs.student?.user?.email
			? String(cs.student.user.email)
			: '';
	};

	const getSignatureUrl = (
		att: courseGroupReportAttendance | undefined,
	): string | null => {
		return att?.attendance_signature?.signature_url || null;
	};

	const getDayInstructorSignatures = (
		dayNumber: number,
	): courseGroupSignature[] => {
		return instructorSignatures
			.filter(
				(s) =>
					s.day_number === dayNumber &&
					s.course_group_id === group.id,
			)
			.sort((a, b) => a.signature_number - b.signature_number);
	};

	const getDayDate = (day: number): string | null => {
		for (const cs of students) {
			const att = (cs.attendances || []).find((a) => a.day === day);
			if (att?.date) return att.date;
		}
		for (const cs of students) {
			const sch = (cs.schedules || []).find(
				(s) => s.subject_day?.day === day,
			);
			if (sch?.date) return sch.date;
		}
		return groupDate ? addDays(groupDate, day - 1) : null;
	};

	const days = Array.from({ length: totalDays }, (_, i) => i + 1);

	return (
		<Document>
			{days.map((day) => {
				const dayDate = getDayDate(day);
				const daySigs = getDayInstructorSignatures(day);

				return (
					<Page key={day} size="LETTER" style={styles.page}>
						<View style={styles.header}>
							{logoBase64 && (
								<Image style={styles.logo} src={logoBase64} />
							)}
						</View>

						<Text style={styles.title}>Listado de Asistencia</Text>

						{/* Tabla de información del curso, al estilo del Word */}
						<View style={styles.infoTable}>
							<View style={styles.infoRow}>
								<Text style={styles.infoHeaderCell}>
									Nombre del Curso
								</Text>
								<Text style={styles.infoHeaderCell}>
									Número del Módulo
								</Text>
								<Text style={styles.infoHeaderCell}>
									Horas Académicas
								</Text>

								<Text style={styles.infoHeaderCell}>Inicio</Text>
								<Text style={styles.infoHeaderCell}>
									Finalización
								</Text>
							</View>
							<View style={styles.infoRow}>
								<Text style={styles.infoValueCell}>
									{course?.name || ''}
								</Text>
								<Text style={styles.infoValueCell}>
									{course?.code || ''}
								</Text>
								<Text style={styles.infoValueCell}>
									{typeof course?.hours === 'number'
										? course.hours
										: ''}
								</Text>

								<Text style={styles.infoValueCell}>
									{formatDate(dayDate)}
								</Text>
								<Text style={styles.infoValueCell}>
									{formatDate(
										getDayDate(totalDays) ||
											addDays(groupDate, totalDays - 1),
									)}
								</Text>
							</View>
						</View>

						{totalDays > 1 && (
							<Text style={styles.dayHeader}>
								Día {day} - {formatDate(dayDate)}
							</Text>
						)}

						{/* Tabla principal de asistencia */}
						<View style={styles.table}>
							<View style={styles.tableHeader}>
								<Text
									style={[styles.tableHeaderCell, styles.cellNum]}
								>
									N°
								</Text>
								<Text
									style={[styles.tableHeaderCell, styles.cellName]}
								>
									Nombre y Apellido
								</Text>
								<Text
									style={[styles.tableHeaderCell, styles.cellDoc]}
								>
									Número de Cédula
								</Text>
								<Text
									style={[styles.tableHeaderCell, styles.cellEmail]}
								>
									Correo Electrónico
								</Text>
								<Text
									style={[
										styles.tableHeaderCell,
										styles.cellSignature,
									]}
								>
									Firma
								</Text>
								<Text
									style={[styles.tableHeaderCell, styles.cellDate]}
								>
									Fecha
								</Text>
							</View>

							{students.map((cs, index) => {
								const attendanceRec = getAttendanceForDay(cs, day);
								const sigUrl = getSignatureUrl(attendanceRec);

								return (
									<View
										key={cs.id}
										style={styles.tableRow}
										wrap={false}
									>
										<Text style={styles.cellNum}>
											{String(index + 1).padStart(2, '0')}
										</Text>
										<Text style={styles.cellName}>
											{getStudentName(cs)}
										</Text>
										<Text style={styles.cellDoc}>
											{getStudentDoc(cs)}
										</Text>
										<Text style={styles.cellEmail}>
											{getStudentEmail(cs)}
										</Text>
										<View style={styles.cellSignature}>
											{sigUrl ? (
												<Image style={styles.sigImage} src={sigUrl} />
											) : (
												<Text style={styles.noSignature}></Text>
											)}
										</View>
										<Text style={styles.cellDate}>
											{attendanceRec?.date
												? formatDate(attendanceRec.date)
												: ''}
										</Text>
									</View>
								);
							})}
						</View>

						{/* Firmas del instructor, al pie, como en el Word */}
						<View style={styles.instructorFooter}>
							{daySigs.length > 0 ? (
								daySigs.map((sig) => (
									<View
										key={sig.id}
										style={styles.instructorSigBlock}
									>
										<Text style={styles.instructorSigLabel}>
											Firma del Instructor {sig.signature_number}
										</Text>
										{sig.signature_url ? (
											<Image
												style={styles.instructorSigImage}
												src={sig.signature_url}
											/>
										) : (
											<View style={styles.instructorLine} />
										)}
									</View>
								))
							) : (
								<View style={styles.instructorSigBlock}>
									<Text style={styles.instructorSigLabel}>
										Firma del Instructor
									</Text>
									<View style={styles.instructorLine} />
								</View>
							)}
						</View>

						<Text style={styles.footer}>
							RECIP - Sistema de Gestión de Capacitación | Documento
							generado el {new Date().toLocaleDateString('es-ES')}
						</Text>
					</Page>
				);
			})}
		</Document>
	);
};

export default AttendanceListPDF;
