import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { AppDispatch } from '../../../store';
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	List,
	ListItem,
	Typography,
} from '@material-tailwind/react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseStudentAssessmentLessonDay } from '../../../types/utilities';
import {
	changeCourseStudentAssessmentLessonDay,
	deleteCourseStudentAssessmentLessonDay,
} from '../../../features/assessmentSlice';
import { ordinalLabel } from '../../../utils/programSize';
import ScoreDetail from './scoreDetail';

type DetailToDelete = {
	id: number;
	name: string;
};

const LessonDetails = ({
	day,
	disabled,
}: {
	day: number;
	disabled: boolean;
}) => {
	const dispatch = useDispatch<AppDispatch>();

	const { assessment } = useSelector((state: RootState) => {
		return {
			assessment: state.assessment,
		};
	});

	const CSAD_id = assessment.courseStudentAssessmentDaySelected?.id;

	// Solo el primer `subject_lesson_days` de cada tema es el del día que se
	// está renderizando (el backend ya filtra por `day`), igual que ScoreDetail.
	const dayDetailIds = (assessment.subjectList ?? []).flatMap((SL) =>
		(SL.subject_lessons ?? []).flatMap((SLE) => {
			const lessonDetails =
				SLE.subject_lesson_days?.[0]
					?.course_student_assessment_lesson_days ?? [];
			return lessonDetails
				.map((detail) => detail.id)
				.filter((id): id is number => id !== undefined);
		}),
	);
	const hasDayDetails = dayDetailIds.length > 0;

	const [detailToDelete, setDetailToDelete] =
		useState<DetailToDelete | null>(null);
	const [confirmClearDay, setConfirmClearDay] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const handleChangeRadio = async (
		id: number | undefined,
		value: number,
		subject_id: number,
		subject_lesson_id: number,
		subject_days_id: number,
		subject_lesson_days_id: number,
		value_2: number | undefined,
		value_3: number | undefined,
	) => {
		const req: courseStudentAssessmentLessonDay = {
			id: id,
			course_id: assessment.courseStudentAssessmentDaySelected
				?.course_id
				? assessment.courseStudentAssessmentDaySelected.course_id
				: -1,
			student_id: assessment.courseStudentAssessmentDaySelected
				?.student_id
				? assessment.courseStudentAssessmentDaySelected.student_id
				: -1,
			course_student_id: assessment.courseStudentAssessmentDaySelected
				?.course_student_id
				? assessment.courseStudentAssessmentDaySelected
						.course_student_id
				: -1,
			course_student_assessment_id: assessment
				.courseStudentAssessmentDaySelected
				?.course_student_assessment_id
				? assessment.courseStudentAssessmentDaySelected
						.course_student_assessment_id
				: -1,
			course_student_assessment_day_id: assessment
				.courseStudentAssessmentDaySelected?.id
				? assessment.courseStudentAssessmentDaySelected.id
				: -1,
			subject_id,
			subject_lesson_id,
			subject_days_id,
			subject_lesson_days_id,
			item: `${value}`,
			score: value,
			score_2: value_2,
			score_3: value_3,
			day:
				assessment.courseStudentAssessmentDaySelected?.day ??
				undefined,
		};

		await dispatch(changeCourseStudentAssessmentLessonDay(req)).unwrap();
	};

	const deleteLessonDayDetails = async (params: {
		id?: number;
		course_student_assessment_day_id?: number;
	}) => {
		setDeleting(true);
		try {
			const result = await dispatch(
				deleteCourseStudentAssessmentLessonDay(params),
			).unwrap();
			toast.success(
				result.deleted === 1
					? 'Calificación eliminada'
					: `${result.deleted} calificaciones eliminadas`,
			);
			return true;
		} catch (error) {
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al eliminar las calificaciones',
			);
			return false;
		} finally {
			setDeleting(false);
		}
	};

	const handleDeleteDetail = async () => {
		if (!detailToDelete) return;
		const deleted = await deleteLessonDayDetails({
			id: detailToDelete.id,
		});
		if (deleted) {
			setDetailToDelete(null);
		}
	};

	const handleClearDay = async () => {
		if (!CSAD_id) return;
		const deleted = await deleteLessonDayDetails({
			course_student_assessment_day_id: CSAD_id,
		});
		if (deleted) {
			setConfirmClearDay(false);
		}
	};

	return (
		<div>
			<div className="flex flex-row flex-wrap items-center justify-between gap-2">
				<Typography
					variant="h4"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{ordinalLabel(
						assessment.courseStudentAssessmentSelected?.course,
						day,
					)}
				</Typography>
				{hasDayDetails && !disabled && (
					<Button
						variant="text"
						color="red"
						className="flex items-center gap-1 p-2"
						title="Eliminar todas las calificaciones de este día"
						onClick={() => setConfirmClearDay(true)}
						disabled={deleting}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Trash2 size={16} />
						Limpiar calificaciones del día
					</Button>
				)}
			</div>
			<div className="flex flex-col gap-2 py-2">
				{assessment.subjectList?.map((SL, index) => {
					let SLD_id: number = -1;
					if (SL.subject_days && SL.subject_days[0].id) {
						SLD_id = SL.subject_days[0].id;
					}
					return (
						<div key={`SL-list${index}`}>
							<Typography
								variant="h6"
								className="text-left"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{SL.name}
							</Typography>
							<List
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{SL.subject_lessons?.map((SLE, index2) => {
									return (
										<ListItem
											key={`SLE-list${index2}`}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											<ScoreDetail
												SLE={SLE}
												SLD_id={SLD_id}
												disabled={disabled}
												handleChangeRadio={
													handleChangeRadio
												}
												onRequestDeleteDetail={
													setDetailToDelete
												}
											/>
										</ListItem>
									);
								})}
							</List>
							<hr />
						</div>
					);
				})}
			</div>

			{/* Confirmar borrado de una calificación puntual */}
			{detailToDelete !== null && (
				<Dialog
					open={detailToDelete !== null}
					handler={() => {
						if (!deleting) setDetailToDelete(null);
					}}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<DialogHeader
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Eliminar calificación
					</DialogHeader>
					<DialogBody
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Se eliminará permanentemente la calificación de{' '}
						<strong className="break-all">
							{detailToDelete.name}
						</strong>{' '}
						en este día de evaluación. Esta acción no se puede
						deshacer.
					</DialogBody>
					<DialogFooter
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Button
							variant="text"
							color="gray"
							disabled={deleting}
							onClick={() => setDetailToDelete(null)}
							className="mr-2"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Cancelar
						</Button>
						<Button
							color="red"
							disabled={deleting}
							onClick={handleDeleteDetail}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{deleting ? 'Eliminando...' : 'Eliminar'}
						</Button>
					</DialogFooter>
				</Dialog>
			)}

			{/* Confirmar borrado de todos los detalles del día */}
			{confirmClearDay && (
				<Dialog
					open={confirmClearDay}
					handler={() => {
						if (!deleting) setConfirmClearDay(false);
					}}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<DialogHeader
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Limpiar calificaciones del día
					</DialogHeader>
					<DialogBody
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Se eliminarán permanentemente las{' '}
						<strong>{dayDetailIds.length}</strong> calificaciones
						registradas en este día de evaluación. Las condiciones
						de vuelo, firmas y comentarios se conservan. Esta acción
						no se puede deshacer.
					</DialogBody>
					<DialogFooter
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Button
							variant="text"
							color="gray"
							disabled={deleting}
							onClick={() => setConfirmClearDay(false)}
							className="mr-2"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Cancelar
						</Button>
						<Button
							color="red"
							disabled={deleting}
							onClick={handleClearDay}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{deleting
								? 'Eliminando...'
								: 'Eliminar calificaciones'}
						</Button>
					</DialogFooter>
				</Dialog>
			)}
		</div>
	);
};

export default LessonDetails;
