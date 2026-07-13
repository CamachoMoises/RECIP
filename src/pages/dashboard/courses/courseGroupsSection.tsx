import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	Button,
	Card,
	CardBody,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
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
	deleteCourseGroupSignature,
	fetchCourseGroupSignatures,
	fetchCourseGroupStudents,
	fetchCourseGroups,
	removeStudentFromGroup,
	saveCourseGroupSignature,
	toggleCourseGroupStatus,
} from '../../../features/courseGroupSlice';
import { courseGroup, courseStudent } from '../../../types/utilities';
import { PermissionsValidate } from '../../../services/permissionsValidate';
import SignatureCanvas from 'react-signature-canvas';

type Props = {
	navigateViewCourseStudent: (CS: courseStudent) => Promise<void>;
};
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
	Power,
	Filter,
	Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CourseGroupsSection = ({
	navigateViewCourseStudent,
}: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const {
		courseGroupList,
		courseGroupStudents,
		courseGroupSignatures,
		status,
		error,
	} = useSelector((state: RootState) => state.courseGroups);
	const canManage = PermissionsValidate(['staff', 'instructor']);
	const canDeleteSignature = PermissionsValidate(['staff']);

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
	const [deleteDialogGroup, setDeleteDialogGroup] =
		useState<courseGroup | null>(null);
	const [openDays, setOpenDays] = useState<Set<string>>(new Set());
	const [savingSignatureKey, setSavingSignatureKey] = useState<
		string | null
	>(null);
	const sigCanvasRefs = useRef<Map<string, SignatureCanvas>>(
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
			dispatch(fetchCourseGroupSignatures(id));
			return id;
		});
	};

	const handleDelete = async (id: number) => {
		setDeletingId(id);
		try {
			await dispatch(deleteCourseGroup(id)).unwrap();
			toast.success('Grupo eliminado');
		} catch (error: any) {
			toast.error(error?.message || 'Error al eliminar');
		} finally {
			setDeletingId(null);
			setDeleteDialogGroup(null);
		}
	};

	const confirmDelete = (group: courseGroup) => {
		setDeleteDialogGroup(group);
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

	const handleDeleteSignature = async (
		groupId: number,
		signatureId: number,
		dayNumber: number,
	) => {
		if (
			!confirm(`¿Eliminar firma ${signatureId} del día ${dayNumber}?`)
		)
			return;
		try {
			await dispatch(
				deleteCourseGroupSignature({
					groupId,
					signatureId,
				}),
			).unwrap();
			toast.success('Firma eliminada');
		} catch (error: any) {
			toast.error(error?.message || 'Error al eliminar firma');
		}
	};

	const handleSaveSignature = async (
		canvasKey: string,
		groupId: number,
		dayNumber: number,
		canvas: SignatureCanvas,
	) => {
		if (canvas.isEmpty()) {
			toast.error('Dibuja una firma primero');
			return;
		}
		setSavingSignatureKey(canvasKey);
		try {
			await dispatch(
				saveCourseGroupSignature({
					course_group_id: groupId,
					day_number: dayNumber,
					signature: canvas.toDataURL(),
				}),
			).unwrap();
			toast.success('Firma guardada correctamente');
			canvas.clear();
			dispatch(fetchCourseGroupSignatures(groupId));
		} catch (error: any) {
			toast.error(error?.message || 'Error al guardar la firma');
		} finally {
			setSavingSignatureKey(null);
		}
	};

	const handleToggleDay = (key: string) => {
		setOpenDays((prev) => {
			const next = new Set(prev);
			if (next.has(key)) {
				next.delete(key);
			} else {
				next.add(key);
			}
			return next;
		});
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
								Gestion de Grupos de Pilotos
							</Typography>
						</div>
						<div className="flex gap-2">
							<Button
								size="sm"
								variant="outlined"
								title={
									showInactive
										? 'Mostrar solo activos'
										: 'Mostrar inactivos'
								}
								color={showInactive ? 'blue' : 'gray'}
								onClick={handleToggleShowInactive}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<Filter size={14} className="mr-1" />
							</Button>
							<Button
								size="sm"
								color="blue"
								title="Crear Grupo"
								onClick={() => handleOpenModal()}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<Plus size={16} className="mr-1" />
							</Button>
						</div>
					</div>
					<hr />
					<br />
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
																		{group.course.course_level?.name})
																		({group.course.course_type?.name})
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
														<span
															role="button"
															tabIndex={0}
															title="Desactivar"
															onClick={(e) => {
																e.stopPropagation();
																handleToggleStatus(group);
															}}
															onKeyDown={(e) => {
																if (
																	e.key === 'Enter' ||
																	e.key === ' '
																) {
																	e.stopPropagation();
																	handleToggleStatus(group);
																}
															}}
															className={`p-1.5 rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 ${togglingId === group.id ? 'opacity-50 pointer-events-none' : ''} ${group.status ? 'hover:bg-orange-50 text-orange-500 focus:ring-orange-200' : 'hover:bg-green-50 text-green-500 focus:ring-green-200'}`}
														>
															<Power
																size={16}
																className={
																	group.status ? '' : 'opacity-50'
																}
															/>
														</span>
														<span
															role="button"
															title="Agregar Participantes"
															tabIndex={0}
															onClick={(e) => {
																e.stopPropagation();
																handleOpenAssignModal(group);
															}}
															onKeyDown={(e) => {
																if (
																	e.key === 'Enter' ||
																	e.key === ' '
																) {
																	e.stopPropagation();
																	handleOpenAssignModal(group);
																}
															}}
															className="p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-blue-50 text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
														>
															<UserPlus size={16} />
														</span>
														<span
															role="button"
															title="Editar Grupo"
															tabIndex={0}
															onClick={(e) => {
																e.stopPropagation();
																handleOpenModal(group);
															}}
															onKeyDown={(e) => {
																if (
																	e.key === 'Enter' ||
																	e.key === ' '
																) {
																	e.stopPropagation();
																	handleOpenModal(group);
																}
															}}
															className="p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-green-50 text-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
														>
															<Pencil size={16} />
														</span>
														<span
															role="button"
															tabIndex={0}
															title="Elimnar Grupo"
															onClick={(e) => {
																e.stopPropagation();
																confirmDelete(group);
															}}
															onKeyDown={(e) => {
																if (
																	e.key === 'Enter' ||
																	e.key === ' '
																) {
																	e.stopPropagation();
																	confirmDelete(group);
																}
															}}
															className={`p-1.5 rounded-lg cursor-pointer transition-colors hover:bg-red-50 text-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
														>
															<Trash2 size={16} />
														</span>
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
																return (
																	<ListItem
																		key={cs.id}
																		placeholder={undefined}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																		onClick={() =>
																			navigateViewCourseStudent(cs)
																		}
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
																					PC:{' '}
																					{cs.student?.user_id ||
																						'N/A'}{' '}
																				</Typography>
																			</div>
																			<IconButton
																				size="sm"
																				title="Remover participante"
																				variant="outlined"
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
													</>
												)}
												{/* Instructor Signatures por día */}
												<div className="border-t pt-3 mt-4">
													<Typography
														variant="small"
														className="font-semibold mb-3 text-center"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														Firmas del instructor por día
													</Typography>
													<div className="flex flex-col gap-1 max-w-md mx-auto">
														{Array.from(
															{ length: group.course?.days || 1 },
															(_, i) => i + 1,
														).map((day) => {
															const dayKey = `${group.id}-${day}`;
															const isOpen = openDays.has(dayKey);
															const daySignatures =
																courseGroupSignatures
																	.filter(
																		(s) =>
																			s.day_number === day &&
																			s.course_group_id === group.id,
																	)
																	.sort(
																		(a, b) =>
																			a.signature_number -
																			b.signature_number,
																	);
															const sigCount = daySignatures.length;
															const fullDay = sigCount >= 3;
															return (
																<div
																	key={`${group.id}-${day}`}
																	className="border border-gray-200 rounded"
																>
																	<button
																		type="button"
																		onClick={() =>
																			handleToggleDay(dayKey)
																		}
																		className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-left transition-colors rounded ${fullDay ? 'bg-green-50 text-green-800 hover:bg-green-100' : 'text-blue-gray-700 hover:bg-gray-50'}`}
																	>
																		<span className="flex items-center gap-2">
																			<ChevronDown
																				size={14}
																				className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${fullDay ? 'text-green-500' : 'text-gray-400'}`}
																			/>
																			Día {day}
																			{fullDay && (
																				<span className="text-xs text-green-600 font-normal">
																					✓ completo
																				</span>
																			)}
																			{sigCount > 0 && !fullDay && (
																				<span className="text-xs text-blue-600 font-normal">
																					{sigCount}/3 firmas
																				</span>
																			)}
																		</span>
																	</button>
																	{isOpen && (
																		<div className="px-3 pb-3 pt-1 flex flex-col items-center gap-3">
																			{daySignatures.map((sig) => (
																				<div
																					key={sig.id}
																					className="flex flex-col items-center gap-1 w-full"
																				>
																					<div className="flex items-center justify-between w-full max-w-xs">
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
																							Firma{' '}
																							{sig.signature_number}
																						</Typography>
																						{canDeleteSignature && (
																							<IconButton
																								size="sm"
																								title={`Eliminar firma ${sig.signature_number} del día ${day}`}
																								variant="text"
																								color="red"
																								onClick={() =>
																									handleDeleteSignature(
																										group.id,
																										sig.id,
																										day,
																									)
																								}
																								placeholder={
																									undefined
																								}
																								onPointerEnterCapture={
																									undefined
																								}
																								onPointerLeaveCapture={
																									undefined
																								}
																							>
																								<Trash2 size={14} />
																							</IconButton>
																						)}
																					</div>
																					<img
																						src={sig.signature_url}
																						alt={`Firma ${sig.signature_number} día ${day}`}
																						className="max-w-xs h-auto border rounded"
																					/>
																				</div>
																			))}
																			{!fullDay && (
																				<>
																					<div
																						className={`w-full overflow-hidden border border-gray-300 rounded ${savingSignatureKey === `${group.id}-${day}-${sigCount + 1}` ? 'pointer-events-none opacity-50' : ''}`}
																					>
																						<SignatureCanvas
																							ref={(el) => {
																								const key = `${group.id}-${day}-${sigCount + 1}`;
																								if (el)
																									sigCanvasRefs.current.set(
																										key,
																										el,
																									);
																								else
																									sigCanvasRefs.current.delete(
																										key,
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
																								const key = `${group.id}-${day}-${sigCount + 1}`;
																								const canvas =
																									sigCanvasRefs.current.get(
																										key,
																									);
																								if (canvas)
																									handleSaveSignature(
																										key,
																										group.id,
																										day,
																										canvas,
																									);
																							}}
																							disabled={
																								savingSignatureKey ===
																								`${group.id}-${day}-${sigCount + 1}`
																							}
																							placeholder={undefined}
																							onPointerEnterCapture={
																								undefined
																							}
																							onPointerLeaveCapture={
																								undefined
																							}
																							className="flex items-center gap-2"
																						>
																							<Save className="w-4 h-4" />
																							{savingSignatureKey ===
																							`${group.id}-${day}-${sigCount + 1}`
																								? 'Guardando...'
																								: `Guardar Firma ${sigCount + 1}`}
																						</Button>
																						<Button
																							size="sm"
																							color="red"
																							variant="outlined"
																							onClick={() => {
																								const key = `${group.id}-${day}-${sigCount + 1}`;
																								const canvas =
																									sigCanvasRefs.current.get(
																										key,
																									);
																								if (canvas)
																									canvas.clear();
																							}}
																							disabled={
																								savingSignatureKey ===
																								`${group.id}-${day}-${sigCount + 1}`
																							}
																							placeholder={undefined}
																							onPointerEnterCapture={
																								undefined
																							}
																							onPointerLeaveCapture={
																								undefined
																							}
																							className="flex items-center gap-2"
																						>
																							Borrar
																						</Button>
																					</div>
																				</>
																			)}
																		</div>
																	)}
																</div>
															);
														})}
													</div>
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

			<Dialog
				open={!!deleteDialogGroup}
				handler={() => setDeleteDialogGroup(null)}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Confirmar eliminación
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					¿Está seguro de eliminar el grupo{' '}
					<strong>{deleteDialogGroup?.title}</strong>? Los pilotos
					asignados quedarán sin grupo.
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Button
						variant="text"
						color="gray"
						onClick={() => setDeleteDialogGroup(null)}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						className="mr-2"
					>
						Cancelar
					</Button>
					<Button
						color="red"
						onClick={() => {
							if (deleteDialogGroup)
								handleDelete(deleteDialogGroup.id);
						}}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Eliminar
					</Button>
				</DialogFooter>
			</Dialog>

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
