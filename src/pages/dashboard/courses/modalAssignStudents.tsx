import {
	Button,
	Checkbox,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
	List,
	ListItem,
	Typography,
} from '@material-tailwind/react';
import { courseGroup } from '../../../types/utilities';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchCoursesStudents } from '../../../features/courseSlice';
import { assignStudentsToGroup } from '../../../features/courseGroupSlice';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ModalAssignStudents = ({
	group,
	open,
	handleOpen,
	onSuccess,
}: {
	group: courseGroup | null;
	open: boolean;
	handleOpen: () => void;
	onSuccess?: () => void;
}) => {
	const dispatch = useDispatch<AppDispatch>();
	const { courseStudentList } = useSelector(
		(state: RootState) => state.courses,
	);
	const { courseGroupStudents } = useSelector(
		(state: RootState) => state.courseGroups,
	);

	const [searchTerm, setSearchTerm] = useState('');
	const [selectedIds, setSelectedIds] = useState<number[]>([]);

	useEffect(() => {
		if (open) {
			dispatch(
				fetchCoursesStudents({
					currentPage: 1,
					pageSize: 200,
					status: true,
				}),
			);
			setSelectedIds([]);
			setSearchTerm('');
		}
	}, [open, dispatch]);

	const assignedIds = new Set(courseGroupStudents.map(s => s.id));

	const availableStudents = (courseStudentList || []).filter(
		(cs) =>
			!assignedIds.has(cs.id) &&
			!cs.courseGroupId &&
			(group?.course_id ? cs.course_id === group.course_id : true) &&
			(cs.student?.user?.name
				? `${cs.student.user.name} ${cs.student.user.last_name}`
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
				  cs.code.toLowerCase().includes(searchTerm.toLowerCase())
				: cs.code.toLowerCase().includes(searchTerm.toLowerCase())),
	);

	const toggleSelect = (id: number) => {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
		);
	};

	const selectAll = () => {
		if (selectedIds.length === availableStudents.length) {
			setSelectedIds([]);
		} else {
			setSelectedIds(availableStudents.map((s) => s.id));
		}
	};

	const handleAssign = async () => {
		if (!group || selectedIds.length === 0 || !group.course_id) return;
		try {
			await dispatch(
				assignStudentsToGroup({ 
					groupId: group.id, 
					courseStudentIds: selectedIds,
					course_id: group.course_id,
				}),
			).unwrap();
			toast.success(`${selectedIds.length} piloto(s) asignado(s)`);
			if (onSuccess) onSuccess();
			handleOpen();
		} catch (error: any) {
			toast.error(error?.message || 'Error al asignar pilotos');
		}
	};

	return (
		<Dialog
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			open={open}
			handler={handleOpen}
			size="md"
			className="max-h-[80vh]"
		>
			<DialogHeader
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Agregar Pilotos a {group?.title}
			</DialogHeader>
			<DialogBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="overflow-y-auto max-h-[50vh]"
			>
				<div className="flex flex-col gap-3">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
						<Input
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							type="text"
							label="Buscar por nombre o código"
							placeholder="Buscar..."
							className="pl-10 bg-slate-400 rounded-md text-slate-900"
							crossOrigin={undefined}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					{availableStudents.length === 0 ? (
						<Typography
							variant="small"
							color="gray"
							className="text-center py-4"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{searchTerm
								? 'Sin resultados'
								: 'No hay pilotos disponibles'}
						</Typography>
					) : (
						<>
							<div className="flex items-center justify-between px-2">
								<Typography
									variant="small"
									color="gray"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{availableStudents.length} disponible(s)
								</Typography>
								<Button
									size="sm"
									variant="text"
									color="blue"
									onClick={selectAll}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{selectedIds.length === availableStudents.length
										? 'Deseleccionar todos'
										: 'Seleccionar todos'}
								</Button>
							</div>
							<List
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								className="max-h-[30vh] overflow-y-auto"
							>
								{availableStudents.map((cs) => {
									const isSelected = selectedIds.includes(cs.id);
									const studentName = cs.student?.user
										? `${cs.student.user.name} ${cs.student.user.last_name}`
										: 'Sin Piloto';
									return (
										<ListItem
											key={cs.id}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											className={`cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
											onClick={() => toggleSelect(cs.id)}
										>
											<div className="flex items-center gap-3 w-full">
												<Checkbox
													crossOrigin={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													checked={isSelected}
													onChange={() => toggleSelect(cs.id)}
													color="blue"
												/>
												<div className="min-w-0 flex-1">
													<Typography
														variant="small"
														color="blue-gray"
														className="font-medium truncate"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{studentName}
													</Typography>
													<Typography
														variant="small"
														color="gray"
														className="text-xs"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{cs.code} — {cs.course?.name}
													</Typography>
												</div>
											</div>
										</ListItem>
									);
								})}
							</List>
						</>
					)}
				</div>
			</DialogBody>
			<DialogFooter
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Button
					variant="text"
					color="red"
					onClick={handleOpen}
					className="mr-1"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<span>Cancelar</span>
				</Button>
				<Button
					variant="gradient"
					color="blue"
					onClick={handleAssign}
					disabled={selectedIds.length === 0}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<span>
						Asignar ({selectedIds.length})
					</span>
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default ModalAssignStudents;
