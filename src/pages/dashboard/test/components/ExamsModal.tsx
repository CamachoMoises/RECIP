import {
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
	Button,
	Typography,
} from '@material-tailwind/react';
import moment from 'moment';
import { NotebookText, X, Eye, StopCircle } from 'lucide-react';
import { courseStudentTest } from '../../../../types/utilities';

interface ExamsModalProps {
	open: boolean;
	onClose: () => void;
	studentTestList: courseStudentTest[];
	userId: number;
	onNavigateReviewTest: (
		CST_id: number,
		test_id: number,
		course_id: number,
		CS_id: number,
		user_id: number,
	) => void;
	onHandleEndTest: (course_student_test_id: number) => void;
}

const getStatusBadge = (cst: courseStudentTest) => {
	const minScore = cst.test?.min_score ?? 0;
	if (cst.score === undefined || cst.score === null) {
		return {
			label: 'En progreso',
			className: 'bg-amber-50 text-amber-800',
		};
	}
	return cst.score >= minScore
		? { label: 'Aprobado', className: 'bg-green-50 text-green-800' }
		: { label: 'Reprobado', className: 'bg-red-50 text-red-800' };
};

const ExamsModal = ({
	open,
	onClose,
	studentTestList,
	userId,
	onNavigateReviewTest,
	onHandleEndTest,
}: ExamsModalProps) => {
	return (
		<Dialog
			open={open}
			handler={onClose}
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			size="lg"
			className="max-w-full sm:max-w-lg"
		>
			<DialogHeader
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="flex items-center justify-between pb-3 border-b border-gray-100"
			>
				<div className="flex items-center gap-3">
					<div className="bg-blue-50 rounded-lg p-2">
						<NotebookText size={18} className="text-blue-600" />
					</div>
					<div>
						<p className="text-sm font-medium text-gray-900">
							Exámenes del estudiante
						</p>
						<p className="text-xs text-gray-500 font-normal">
							{studentTestList?.length ?? 0} exámenes registrados
						</p>
					</div>
				</div>
				<button
					onClick={onClose}
					className="text-gray-400 hover:text-gray-600 transition-colors"
				>
					<X size={18} />
				</button>
			</DialogHeader>

			<DialogBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto px-4 py-4"
			>
				{studentTestList && studentTestList.length > 0 ? (
					studentTestList.map((cst, index) => {
						const minScore = cst.test?.min_score ?? 0;
						const scorePercent =
							cst.score !== null && cst.score !== undefined
								? Math.min((cst.score / (minScore || 100)) * 100, 100)
								: 0;
						const badge = getStatusBadge(cst);
						const isApproved =
							cst.score !== null &&
							cst.score !== undefined &&
							cst.score >= minScore;

						return (
							<div
								key={`exam-${index}`}
								className="border border-gray-100 rounded-xl p-4"
							>
								<div className="flex items-start justify-between gap-3">
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-2">
											<Typography
												variant="h6"
												className="text-sm font-medium truncate"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{cst.code || 'Sin código'}
											</Typography>
											<span
												className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${badge.className}`}
											>
												{badge.label}
											</span>
										</div>
										<div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
											<span>
												{cst.date
													? moment(cst.date).format(
															'DD/MM/YYYY HH:mm',
														)
													: 'Sin fecha'}
											</span>
											<span>
												{cst.course_student?.course?.name ||
													'Sin curso'}
											</span>
										</div>
										{cst.score !== undefined && cst.score !== null ? (
											<div className="flex items-center gap-2">
												<div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
													<div
														className={`h-full rounded-full transition-all ${isApproved ? 'bg-green-500' : 'bg-red-500'}`}
														style={{ width: `${scorePercent}%` }}
													/>
												</div>
												<span
													className={`text-xs font-medium whitespace-nowrap ${isApproved ? 'text-green-700' : 'text-red-700'}`}
												>
													{cst.score} / {minScore} (min)
												</span>
											</div>
										) : (
											<p className="text-xs text-gray-400">
												Sin puntaje aún
											</p>
										)}
									</div>
									<div className="flex flex-col gap-2 flex-shrink-0">
										<Button
											size="sm"
											variant="outlined"
											color="blue-gray"
											className="text-xs flex items-center gap-1 py-1.5 px-3 normal-case"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											onClick={() => {
												const courseId =
													cst.course_student?.course?.id || -1;
												onNavigateReviewTest(
													cst.id,
													cst.test_id,
													courseId,
													cst.course_student_id,
													userId,
												);
											}}
										>
											<Eye size={13} />
											Revisión
										</Button>
										<Button
											size="sm"
											variant="outlined"
											color="red"
											className="text-xs flex items-center gap-1 py-1.5 px-3 normal-case"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											onClick={() => onHandleEndTest(cst.id)}
										>
											<StopCircle size={13} />
											Evaluar
										</Button>
									</div>
								</div>
							</div>
						);
					})
				) : (
					<Typography
						variant="h6"
						color="gray"
						className="text-center py-8 text-sm"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						No hay exámenes registrados
					</Typography>
				)}
			</DialogBody>

			<DialogFooter
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="border-t border-gray-100 pt-3"
			>
				<Button
					variant="text"
					color="gray"
					size="sm"
					onClick={onClose}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Cerrar
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default ExamsModal;
