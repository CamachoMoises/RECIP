import { useCallback, useEffect, useMemo, useState } from 'react';
import { axiosGetDefault } from '../../../../services/axios';
import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	Card,
	CardBody,
	Typography,
} from '@material-tailwind/react';
import { ChevronDown, PenLine, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingPage from '../../../../components/LoadingPage';
import { PermissionsValidate } from '../../../../services/permissionsValidate';
import { signatureGroup } from '../../../../types/utilities';
import { ScheduleGroupedItem } from '../../../../features/instructorSlice';
import { isWithinProgram } from '../../../../utils/programSize';
import InstructorSignaturesPanel from '../InstructorSignaturesPanel';

/**
 * Las firmas de grupo se agrupan por grupo y llegan con sus firmas ya cacheadas
 * del endpoint dedicado del instructor (`api/instructor/signature_groups/:instructor_id`).
 * Los **días** a firmar NO vienen de `group.days` (el endpoint los filtra por
 * `status` activo): se toman del cronograma del instructor (`schedules`), que ya
 * se carga en el store, relacionándolos por `course_student_id`. Si 2 pilotos
 * comparten `course_group_id` → 1 formulario (1 firma por grupo por día).
 */
type Props = {
	instructor_id: number;
	schedules?: ScheduleGroupedItem[];
};

/** Ordinal (día o sesión) de un schedule del cronograma del instructor. */
const dayOfSchedule = (
	item: ScheduleGroupedItem['schedules'][number],
) => item.subject_day?.day ?? undefined;

const InstructorSignaturesTab = ({
	instructor_id,
	schedules,
}: Props) => {
	const [groups, setGroups] = useState<signatureGroup[]>([]);
	const [openGroup, setOpenGroup] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);

	const canDeleteSignature = PermissionsValidate(['staff']);

	/**
	 * course_student_id → course_group_id, para bajar los días de cada grupo
	 * desde el cronograma (los schedules vienen por alumno, no por grupo).
	 */
	const studentToGroup = useMemo(() => {
		const map = new Map<number, number>();
		groups.forEach((group) => {
			(group.course_students ?? []).forEach((cs) => {
				if (cs.id) map.set(cs.id, group.course_group_id);
			});
		});
		return map;
	}, [groups]);

	/** Días de cada grupo: unión de los `subject_day.day` de sus alumnos. */
	const daysByGroup = useMemo(() => {
		const byGroup = new Map<number, Set<number>>();
		(schedules ?? []).forEach((item) => {
			const groupId = studentToGroup.get(item.course_student_id);
			if (!groupId) return;
			const daySet = byGroup.get(groupId) ?? new Set<number>();
			item.schedules?.forEach((s) => {
				const day = dayOfSchedule(s);
				if (day !== undefined && day !== null) daySet.add(day);
			});
			byGroup.set(groupId, daySet);
		});
		return byGroup;
	}, [schedules, studentToGroup]);

	const loadGroups = useCallback(async () => {
		if (instructor_id <= 0) {
			setGroups([]);
			setLoading(false);
			return;
		}
		try {
			const { resp, status } = await axiosGetDefault(
				`api/instructor/signature_groups/${instructor_id}`,
			);
			if (status >= 200 && status < 400) {
				const data = resp.data || resp || [];
				const parsed = Array.isArray(data) ? data : [];
				console.log(
					'[InstructorSignaturesTab] parsed groups:',
					parsed,
				);
				setGroups(parsed);
			}
		} catch (error) {
			console.log(
				'[InstructorSignaturesTab] error loading groups:',
				error,
			);
			toast.error('Error al cargar los grupos');
		} finally {
			setLoading(false);
		}
	}, [instructor_id]);

	useEffect(() => {
		loadGroups();
	}, [loadGroups]);

	if (loading) return <LoadingPage />;

	console.log(
		'[InstructorSignaturesTab] schedules:',
		schedules,
		'studentToGroup:',
		studentToGroup,
		'daysByGroup:',
		daysByGroup,
	);

	const pilotNames = (group: signatureGroup) =>
		(group.course_students ?? [])
			.map((cs) =>
				`${cs.student?.name ?? ''} ${cs.student?.last_name ?? ''}`.trim(),
			)
			.filter(Boolean);

	const groupDays = (group: signatureGroup) => {
		const daySet = daysByGroup.get(group.course_group_id);
		if (!daySet || daySet.size === 0) return [];
		return [...daySet]
			.filter((day) => isWithinProgram(group.course, day))
			.sort((a, b) => a - b);
	};

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
				<div className="flex items-center gap-2">
					<PenLine size={18} className="text-blue-500" />
					<Typography
						variant="h5"
						color="blue-gray"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Firmas del instructor
					</Typography>
				</div>
				<Typography
					variant="small"
					color="gray"
					className="mt-1 mb-4"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{groups.length}{' '}
					{groups.length === 1
						? 'grupo disponible'
						: 'grupos disponibles'}
				</Typography>

				{groups.length === 0 ? (
					<Typography
						color="gray"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						No hay grupos disponibles para firmar
					</Typography>
				) : (
					<div className="flex flex-col gap-2">
						{groups.map((group) => {
							const pilots = pilotNames(group);
							return (
								<Accordion
									key={group.course_group_id}
									open={openGroup === group.course_group_id}
									className="border border-blue-gray-100 rounded-lg"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<AccordionHeader
										onClick={() =>
											setOpenGroup(
												openGroup === group.course_group_id
													? null
													: group.course_group_id,
											)
										}
										className="px-4 py-3"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<div className="flex items-center justify-between w-full pr-2">
											<div className="flex items-center gap-3">
												<Users size={18} className="text-blue-500" />
												<div className="text-left">
													<Typography
														variant="h6"
														color="blue-gray"
														className="text-sm"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{group.title}
													</Typography>
													<Typography
														variant="small"
														color="gray"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{group.course?.name ?? '-'}
													</Typography>
													{pilots.length > 0 && (
														<Typography
															variant="small"
															color="blue-gray"
															className="text-xs"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															{pilots.join(', ')}
														</Typography>
													)}
												</div>
											</div>
											<ChevronDown
												size={18}
												className={`transition-transform ${
													openGroup === group.course_group_id
														? 'rotate-180'
														: ''
												}`}
											/>
										</div>
									</AccordionHeader>
									<AccordionBody className="px-4 py-2">
										<InstructorSignaturesPanel
											groupId={group.course_group_id}
											course={group.course}
											days={groupDays(group)}
											signatures={group.signatures ?? []}
											canDelete={canDeleteSignature}
											onChanged={loadGroups}
										/>
									</AccordionBody>
								</Accordion>
							);
						})}
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default InstructorSignaturesTab;
