import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Typography,
} from '@material-tailwind/react';
import { BookOpen, Eye, Loader2, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { axiosGetSlice } from '../../../services/axios';
import {
	course,
	subject,
	subjectLesson,
	subjectLessonDays,
} from '../../../types/utilities';
import {
	ordinalLabel,
	ordinalNoun,
	programOrdinals,
} from '../../../utils/programSize';

type PreviewLesson = {
	lesson: subjectLesson;
	lessonDay: subjectLessonDays;
};

type PreviewModule = {
	subject: subject;
	lessons: PreviewLesson[];
};

/**
 * Replica la regla de `GET /api/assessment/fetchSubjectAssessment`:
 * - la sección debe estar activa y tener `subject_days` activo para el ordinal;
 * - el tema debe estar activo y tener `subject_lesson_days` activo para el ordinal.
 * Sin esas condiciones el tema no aparece en la evaluación.
 */
const buildPreviewForOrdinal = (
	subjects: subject[],
	ordinal: number,
): PreviewModule[] => {
	const modules: PreviewModule[] = [];
	subjects.forEach((sub) => {
		if (!sub.status || sub.is_schedulable) return;
		const hasActiveSubjectDay = (sub.subject_days ?? []).some(
			(sd) => Number(sd.day) === ordinal && sd.status,
		);
		if (!hasActiveSubjectDay) return;

		const lessons: PreviewLesson[] = [];
		(sub.subject_lessons ?? []).forEach((lesson) => {
			if (!lesson.status) return;
			const lessonDay = (lesson.subject_lesson_days ?? []).find(
				(sld) => Number(sld.day) === ordinal && sld.status,
			);
			if (lessonDay) lessons.push({ lesson, lessonDay });
		});

		if (lessons.length) modules.push({ subject: sub, lessons });
	});
	return modules;
};

const CourseAssessmentPreviewModal = ({
	open,
	onClose,
	course,
}: {
	open: boolean;
	onClose: () => void;
	course: course;
}) => {
	const [subjects, setSubjects] = useState<subject[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activeOrdinal, setActiveOrdinal] = useState(1);

	const ordinals = programOrdinals(course);
	const courseId = course.id;

	const load = useCallback(async () => {
		if (!courseId) return;
		setLoading(true);
		setError(null);
		try {
			const data = await axiosGetSlice(
				`api/subjects/lesson/course/${courseId}`,
			);
			setSubjects(Array.isArray(data) ? data : []);
		} catch (e: any) {
			setError(
				e?.response?.data?.message ||
					e?.message ||
					'No se pudo cargar la estructura del curso',
			);
		} finally {
			setLoading(false);
		}
	}, [courseId]);

	useEffect(() => {
		if (!open) return;
		setActiveOrdinal(1);
		load();
	}, [open, load]);

	const modules = useMemo(
		() => buildPreviewForOrdinal(subjects, activeOrdinal),
		[subjects, activeOrdinal],
	);
	const totalLessons = modules.reduce(
		(total, module) => total + module.lessons.length,
		0,
	);

	return (
		<Dialog
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			open={open}
			handler={onClose}
			size="xl"
		>
			<DialogHeader
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="flex items-center gap-3"
			>
				<Eye className="h-6 w-6 text-[#134475]" />
				<div className="flex flex-col">
					<span>Vista previa de la evaluación</span>
					<Typography
						variant="small"
						className="font-normal text-blue-gray-600"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						{course.name}
					</Typography>
				</div>
			</DialogHeader>
			<DialogBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto"
			>
				<Typography
					variant="small"
					className="text-blue-gray-600"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Así verá el instructor los módulos y temas en cada{' '}
					{ordinalNoun(course).toLowerCase()}. Solo se listan las
					secciones y los temas activos; lo que esté desactivado no
					aparece.
				</Typography>

				<div className="flex flex-wrap gap-2">
					{ordinals.map((ordinal) => {
						const dayNumber = ordinal.id + 1;
						const isActive = activeOrdinal === dayNumber;
						return (
							<Button
								key={`ordinal-${ordinal.id}`}
								size="sm"
								variant={isActive ? 'filled' : 'outlined'}
								onClick={() => setActiveOrdinal(dayNumber)}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{ordinal.name}
							</Button>
						);
					})}
				</div>

				<hr />

				{loading ? (
					<div className="flex flex-col items-center justify-center gap-2 py-10 text-blue-gray-600">
						<Loader2 className="h-7 w-7 animate-spin" />
						<Typography
							variant="small"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Cargando estructura del curso...
						</Typography>
					</div>
				) : error ? (
					<div className="flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center">
						<Typography
							variant="h6"
							color="red"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							No se pudo cargar la vista previa
						</Typography>
						<Typography
							variant="small"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{error}
						</Typography>
						<Button
							size="sm"
							variant="outlined"
							className="flex items-center gap-2"
							onClick={load}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<RotateCcw size={16} />
							Reintentar
						</Button>
					</div>
				) : (
					<>
						<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-blue-gray-50 p-3">
							<Typography
								variant="h6"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{ordinalLabel(course, activeOrdinal)}
							</Typography>
							<Typography
								variant="small"
								className="text-blue-gray-600"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{modules.length}{' '}
								{modules.length === 1 ? 'módulo' : 'módulos'} ·{' '}
								{totalLessons}{' '}
								{totalLessons === 1 ? 'tema activo' : 'temas activos'}
							</Typography>
						</div>

						{modules.length === 0 ? (
							<div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-blue-gray-200 p-8 text-center">
								<Typography
									variant="h6"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Sin temas activos
								</Typography>
								<Typography
									variant="small"
									className="text-blue-gray-600"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Ninguna sección tiene temas activos en{' '}
									{ordinalLabel(
										course,
										activeOrdinal,
									).toLowerCase()}
									.
								</Typography>
							</div>
						) : (
							<div className="flex flex-col gap-3">
								{modules.map(({ subject, lessons }) => (
									<div
										key={`module-${subject.id}`}
										className="overflow-hidden rounded-lg border border-blue-gray-100"
									>
										<div className="flex items-center justify-between gap-2 bg-blue-gray-50 px-3 py-2">
											<div className="flex items-center gap-2">
												<BookOpen className="h-4 w-4 text-[#134475]" />
												<Typography
													variant="h6"
													className="text-left"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{subject.name}
												</Typography>
											</div>
											<Typography
												variant="small"
												className="shrink-0 text-blue-gray-600"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{lessons.length}{' '}
												{lessons.length === 1
													? 'tema'
													: 'temas'}
											</Typography>
										</div>
										<ul className="flex flex-col divide-y divide-blue-gray-50">
											{lessons.map(({ lesson }, index) => (
												<li
													key={`lesson-${lesson.id}`}
													className="flex items-start gap-2 px-3 py-2"
												>
													<span className="mt-0.5 w-5 shrink-0 text-right text-xs font-semibold text-blue-gray-500">
														{index + 1}.
													</span>
													<Typography
														variant="small"
														className="text-left"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{lesson.name}
													</Typography>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						)}
					</>
				)}
			</DialogBody>
			<DialogFooter
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Button
					variant="text"
					className="flex items-center gap-2"
					onClick={onClose}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<X size={16} />
					Cerrar
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default CourseAssessmentPreviewModal;
