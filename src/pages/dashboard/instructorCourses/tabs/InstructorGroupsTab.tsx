import { useEffect, useState } from 'react';
import { axiosGetDefault } from '../../../../services/axios';
import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	Card,
	CardBody,
	Typography,
	Chip,
} from '@material-tailwind/react';
import { ChevronDown, Users, User } from 'lucide-react';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import { courseGroup } from '../../../../types/utilities';
import { GROUPS_PAGE_SIZE } from './instructorShared';

/**
 * Los grupos se piden **solo por `instructor_id`**: `api/course_groups` ignora
 * `course_id` cuando viene `instructor_id` (el repository reemplaza el filtro
 * por la lista de cursos del instructor), así que el recorte por curso se
 * aplica en cliente.
 */
type Props = {
	instructor_id: number;
	courseId?: number | null;
};

const InstructorGroupsTab = ({ instructor_id, courseId }: Props) => {
	const [groups, setGroups] = useState<courseGroup[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [openAccordion, setOpenAccordion] = useState<number | null>(null);

	useEffect(() => {
		const loadGroups = async () => {
			if (instructor_id <= 0) {
				setLoading(false);
				return;
			}
			setLoading(true);
			setError(null);
			try {
				const { resp, status } = await axiosGetDefault(
					'api/course_groups',
					{
						instructor_id,
						status: true,
						pageSize: GROUPS_PAGE_SIZE,
					},
				);
				if (status >= 200 && status < 400) {
					const data = resp.data || resp || [];
					setGroups(Array.isArray(data) ? data : []);
				} else {
					setError('Error al cargar los grupos');
				}
			} catch {
				setError('Error al conectar con el servidor');
			} finally {
				setLoading(false);
			}
		};
		loadGroups();
	}, [instructor_id]);

	if (loading) return <LoadingPage />;
	if (error) return <ErrorPage error={error} />;

	const visible = courseId
		? groups.filter((g) => g.course_id === courseId)
		: groups;

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
					Grupos
				</Typography>

				{visible.length === 0 ? (
					<Typography
						color="gray"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						No hay grupos registrados
					</Typography>
				) : (
					<div className="flex flex-col gap-2">
						{visible.map((group) => (
							<Accordion
								key={group.id}
								open={openAccordion === group.id}
								className="border border-blue-gray-100 rounded-lg"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<AccordionHeader
									onClick={() =>
										setOpenAccordion(
											openAccordion === group.id
												? null
												: group.id,
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
													{group.title}
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
													Código: {group.code}
													{group.course?.name
														? ` · ${group.course.name}`
														: ''}
												</Typography>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Chip
												size="sm"
												variant="ghost"
												color={group.status ? 'green' : 'red'}
												value={`${group.course_students?.length || 0} alumnos`}
											/>
											<ChevronDown
												size={18}
												className={`transition-transform ${
													openAccordion === group.id
														? 'rotate-180'
														: ''
												}`}
											/>
										</div>
									</div>
								</AccordionHeader>
								<AccordionBody className="px-4 py-2">
									{!group.course_students ||
									group.course_students.length === 0 ? (
										<Typography
											color="gray"
											variant="small"
											placeholder={undefined}
											onPointerEnterCapture={
												undefined
											}
											onPointerLeaveCapture={
												undefined
											}
										>
											Sin alumnos asignados
										</Typography>
									) : (
										<div className="flex flex-col gap-1">
											<table className="w-full">
												<thead>
													<tr>
														<th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 border-b border-blue-gray-50">
															Alumno
														</th>
														<th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 border-b border-blue-gray-50">
															Código
														</th>
														<th className="py-2 px-3 text-center text-xs font-semibold text-gray-500 border-b border-blue-gray-50">
															Estatus
														</th>
													</tr>
												</thead>
												<tbody>
													{group.course_students.map((cs) => (
														<tr
															key={cs.id}
															className="hover:bg-blue-gray-50/50"
														>
															<td className="py-2 px-3 text-sm border-b border-blue-gray-50">
																<div className="flex items-center gap-2">
																	<User
																		size={14}
																		className="text-gray-400"
																	/>
																	{cs.student
																		?.user
																		? `${cs.student.user.name} ${cs.student.user.last_name}`
																		: '-'}
																</div>
															</td>
															<td className="py-2 px-3 text-sm text-gray-500 border-b border-blue-gray-50">
																{cs.code}
															</td>
															<td className="py-2 px-3 text-center border-b border-blue-gray-50">
																<Chip
																	size="sm"
																	variant="ghost"
																	color={
																		cs.status
																			? 'green'
																			: 'red'
																	}
																	value={
																		cs.status
																			? 'Activo'
																			: 'Inactivo'
																	}
																/>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}
								</AccordionBody>
							</Accordion>
						))}
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default InstructorGroupsTab;
