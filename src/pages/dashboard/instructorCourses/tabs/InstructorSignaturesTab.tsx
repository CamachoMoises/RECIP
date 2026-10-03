import { useCallback, useEffect, useState } from 'react';
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
import { course } from '../../../../types/utilities';
import { PermissionsValidate } from '../../../../services/permissionsValidate';
import InstructorSignaturesPanel from '../InstructorSignaturesPanel';
import {
	buildCourseCatalog,
	GROUPS_PAGE_SIZE,
	isTheoreticalCourse,
} from './instructorShared';

/**
 * Las firmas de grupo se firman por curso, así que los grupos se piden **solo
 * por `instructor_id`**: `api/course_groups` reemplaza `course_id` por la lista
 * de cursos del instructor cuando el filtro es por instructor. `courseId` es un
 * recorte de pantalla.
 */
type Props = {
	instructor_id: number;
	courses?: course[] | null;
	courseId?: number | null;
};

const InstructorSignaturesTab = ({
	instructor_id,
	courses,
	courseId,
}: Props) => {
	const [groups, setGroups] = useState<{
		id: number;
		title: string;
		code: string;
		course_id: number | null;
		course?: course | null;
	}[]>([]);
	const [openGroup, setOpenGroup] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);

	const canDeleteSignature = PermissionsValidate(['staff']);
	const catalog = buildCourseCatalog(courses);

	const loadGroups = useCallback(async () => {
		if (instructor_id <= 0) {
			setGroups([]);
			setLoading(false);
			return;
		}
		try {
			const { resp, status } = await axiosGetDefault('api/course_groups', {
				instructor_id,
				status: true,
				pageSize: GROUPS_PAGE_SIZE,
			});
			if (status >= 200 && status < 400) {
				const data = resp.data || resp || [];
				setGroups(Array.isArray(data) ? data : []);
			}
		} catch {
			toast.error('Error al cargar los grupos');
		} finally {
			setLoading(false);
		}
	}, [instructor_id]);

	useEffect(() => {
		loadGroups();
	}, [loadGroups]);

	if (loading) return <LoadingPage />;

	const resolveGroupCourse = (
		group: (typeof groups)[number],
	): course | null =>
		group.course ?? catalog.get(group.course_id ?? -1) ?? null;

	// Los grupos se firman fuera del listado de pilotos, por eso no se usan los
	// alumnos: solo los grupos del instructor que el panel puede dibujar.
	const visibleGroups = groups
		.filter((g) => (courseId ? g.course_id === courseId : true))
		.filter((g) => !isTheoreticalCourse(resolveGroupCourse(g)));

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
					{visibleGroups.length}{' '}
					{visibleGroups.length === 1
						? 'grupo disponible'
						: 'grupos disponibles'}
				</Typography>

				{visibleGroups.length === 0 ? (
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
						{visibleGroups.map((group) => {
							const groupCourse = resolveGroupCourse(group);
							return (
								<Accordion
									key={group.id}
									open={openGroup === group.id}
									className="border border-blue-gray-100 rounded-lg"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<AccordionHeader
										onClick={() =>
											setOpenGroup(
												openGroup === group.id ? null : group.id,
											)
										}
										className="px-4 py-3"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<div className="flex items-center justify-between w-full pr-2">
											<div className="flex items-center gap-3">
												<Users
													size={18}
													className="text-blue-500"
												/>
												<div className="text-left">
													<Typography
														variant="h6"
														color="blue-gray"
														className="text-sm"
														placeholder={undefined}
														onPointerEnterCapture={
															undefined
														}
														onPointerLeaveCapture={
															undefined
														}
													>
														{group.title} - ({group.code})
													</Typography>
													<Typography
														variant="small"
														color="gray"
														placeholder={undefined}
														onPointerEnterCapture={
															undefined
														}
														onPointerLeaveCapture={
															undefined
														}
													>
														{groupCourse?.name ?? '-'}
													</Typography>
												</div>
											</div>
											<ChevronDown
												size={18}
												className={`transition-transform ${
													openGroup === group.id
														? 'rotate-180'
														: ''
												}`}
											/>
										</div>
									</AccordionHeader>
									<AccordionBody className="px-4 py-2">
										<InstructorSignaturesPanel
											groupId={group.id}
											course={groupCourse}
											canDelete={canDeleteSignature}
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
