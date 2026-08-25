import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosGetDefault } from '../../../../services/axios';
import {
	Button,
	Card,
	CardBody,
	Chip,
	Collapse,
	IconButton,
	Typography,
} from '@material-tailwind/react';
import {
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	Eye,
} from 'lucide-react';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';

type Props = {
	instructor_id: number;
	course_id: number;
};

type TestQuestionAnswer = {
	id: number;
	resp: string;
	score?: number;
};

type TestQuestion = {
	id: number;
	Answered: boolean;
	question?: {
		id: number;
		header: string;
		question_type?: {
			id: number;
			name: string;
		};
	};
	course_student_test_answer?: TestQuestionAnswer;
};

type TestItem = {
	id: number;
	score: number;
	approve?: boolean;
	code: string;
	date: string;
	finished: boolean;
	test?: {
		id: number;
		code: string;
		min_score: number;
		duration: number;
	};
	course_student?: {
		id: number;
		code: string;
		student?: {
			id: number;
			user?: {
				id: number;
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
	course_student_test_questions?: TestQuestion[];
};

const InstructorTestsTab = ({ instructor_id, course_id }: Props) => {
	const navigate = useNavigate();
	const [tests, setTests] = useState<TestItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [expandedId, setExpandedId] = useState<number | null>(null);
	const pageSize = 10;

	const loadTests = async (page: number = 1) => {
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
				'api/instructor/tests',
				params,
			);
			if (status >= 200 && status < 400) {
				setTests(resp.data || []);
				setTotalPages(resp.totalPages || 1);
				setTotalItems(resp.totalItems || 0);
				setCurrentPage(resp.currentPage || page);
			} else {
				setError('Error al cargar exámenes');
			}
		} catch {
			setError('Error al conectar con el servidor');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTests(1);
	}, [instructor_id, course_id]);

	const handleNavigateReview = (item: TestItem) => {
		const cs = item.course_student;
		if (!cs || !item.test) return;
		navigate(
			`../review_test/${item.id}/${item.test.id}/${cs.course?.id}/${cs.id}/${cs.student?.user?.id}`,
		);
	};

	const getQuestionSummary = (item: TestItem) => {
		const questions = item.course_student_test_questions || [];
		const total = questions.length;
		const answered = questions.filter((q) => q.Answered).length;
		const correct = questions.filter(
			(q) =>
				q.course_student_test_answer?.score !== undefined &&
				q.course_student_test_answer.score > 0,
		).length;

		const byType = questions.reduce<
			Record<string, { total: number; correct: number }>
		>((acc, q) => {
			const typeName = q.question?.question_type?.name || 'Otro';
			if (!acc[typeName]) acc[typeName] = { total: 0, correct: 0 };
			acc[typeName].total++;
			if (
				q.course_student_test_answer?.score !== undefined &&
				q.course_student_test_answer.score > 0
			) {
				acc[typeName].correct++;
			}
			return acc;
		}, {});

		return { total, answered, correct, byType };
	};

	if (loading && tests.length === 0) return <LoadingPage />;
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
					Exámenes
				</Typography>

				{tests.length === 0 ? (
					<Typography
						color="gray"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						No hay exámenes registrados
					</Typography>
				) : (
					<div className="flex flex-col gap-3">
						{tests.map((item) => {
							const summary = getQuestionSummary(item);
							const isExpanded = expandedId === item.id;
							const approved = item.approve ?? item.score >= (item.test?.min_score ?? 0);

							return (
								<div
									key={item.id}
									className="border border-blue-gray-100 rounded-lg overflow-hidden"
								>
									<div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 hover:bg-blue-gray-50/30 transition-colors">
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												<Typography
													variant="h6"
													color="blue-gray"
													className="text-sm"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{item.course_student?.student?.user
														? `${item.course_student.student.user.name} ${item.course_student.student.user.last_name}`
														: 'Sin alumno'}
												</Typography>
												<Chip
													size="sm"
													variant="ghost"
													color={approved ? 'green' : 'red'}
													value={
														approved ? 'Aprobado' : 'Reprobado'
													}
												/>
											</div>
											<div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
												<span>
													<strong>Examen:</strong>{' '}
													{item.test?.code ?? '-'}
												</span>
												<span>
													<strong>Curso:</strong>{' '}
													{item.course_student?.course?.name ?? '-'}
												</span>
												<span>
													<strong>Fecha:</strong> {item.date}
												</span>
												<span>
													<strong>Código:</strong> {item.code}
												</span>
											</div>
										</div>

										<div className="flex items-center gap-3">
											<div className="text-right">
												<Typography
													variant="h5"
													color="blue-gray"
													className={`${
														approved
															? 'text-green-600'
															: 'text-red-600'
													}`}
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{item.score?.toFixed(1) ?? '-'}
												</Typography>
												<Typography
													variant="small"
													color="gray"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Min: {item.test?.min_score ?? '-'}
												</Typography>
											</div>

											<IconButton
												variant="text"
												color="gray"
												size="sm"
												onClick={() =>
													setExpandedId(
														isExpanded ? null : item.id,
													)
												}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												<ChevronDown
													size={18}
													className={`transition-transform ${
														isExpanded ? 'rotate-180' : ''
													}`}
												/>
											</IconButton>

											<IconButton
												variant="text"
												color="blue"
												size="sm"
												onClick={() => handleNavigateReview(item)}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												<Eye size={18} />
											</IconButton>
										</div>
									</div>

									<Collapse open={isExpanded}>
										<div className="px-4 pb-4 border-t border-blue-gray-50">
											<div className="pt-3">
												<Typography
													variant="small"
													color="blue-gray"
													className="font-semibold mb-2"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Resumen de preguntas
												</Typography>
												<div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
													<div className="p-2 bg-blue-gray-50 rounded-lg text-center">
														<Typography
															variant="small"
															color="gray"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															Total
														</Typography>
														<Typography
															variant="h6"
															color="blue-gray"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															{summary.total}
														</Typography>
													</div>
													<div className="p-2 bg-blue-gray-50 rounded-lg text-center">
														<Typography
															variant="small"
															color="gray"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															Respondidas
														</Typography>
														<Typography
															variant="h6"
															color="blue-gray"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															{summary.answered}
														</Typography>
													</div>
													<div className="p-2 bg-green-50 rounded-lg text-center">
														<Typography
															variant="small"
															color="gray"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															Correctas
														</Typography>
														<Typography
															variant="h6"
															className="text-green-700"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															{summary.correct}
														</Typography>
													</div>
													<div className="p-2 bg-red-50 rounded-lg text-center">
														<Typography
															variant="small"
															color="gray"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															Incorrectas
														</Typography>
														<Typography
															variant="h6"
															className="text-red-600"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															{summary.answered -
																summary.correct}
														</Typography>
													</div>
												</div>

												{Object.keys(summary.byType).length >
													0 && (
													<>
														<Typography
															variant="small"
															color="blue-gray"
															className="font-semibold mb-2"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															Por tipo de pregunta
														</Typography>
														<div className="flex flex-col gap-1">
															{Object.entries(
																summary.byType,
															).map(([typeName, data]) => (
																<div
																	key={typeName}
																	className="flex items-center justify-between text-xs py-1 px-2 rounded bg-blue-gray-50/50"
																>
																	<span className="text-gray-700">
																		{typeName}
																	</span>
																	<span className="font-medium">
																		{data.correct}/{data.total}{' '}
																		correctas
																	</span>
																</div>
															))}
														</div>
													</>
												)}
											</div>
										</div>
									</Collapse>
								</div>
							);
						})}
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
								onClick={() => loadTests(currentPage - 1)}
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
								onClick={() => loadTests(currentPage + 1)}
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

export default InstructorTestsTab;
