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
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import {
	deleteCourseGroup,
	fetchCourseGroupStudents,
	fetchCourseGroups,
	removeStudentFromGroup,
	saveCourseGroupSignature,
	toggleCourseGroupStatus,
} from '../../../features/courseGroupSlice';
import { courseGroup } from '../../../types/utilities';
import { PermissionsValidate } from '../../../services/permissionsValidate';
import SignatureCanvas from 'react-signature-canvas';
import ModalFormCourseGroup from './modalFormCourseGroup';
import ModalAssignStudents from './modalAssignStudents';
import {
	Calendar,
	Plus,
	Pencil,
	Trash2,
	UserPlus,
	UserMinus,
	ChevronDown,
	Code,
	Power,
	Filter,
	Save,
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
	const [togglingId, setTogglingId] = useState<number | null>(null);
	const [showInactive, setShowInactive] = useState(false);
	const [savingSignatureId, setSavingSignatureId] = useState<
		number | null
	>(null);
	const sigCanvasRefs = useRef<Map<number, SignatureCanvas>>(
		new Map(),
	);

	useEffect(() => {
		if (canManage) {
			dispatch(
				fetchCourseGroups({
					status: showInactive ? undefined : true,
				}),
			).catch(() => {});
		}
	}, [dispatch, canManage, showInactive]);

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
		dispatch(
			fetchCourseGroups({ status: showInactive ? undefined : true }),
		);
		if (openAccordion) {
			dispatch(fetchCourseGroupStudents(openAccordion));
		}
	};

	const handleToggleStatus = async (group: courseGroup) => {
		const newStatus = !group.status;
		setTogglingId(group.id);
		try {
			await dispatch(
				toggleCourseGroupStatus({ id: group.id, status: newStatus }),
			).unwrap();
			toast.success(
				newStatus ? 'Grupo activado' : 'Grupo desactivado',
			);
			dispatch(
				fetchCourseGroups({
					status: showInactive ? undefined : true,
				}),
			);
		} catch (error: any) {
			toast.error(error?.message || 'Error al cambiar estado');
		} finally {
			setTogglingId(null);
		}
	};

	const handleSaveSignature = async (
		groupId: number,
		canvas: SignatureCanvas,
	) => {
		if (canvas.isEmpty()) {
			toast.error('Dibuja una firma primero');
			return;
		}
		setSavingSignatureId(groupId);
		try {
			await dispatch(
				saveCourseGroupSignature({
					course_group_id: groupId,
					signature: canvas.toDataURL(),
				}),
			).unwrap();
			toast.success('Firma guardada correctamente');
			canvas.clear();
		} catch (error: any) {
			toast.error(error?.message || 'Error al guardar la firma');
		} finally {
			setSavingSignatureId(null);
		}
	};

	const handleToggleShowInactive = () => {
		setShowInactive((prev) => !prev);
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
						<div className="flex gap-3">
							<Typography
								variant="h5"
								className="text-center lg:text-left text-sm sm:text-base md:text-lg"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Grupos de Pilotos por curso
							</Typography>
						</div>
						<div className="flex gap-2">
							<Button
								size="sm"
								variant="outlined"
								color={showInactive ? 'blue' : 'gray'}
								onClick={handleToggleShowInactive}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<Filter size={14} className="mr-1" />
								{showInactive ? 'Ver activos' : 'Ver inactivos'}
							</Button>
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
							No hay grupos activos, crea uno para organizar los
							pilotos.
						</Typography>
					) : (
						<div className="flex flex-col gap-2">
							{courseGroupList.map((group) => {
								const isOpen = openAccordion === group.id;
								const isDeleting = deletingId === group.id;
								const isInactive = group.status === false;
								const groupDate = group.date
									? new Date(group.date)
									: null;
								return (
									<Card
										key={group.id}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										className={`border border-gray-200 ${isDeleting ? 'opacity-50' : ''} ${isInactive ? 'bg-gray-50' : ''}`}
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
															<div className="flex items-center gap-2">
																<Typography
																	variant="small"
																	color="blue-gray"
																	className="font-semibold truncate"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	{group.title} - ({group.user_code})
																</Typography>
																{isInactive && (
																	<span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded-full">
																		Inactivo
																	</span>
																)}
															</div>
															<div className="flex items-center gap-3 text-xs text-gray-500">
																{group.course && (
																	<span className="flex items-center gap-1">
																		<Calendar size={12} />
																		{group.course.name} (
																		{group.course.course_level.name})
																		({group.course.course_type.name})
																	</span>
																)}
																{groupDate && (
																	<span className="flex items-center gap-1">
																		<Calendar size={12} />
																		{groupDate.toLocaleDateString(
																			'es-ES',
																		)}
																	</span>
																)}
																<small className="flex items-center gap-1">
																	{group.code}
																</small>
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
															color={
																group.status ? 'orange' : 'green'
															}
															onClick={() =>
																handleToggleStatus(group)
															}
															disabled={togglingId === group.id}
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															<Power
																size={16}
																className={
																	group.status ? '' : 'opacity-50'
																}
															/>
														</IconButton>
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
													<>
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
																const isRemoving =
																	removingId === cs.id;
																console.log('Student info:', cs); // Debugging line
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
																					{studentName}{' '}
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
																					Id:{' '}
																					{cs.student?.id || 'N/A'} /{' '}
																					{cs.code}
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
														</List>
														<div className="flex justify-center items-center mt-3">
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
																className="w-auto"
															>
																Agregar más pilotos
															</Button>
														</div>
													</>
												)}
												{/* Instructor Signature */}
												<div className="border-t pt-3 mt-4 flex flex-col items-center">
													<Typography
														variant="small"
														className="font-semibold mb-2"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														Firma del instructor
													</Typography>
													{group.signature_url ? (
														<img
															src={group.signature_url}
															alt="Firma del instructor"
															className="max-w-xs h-auto border rounded"
														/>
													) : (
														<div className="flex flex-col items-center gap-2 w-full max-w-md">
															<div
																className={`w-full overflow-hidden border border-gray-300 rounded ${savingSignatureId === group.id ? 'pointer-events-none opacity-50' : ''}`}
															>
																<SignatureCanvas
																	ref={(el) => {
																		if (el)
																			sigCanvasRefs.current.set(
																				group.id,
																				el,
																			);
																		else
																			sigCanvasRefs.current.delete(
																				group.id,
																			);
																	}}
																	penColor="black"
																	canvasProps={{
																		width: 500,
																		height: 120,
																		style: {
																			width: '100%',
																			height: '120px',
																			display: 'block',
																		},
																	}}
																/>
															</div>
															<div className="flex items-center gap-2">
																<Button
																	size="sm"
																	color="green"
																	onClick={() => {
																		const canvas =
																			sigCanvasRefs.current.get(
																				group.id,
																			);
																		if (canvas)
																			handleSaveSignature(
																				group.id,
																				canvas,
																			);
																	}}
																	disabled={
																		savingSignatureId === group.id
																	}
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																	className="flex items-center gap-2"
																>
																	<Save className="w-4 h-4" />
																	{savingSignatureId === group.id
																		? 'Guardando...'
																		: 'Guardar Firma'}
																</Button>
																<Button
																	size="sm"
																	color="red"
																	variant="outlined"
																	onClick={() => {
																		const canvas =
																			sigCanvasRefs.current.get(
																				group.id,
																			);
																		if (canvas) canvas.clear();
																	}}
																	disabled={
																		savingSignatureId === group.id
																	}
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																	className="flex items-center gap-2"
																>
																	Borrar
																</Button>
															</div>
														</div>
													)}
												</div>
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
