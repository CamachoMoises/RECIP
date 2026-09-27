import { useEffect, useState } from 'react';
import { axiosGetDefault } from '../../../../services/axios';
import {
	Button,
	Card,
	CardBody,
	Typography,
} from '@material-tailwind/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import moment from 'moment';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';

type Props = {
	instructor_id: number;
	course_id: number;
};

type AttendanceItem = {
	id: number;
	day: number;
	date: string;
	comments?: string;
	attendance_status?: {
		id: number;
		name: string;
	};
	course_student?: {
		id: number;
		code: string;
		student?: {
			id: number;
			user?: {
				name: string;
				last_name: string;
			};
		};
		course?: {
			id: number;
			name: string;
		};
	};
};

const getStatusColor = (statusName: string | undefined) => {
	switch (statusName?.toLowerCase()) {
		case 'presente':
			return 'bg-green-100 text-green-700';
		case 'ausente':
			return 'bg-red-100 text-red-700';
		case 'tarde':
			return 'bg-orange-100 text-orange-700';
		case 'excusado':
			return 'bg-blue-100 text-blue-700';
		default:
			return 'bg-gray-100 text-gray-700';
	}
};

const InstructorAttendanceTab = ({ instructor_id, course_id }: Props) => {
	const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const pageSize = 15;

	const loadAttendance = async (page: number = 1) => {
		if (instructor_id <= 0) {
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const params: Record<string, any> = {
				instructor_id,
				currentPage: page,
				pageSize,
			};
			const { resp, status } = await axiosGetDefault(
				'api/attendance',
				params,
			);
			if (status >= 200 && status < 400) {
				setAttendance(resp.data || []);
				setTotalPages(resp.totalPages || 1);
				setTotalItems(resp.totalItems || 0);
				setCurrentPage(resp.currentPage || page);
			} else {
				setError('Error al cargar asistencia');
			}
		} catch {
			setError('Error al conectar con el servidor');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAttendance(1);
	}, [instructor_id, course_id]);

	if (loading && attendance.length === 0) return <LoadingPage />;
	if (error) return <ErrorPage error={error} />;

	return (
		<Card
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<CardBody
				className="p-4 md:p-6"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Typography
					variant="h5"
					color="blue-gray"
					className="mb-4"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Registro de Asistencia
				</Typography>

				{attendance.length === 0 ? (
					<Typography
						color="gray"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						No hay registros de asistencia
					</Typography>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr>
									<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Fecha
										</Typography>
									</th>
									<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Día
										</Typography>
									</th>
									<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Alumno
										</Typography>
									</th>
									<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Curso
										</Typography>
									</th>
									<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-center">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Estado
										</Typography>
									</th>
									<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Comentarios
										</Typography>
									</th>
								</tr>
							</thead>
							<tbody>
								{attendance.map((a) => (
									<tr
										key={a.id}
										className="hover:bg-blue-gray-50/50 transition-colors"
									>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-sm">
											{moment(a.date).format('DD/MM/YYYY')}
										</td>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-sm font-medium">
											Día {a.day}
										</td>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-sm">
											{a.course_student?.student?.user
												? `${a.course_student.student.user.name} ${a.course_student.student.user.last_name}`
												: '-'}
										</td>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-sm">
											{a.course_student?.course?.name ?? '-'}
										</td>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-center">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
													a.attendance_status?.name,
												)}`}
											>
												{a.attendance_status?.name ?? '-'}
											</span>
										</td>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-sm text-gray-500 max-w-[200px] truncate">
											{a.comments ?? '-'}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{totalPages > 1 && (
					<div className="flex flex-col items-center gap-2 mt-4">
						<Typography
							variant="small"
							color="gray"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Página {currentPage} de {totalPages} ({totalItems}{' '}
							registros)
						</Typography>
						<div className="flex items-center gap-2">
							<Button
								variant="text"
								className="flex items-center gap-2 rounded-full"
								onClick={() => loadAttendance(currentPage - 1)}
								disabled={currentPage === 1}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<ChevronLeft strokeWidth={2} className="h-4 w-4" />
								Prev
							</Button>
							<Button
								variant="text"
								className="flex items-center gap-2 rounded-full"
								onClick={() => loadAttendance(currentPage + 1)}
								disabled={currentPage === totalPages}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Sig
								<ChevronRight strokeWidth={2} className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default InstructorAttendanceTab;
