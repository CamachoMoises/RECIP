import {
	Document,
	Page,
	View,
	Text,
	StyleSheet,
	Image,
} from '@react-pdf/renderer';
import {
	courseGroup,
	courseStudent,
	courseGroupSignature,
	attendance,
	attendanceStatus,
} from '../../../types/utilities';

const styles = StyleSheet.create({
	page: {
		padding: 15,
		fontSize: 8,
		fontFamily: 'Helvetica',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#374151',
		paddingBottom: 6,
	},
	logo: {
		width: 60,
	},
	headerInfo: {
		flexDirection: 'column',
		alignItems: 'center',
		flex: 1,
	},
	headerTitle: {
		fontSize: 10,
		fontWeight: 'bold',
		textAlign: 'center',
	},
	headerSubtitle: {
		fontSize: 7,
		textAlign: 'center',
		color: '#4b5563',
		marginTop: 2,
	},
	dayHeader: {
		fontSize: 9,
		fontWeight: 'bold',
		marginVertical: 6,
		textAlign: 'center',
		padding: 4,
		backgroundColor: '#f3f4f6',
		borderWidth: 1,
		borderColor: '#d1d5db',
	},
	table: {
		width: '100%',
		marginBottom: 8,
		borderWidth: 1,
		borderColor: '#d1d5db',
	},
	tableHeader: {
		flexDirection: 'row',
		backgroundColor: '#e5e7eb',
	},
	tableHeaderCell: {
		fontWeight: 'bold',
		padding: 4,
		fontSize: 7,
		textAlign: 'center',
		borderWidth: 1,
		borderColor: '#d1d5db',
	},
	tableRow: {
		flexDirection: 'row',
	},
	cellName: {
		width: '25%',
		borderWidth: 1,
		borderColor: '#d1d5db',
		padding: 3,
		fontSize: 7,
	},
	cellPC: {
		width: '12%',
		borderWidth: 1,
		borderColor: '#d1d5db',
		padding: 3,
		fontSize: 7,
		textAlign: 'center',
	},
	cellDoc: {
		width: '12%',
		borderWidth: 1,
		borderColor: '#d1d5db',
		padding: 3,
		fontSize: 7,
		textAlign: 'center',
	},
	cellStatus: {
		width: '16%',
		borderWidth: 1,
		borderColor: '#d1d5db',
		padding: 3,
		fontSize: 7,
		textAlign: 'center',
	},
	cellSignature: {
		width: '35%',
		borderWidth: 1,
		borderColor: '#d1d5db',
		padding: 2,
		fontSize: 7,
		textAlign: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},
	sigImage: {
		width: '100%',
		height: 60,
		objectFit: 'contain',
	},
	noSignature: {
		color: '#9ca3af',
		fontSize: 6,
		fontStyle: 'italic',
	},
	instructorSection: {
		marginTop: 8,
		borderTopWidth: 1,
		borderTopColor: '#374151',
		paddingTop: 5,
	},
	instructorTitle: {
		fontSize: 8,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 4,
	},
	instructorRow: {
		flexDirection: 'row',
		justifyContent: 'space-evenly',
	},
	instructorSigBlock: {
		alignItems: 'center',
		width: '30%',
	},
	instructorLabel: {
		fontSize: 6,
		color: '#4b5563',
		marginBottom: 2,
	},
	instructorSigImage: {
		width: 120,
		height: 32,
		objectFit: 'contain',
		borderWidth: 1,
		borderColor: '#d1d5db',
	},
	instructorEmpty: {
		width: 120,
		height: 32,
		borderWidth: 1,
		borderColor: '#d1d5db',
		borderStyle: 'dashed',
		justifyContent: 'center',
		alignItems: 'center',
	},
	instructorEmptyText: {
		fontSize: 5,
		color: '#9ca3af',
	},
	footer: {
		position: 'absolute',
		bottom: 10,
		left: 15,
		right: 15,
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
	group: courseGroup;
	students: courseStudent[];
	attendancesByStudent: Record<number, attendance[]>;
	instructorSignatures: courseGroupSignature[];
	logoBase64: string;
	attendanceStatuses: attendanceStatus[];
};

const AttendanceListPDF = ({
	group,
	students,
	attendancesByStudent,
	instructorSignatures,
	logoBase64,
	attendanceStatuses,
}: Props) => {
	const totalDays = group.course?.days || 1;
	const groupDate = group.date || students[0]?.date || null;

	console.log('[AttendanceListPDF] group:', group.id, group.title, { totalDays, groupDate });
	console.log('[AttendanceListPDF] students:', students.map(s => ({ id: s.id, name: s.student?.user?.name, uid: s.student?.user_id })));
	console.log('[AttendanceListPDF] attendancesByStudent keys:', Object.keys(attendancesByStudent));
	Object.entries(attendancesByStudent).forEach(([csId, atts]) => {
		console.log(`[AttendanceListPDF] atts for CS#${csId}:`, atts.map(a => ({ id: a.id, date: a.date, status: a.attendance_status_id })));
	});

	const getStatusName = (statusId: number): string => {
		const found = attendanceStatuses.find((s) => s.id === statusId);
		return found?.name || String(statusId);
	};

	const getAttendanceForDay = (
		csId: number,
		dayDate: string,
	): attendance | undefined => {
		const records = attendancesByStudent[csId];
		if (!records) {
			console.log(`[AttendanceListPDF] No records for CS#${csId}, day ${dayDate}`);
			return undefined;
		}
		console.log(`[AttendanceListPDF] Looking for CS#${csId} day=${dayDate}, available dates:`, records.map(a => ({ id: a.id, date: a.date, dateSplit: typeof a.date === 'string' ? a.date.split('T')[0] : String(a.date).split('T')[0] })));
		const record = records.find((a) => {
			const attDate =
				typeof a.date === 'string'
					? a.date.split('T')[0]
					: String(a.date).split('T')[0];
			const match = attDate === dayDate;
			console.log(`[AttendanceListPDF]   comparing attDate=${attDate} === dayDate=${dayDate} => ${match}`);
			return match;
		});
		return record;
	};

	const getStudentName = (cs: courseStudent): string => {
		if (cs.student?.user) {
			return `${cs.student.user.name} ${cs.student.user.last_name}`;
		}
		return `PC: ${cs.student?.user_id || cs.code || 'N/A'}`;
	};

	const getStudentDoc = (cs: courseStudent): string => {
		return cs.student?.user?.doc_number
			? String(cs.student.user.doc_number)
			: '';
	};

	const getStudentPC = (cs: courseStudent): string => {
		return String(cs.student?.user_id || cs.code || '');
	};

	const getSignatureUrl = (
		att: attendance | undefined,
	): string | null => {
		if (!att) return null;
		if (att.attendance_signature?.signature_url) {
			return att.attendance_signature.signature_url;
		}
		if (att.AttendanceSignature?.signature_url) {
			return att.AttendanceSignature.signature_url;
		}
		if (att.signature_url) {
			return att.signature_url;
		}
		return null;
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

	const days = Array.from({ length: totalDays }, (_, i) => i + 1);

	return (
		<Document>
			{days.map((day) => {
				const dayDate = groupDate
					? addDays(groupDate, day - 1)
					: null;

				const daySigs = getDayInstructorSignatures(day);

				return (
					<Page key={day} size="LETTER" style={styles.page}>
						<View style={styles.header}>
							{logoBase64 && (
								<Image style={styles.logo} src={logoBase64} />
							)}
							<View style={styles.headerInfo}>
								<Text style={styles.headerTitle}>
									Registro de Asistencia
								</Text>
								<Text style={styles.headerSubtitle}>
									{group.course?.name || ''} - {group.title} (
									{group.code})
								</Text>
								{groupDate && (
									<Text style={styles.headerSubtitle}>
										Fecha: {formatDate(groupDate)}
									</Text>
								)}
							</View>
						</View>

						<View style={styles.dayHeader}>
							<Text>Día {day}</Text>
							<Text>{formatDate(dayDate)}</Text>
						</View>

						<View style={styles.table}>
							<View style={styles.tableHeader}>
								<Text
									style={[styles.tableHeaderCell, styles.cellName]}
								>
									Participante
								</Text>
								<Text style={[styles.tableHeaderCell, styles.cellPC]}>
									PC
								</Text>
								<Text style={[styles.tableHeaderCell, styles.cellDoc]}>
									Documento
								</Text>
								<Text
									style={[styles.tableHeaderCell, styles.cellStatus]}
								>
									Estado
								</Text>
								<Text
									style={[
										styles.tableHeaderCell,
										styles.cellSignature,
									]}
								>
									Firma
								</Text>
							</View>

							{students.map((cs) => {
								const attendanceRec = dayDate
									? getAttendanceForDay(cs.id, dayDate)
									: undefined;
								const sigUrl = getSignatureUrl(attendanceRec);
								const statusName = attendanceRec
									? getStatusName(attendanceRec.attendance_status_id)
									: '---';

								return (
									<View
										key={cs.id}
										style={styles.tableRow}
										wrap={false}
									>
										<Text style={styles.cellName}>
											{getStudentName(cs)}
										</Text>
										<Text style={styles.cellPC}>
											{getStudentPC(cs)}
										</Text>
										<Text style={styles.cellDoc}>
											{getStudentDoc(cs)}
										</Text>
										<Text style={styles.cellStatus}>
											{statusName}
										</Text>
										<View style={styles.cellSignature}>
											{sigUrl ? (
												<Image style={styles.sigImage} src={sigUrl} />
											) : (
												<Text style={styles.noSignature}>
													{attendanceRec ? 'Sin firma' : '---'}
												</Text>
											)}
										</View>
									</View>
								);
							})}
						</View>

						<View style={styles.instructorSection}>
							<Text style={styles.instructorTitle}>
								Firmas de Instructores - Día {day}
							</Text>
							<View style={styles.instructorRow}>
								{daySigs.length > 0 ? (
									daySigs.map((sig) => (
										<View
											key={sig.id}
											style={styles.instructorSigBlock}
										>
											<Text style={styles.instructorLabel}>
												Firma {sig.signature_number}
											</Text>
											<Image
												style={styles.instructorSigImage}
												src={sig.signature_url}
											/>
										</View>
									))
								) : (
									<View style={styles.instructorEmpty}>
										<Text style={styles.instructorEmptyText}>
											Sin firma
										</Text>
									</View>
								)}
							</View>
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
