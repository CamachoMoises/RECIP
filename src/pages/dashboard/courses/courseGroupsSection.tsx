import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	Button,
	Card,
	CardBody,
	IconButton,
	List,
	ListItem,
	Typography,
} from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import {
	deleteCourseGroup,
	fetchCourseGroupStudents,
	fetchCourseGroups,
	removeStudentFromGroup,
} from '../../../features/courseGroupSlice';
import { courseGroup } from '../../../types/utilities';
import { PermissionsValidate } from '../../../services/permissionsValidate';
import ModalFormCourseGroup from './modalFormCourseGroup';
import ModalAssignStudents from './modalAssignStudents';
import {
	Calendar,
	Plus,
	Users,
	Pencil,
	Trash2,
	UserPlus,
	UserMinus,
	ChevronDown,
	Code,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CourseGroupsSection = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { courseGroupList, courseGroupStudents, status, error } =
		useSelector((state: RootState) => state.courseGroups);
	const canManage = PermissionsValidate(['staff', 'instructor']);

	const [openAccordion, setOpenAccordion] = useState<number | null>(
		null,
	);
	const [modalOpen, setModalOpen] = useState(false);
	const [assignModalOpen, setAssignModalOpen] = useState(false);
	const [editingGroup, setEditingGroup] =
		useState<courseGroup | null>(null);
	const [activeGroup, setActiveGroup] = useState<courseGroup | null>(
		null,
	);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [removingId, setRemovingId] = useState<number | null>(null);

	useEffect(() => {
		if (canManage) {
			dispatch(fetchCourseGroups({})).catch(() => {});
		}
	}, [dispatch, canManage]);

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	const handleOpenModal = (group?: courseGroup | null) => {
		setEditingGroup(group || null);
		setModalOpen((prev) => !prev);
	};

	const handleOpenAssignModal = (group: courseGroup) => {
		setActiveGroup(group);
		setAssignModalOpen(true);
	};

	const handleToggleAccordion = (id: number) => {
		setOpenAccordion((prev) => {
			if (prev === id) {
				return null;
			}
			dispatch(fetchCourseGroupStudents(id));
			return id;
		});
	};

	const handleDelete = async (id: number) => {
		if (
			!confirm(
				'¿Está seguro de eliminar este grupo? Los pilotos asignados quedarán sin grupo.',
			)
		)
			return;
		setDeletingId(id);
		try {
			await dispatch(deleteCourseGroup(id)).unwrap();
			toast.success('Grupo eliminado');
		} catch (error: any) {
			toast.error(error?.message || 'Error al eliminar');
		} finally {
			setDeletingId(null);
		}
	};

	const handleRemoveStudent = async (courseStudentId: number) => {
		if (!openAccordion) return;
		setRemovingId(courseStudentId);
		try {
			await dispatch(
				removeStudentFromGroup({
					groupId: openAccordion,
					courseStudentId,
				}),
			).unwrap();
			toast.success('Piloto removido del grupo');
			dispatch(fetchCourseGroupStudents(openAccordion));
		} catch (error: any) {
			toast.error(error?.message || 'Error al remover');
		} finally {
			setRemovingId(null);
		}
	};

	const handleSuccess = () => {
		dispatch(fetchCourseGroups({}));
		if (openAccordion) {
			dispatch(fetchCourseGroupStudents(openAccordion));
		}
	};
	if (!canManage) return null;

	return (
		<>
			<Card
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="mt-4"
			>
				<CardBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
						<Typography
							variant="h5"
							color="blue-gray"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Grupos de Cursos
						</Typography>
						<Button
							size="sm"
							color="blue"
							onClick={() => handleOpenModal()}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Plus size={16} className="mr-1" />
							Crear Grupo
						</Button>
					</div>

					{!Array.isArray(courseGroupList) ||
					courseGroupList.length === 0 ? (
						<Typography
							variant="small"
							color="gray"
							className="text-center py-6"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							No hay grupos creados. Crea uno para organizar pilotos.
						</Typography>
					) : (
						<div className="flex flex-col gap-2">
							{courseGroupList.map((group) => {
								const isOpen = openAccordion === group.id;
								const studentCount = isOpen
									? courseGroupStudents.length
									: (group.course_students?.length ?? 0);
								const isDeleting = deletingId === group.id;

								return (
									<Card
										key={group.id}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										className={`border border-gray-200 ${isDeleting ? 'opacity-50' : ''}`}
									>
										<Accordion
											open={isOpen}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											className="p-0 shadow-none"
										>
											<AccordionHeader
												onClick={() =>
													handleToggleAccordion(group.id)
												}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												className="border-none py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
											>
												<div className="flex items-center justify-between w-full">
													<div className="flex items-center gap-3 min-w-0">
														<ChevronDown
															size={18}
															className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
														/>
														<div className="min-w-0">
															<Typography
																variant="small"
																color="blue-gray"
																className="font-semibold truncate"
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																{group.title}
															</Typography>
															<div className="flex items-center gap-3 text-xs text-gray-500">
																<span className="flex items-center gap-1">
																	<Code size={12} />
																	{group.code}
																</span>
																{group.course && (
																	<span className="flex items-center gap-1">
																		<Calendar size={12} />
																		{group.course.name}
																	</span>
																)}
																{group.date && (
																	<span className="flex items-center gap-1">
																		<Calendar size={12} />
																		{group.date.split('T')[0]}
																	</span>
																)}
																<span className="flex items-center gap-1">
																	<Users size={12} />
																	{studentCount} piloto(s)
																</span>
															</div>
														</div>
													</div>
													<div
														className="flex items-center gap-1 shrink-0"
														onClick={(e) => e.stopPropagation()}
													>
														<IconButton
															size="sm"
															variant="text"
															color="blue"
															onClick={() =>
																handleOpenAssignModal(group)
															}
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															<UserPlus size={16} />
														</IconButton>
														<IconButton
															size="sm"
															variant="text"
															color="green"
															onClick={() => handleOpenModal(group)}
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															<Pencil size={16} />
														</IconButton>
														<IconButton
															size="sm"
															variant="text"
															color="red"
															onClick={() => handleDelete(group.id)}
															disabled={isDeleting}
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															<Trash2 size={16} />
														</IconButton>
													</div>
												</div>
											</AccordionHeader>
											<AccordionBody
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
												className="pt-0 pb-3 px-4"
											>
												{status === 'loading' &&
												openAccordion === group.id ? (
													<Typography
														variant="small"
														color="gray"
														className="text-center py-4"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														Cargando pilotos...
													</Typography>
												) : courseGroupStudents.length === 0 ? (
													<div className="flex flex-col items-center py-4 gap-2">
														<Typography
															variant="small"
															color="gray"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															No hay pilotos en este grupo
														</Typography>
														<Button
															size="sm"
															variant="outlined"
															color="blue"
															onClick={() =>
																handleOpenAssignModal(group)
															}
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															<UserPlus size={14} className="mr-1" />
															Agregar Pilotos
														</Button>
													</div>
												) : (
													<List
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
														className="p-0"
													>
														{courseGroupStudents.map((cs) => {
															const studentName = cs.student?.user
																? `${cs.student.user.name} ${cs.student.user.last_name}`
																: 'Sin Piloto';
															const isRemoving = removingId === cs.id;
															return (
																<ListItem
																	key={cs.id}
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																	className={`py-2 px-3 ${isRemoving ? 'opacity-50' : ''}`}
																>
																	<div className="flex items-center justify-between w-full">
																		<div className="min-w-0 flex-1">
																			<Typography
																				variant="small"
																				color="blue-gray"
																				className="font-medium truncate"
																				placeholder={undefined}
																				onPointerEnterCapture={
																					undefined
																				}
																				onPointerLeaveCapture={
																					undefined
																				}
																			>
																				{studentName}
																			</Typography>
																			<Typography
																				variant="small"
																				color="gray"
																				className="text-xs truncate"
																				placeholder={undefined}
																				onPointerEnterCapture={
																					undefined
																				}
																				onPointerLeaveCapture={
																					undefined
																				}
																			>
																				{cs.code} — {cs.course?.name}
																			</Typography>
																		</div>
																		<IconButton
																			size="sm"
																			variant="text"
																			color="red"
																			onClick={() =>
																				handleRemoveStudent(cs.id)
																			}
																			disabled={isRemoving}
																			placeholder={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		>
																			<UserMinus size={14} />
																		</IconButton>
																	</div>
																</ListItem>
															);
														})}
														<ListItem
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
															className="py-2 px-3"
														>
															<Button
																fullWidth
																size="sm"
																variant="outlined"
																color="blue"
																onClick={() =>
																	handleOpenAssignModal(group)
																}
																placeholder={undefined}
																onPointerEnterCapture={undefined}
																onPointerLeaveCapture={undefined}
															>
																<UserPlus
																	size={14}
																	className="mr-1"
																/>
																Agregar más pilotos
															</Button>
														</ListItem>
													</List>
												)}
											</AccordionBody>
										</Accordion>
									</Card>
								);
							})}
						</div>
					)}
				</CardBody>
			</Card>

			<ModalFormCourseGroup
				courseGroupSelected={editingGroup}
				open={modalOpen}
				handleOpen={handleOpenModal}
				onSuccess={handleSuccess}
			/>

			<ModalAssignStudents
				group={activeGroup}
				open={assignModalOpen}
				handleOpen={() => setAssignModalOpen(false)}
				onSuccess={handleSuccess}
			/>
		</>
	);
};

export default CourseGroupsSection;
