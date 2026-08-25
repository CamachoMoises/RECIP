import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store';
import { useNavigate } from 'react-router-dom';
import { axiosGetDefault } from '../../../../services/axios';
import {
	fetchAssessmentData,
	createCourseStudentAssessment,
} from '../../../../features/assessmentSlice';
import {
	Button,
	Card,
	CardBody,
	IconButton,
	Typography,
} from '@material-tailwind/react';
import { ChevronLeft, ChevronRight, NotebookText, Eye } from 'lucide-react';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import toast from 'react-hot-toast';

type Props = {
	instructor_id: number;
	course_id: number;
};

type AssessmentItem = {
	id: number;
	score: number;
	approve: boolean;
	date: string;
	code: string;
	finished: boolean;
	course_student?: {
		id: number;
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
			course_level?: { name: string };
			course_type?: { name: string };
		};
	};
};

const InstructorAssessmentTab = ({ instructor_id, course_id }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const pageSize = 10;

	const loadAssessments = async (page: number = 1) => {
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
			if (course_id) params.course_id = course_id;
			const { resp, status } = await axiosGetDefault(
				'api/instructor/assessments',
				params,
			);
			if (status >= 200 && status < 400) {
				setAssessments(resp.data || []);
				setTotalPages(resp.totalPages || 1);
				setTotalItems(resp.totalItems || 0);
				setCurrentPage(resp.currentPage || page);
			} else {
				setError('Error al cargar evaluaciones');
			}
		} catch {
			setError('Error al conectar con el servidor');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadAssessments(1);
	}, [instructor_id, course_id]);

	const handleViewAssessment = async (item: AssessmentItem) => {
		const cs = item.course_student;
		if (!cs) return;

		if (item.id) {
			toast.loading('Cargando evaluación', { id: 'loadAssessment' });
			try {
				await dispatch(fetchAssessmentData(item.id)).unwrap();
				toast.dismiss('loadAssessment');
				navigate(
					`../course_assessment/${cs.id}/${cs.course?.id}`,
				);
			} catch {
				toast.dismiss('loadAssessment');
				toast.error('Error al cargar la evaluación');
			}
		} else if (cs.student?.id && cs.id && cs.course?.id) {
			toast.loading('Creando evaluación', { id: 'createAssessment' });
			try {
				const result = await dispatch(
					createCourseStudentAssessment({
						course_id: cs.course.id,
						student_id: cs.student.id,
						course_student_id: cs.id,
					}),
				).unwrap();
				if (result?.id) {
					await dispatch(fetchAssessmentData(result.id)).unwrap();
				}
				toast.dismiss('createAssessment');
				navigate(
					`../course_assessment/${cs.id}/${cs.course?.id}`,
				);
			} catch {
				toast.dismiss('createAssessment');
				toast.error('Error al crear la evaluación');
			}
		}
	};

	if (loading && assessments.length === 0) return <LoadingPage />;
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
					Evaluaciones FSTD / ATD
				</Typography>

				{assessments.length === 0 ? (
					<Typography
						color="gray"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						No hay evaluaciones registradas
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
											Piloto
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
									<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Código
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
											Puntaje
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
											Fecha
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
											Acciones
										</Typography>
									</th>
								</tr>
							</thead>
							<tbody>
								{assessments.map((item) => (
									<tr
										key={item.id}
										className="hover:bg-blue-gray-50/50 transition-colors"
									>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-sm font-medium">
											{item.course_student?.student?.user
												? `${item.course_student.student.user.name} ${item.course_student.student.user.last_name}`
												: '-'}
										</td>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-sm">
											{item.course_student?.course?.name ?? '-'}
										</td>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-sm">
											{item.code}
										</td>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-center text-sm font-medium">
											{item.score?.toFixed(1) ?? '-'}
										</td>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-center">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													item.approve
														? 'bg-green-100 text-green-700'
														: item.finished
															? 'bg-red-100 text-red-700'
															: 'bg-yellow-100 text-yellow-700'
												}`}
											>
												{item.finished
													? item.approve
														? 'Aprobado'
														: 'Reprobado'
													: 'En progreso'}
											</span>
										</td>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-sm text-gray-500">
											{item.date}
										</td>
										<td className="py-3 px-4 border-b border-blue-gray-50 text-center">
											<IconButton
												variant="text"
												color="blue"
												size="sm"
												onClick={() =>
													handleViewAssessment(item)
												}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{item.id ? (
													<Eye size={18} />
												) : (
													<NotebookText size={18} />
												)}
											</IconButton>
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
								onClick={() => loadAssessments(currentPage - 1)}
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
								onClick={() => loadAssessments(currentPage + 1)}
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

export default InstructorAssessmentTab;
