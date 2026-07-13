import {
	Button,
	Card,
	CardBody,
	List,
	IconButton,
	ListItem,
	Typography,
	Dialog,
	DialogHeader,
	DialogBody,
	DialogFooter,
} from '@material-tailwind/react';
import { course, courseStudent } from '../../../types/utilities';
import {
	Eye,
	Pencil,
	Power,
	Trash2,
	ChevronLeft,
	ChevronRight,
	X,
	Filter,
	CheckCircle,
	XCircle,
} from 'lucide-react';
import { useState } from 'react';

type Props = {
	courseStudentList: courseStudent[] | null | undefined;
	canViewContent: boolean;
	navigateViewCourseStudent: (CS: courseStudent) => Promise<void>;
	navigateCourseStudent: (CS: courseStudent) => Promise<void>;
	handleToggleStatus: (
		courseStudentId: number,
		currentStatus: boolean,
	) => Promise<void>;
	togglingId: number | null;
	isAdmin: boolean;
	totalPages: number;
	totalItems: number;
	pages: { id: number; name: string }[];
	active: number;
	prev: () => Promise<void> | void;
	next: () => Promise<void> | void;
	statusFilter: boolean | undefined;
	setStatusFilter: (v: boolean | undefined) => void;
	courseFilter: string | undefined;
	setCourseFilter: (v: string | undefined) => void;
	courseList: course[];
	onClearFilters: () => void;
	getItemProps: (index: number) => any;
};

const CourseStudentsSection = ({
	courseStudentList,
	canViewContent,
	navigateViewCourseStudent,
	navigateCourseStudent,
	handleToggleStatus,
	togglingId,
	isAdmin,
	totalPages,
	totalItems,
	pages,
	active,
	prev,
	next,
	statusFilter,
	setStatusFilter,
	courseFilter,
	setCourseFilter,
	courseList,
	onClearFilters,
	getItemProps,
}: Props) => {
	const [open, setOpen] = useState(true);
	const [selectedStudent, setSelectedStudent] =
		useState<courseStudent | null>(null);
	const [openDialog, setOpenDialog] = useState(false);

	const handleOpenDialog = (student: courseStudent) => {
		setSelectedStudent(student);
		setOpenDialog(true);
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setSelectedStudent(null);
	};
	return (
		<div className="flex flex-col pt-4">
			<Card
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<CardBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Typography
						variant="h5"
						className="text-center lg:text-left text-sm sm:text-base md:text-lg mb-4"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Gestion de Cronogramas por Piloto
					</Typography>
					<Typography
						placeholder={undefined}
						variant="h6"
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Filtros
					</Typography>
					{canViewContent && (
						<>
							<div className="flex flex-wrap justify-center gap-1">
								<Button
									size="sm"
									variant={
										statusFilter === undefined ? 'filled' : 'outlined'
									}
									color="blue"
									title="Todos"
									onClick={() => setStatusFilter(undefined)}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									className="flex items-center gap-1"
								>
									<Filter size={14} />
								</Button>
								<Button
									size="sm"
									variant={
										statusFilter === true ? 'filled' : 'outlined'
									}
									color="green"
									title="Activos"
									onClick={() => setStatusFilter(true)}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									className="flex items-center gap-1"
								>
									<CheckCircle size={14} />
								</Button>
								<Button
									size="sm"
									variant={
										statusFilter === false ? 'filled' : 'outlined'
									}
									color="red"
									title="Inactivos"
									onClick={() => setStatusFilter(false)}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									className="flex items-center gap-1"
								>
									<XCircle size={14} />
								</Button>
								<select
									value={courseFilter ?? ''}
									onChange={(e) =>
										setCourseFilter(e.target.value || undefined)
									}
									className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white w-48"
								>
									<option value="">Todos los cursos</option>
									{courseList.map((c: course) => (
										<option key={c.id} value={c.id!.toString()}>
											{c.name} ({c.course_level?.name} /{' '}
											{c.course_type?.name})
										</option>
									))}
								</select>
								{(statusFilter !== true ||
									courseFilter !== undefined) && (
									<Button
										color="gray"
										variant="outlined"
										title="Limpiar filtros"
										onClick={onClearFilters}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										className="p-2"
									>
										<Trash2 size={16} />
									</Button>
								)}
							</div>
						</>
					)}
					<br />
					<hr />

					{!courseStudentList || courseStudentList.length === 0 ? (
						<>
							<Typography
								variant="h2"
								color="blue-gray"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Sin pilotos agendados
							</Typography>
						</>
					) : (
						<List
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{courseStudentList.map((CL) => (
								<ListItem
									key={`${CL.id}.courseList`}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									onClick={() => handleOpenDialog(CL)}
									className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 ${CL.status === false ? 'opacity-50' : ''}`}
								>
									<div className="min-w-0">
										<Typography
											variant="h6"
											color="blue-gray"
											className="truncate max-w-[150px] sm:max-w-none"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{CL.student?.user?.name
												? `${CL.student.user.name} ${CL.student.user.last_name}`
												: 'Sin Piloto'}
										</Typography>
										<Typography
											variant="small"
											color="gray"
											className="font-normal truncate max-w-[200px] sm:max-w-none"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{CL.course?.name}{' '}
											<span className="text-xs">
												({CL.course?.course_level?.name}-
												{CL.course?.course_type?.name})
											</span>
										</Typography>
										<Typography
											variant="small"
											color="gray"
											className="font-normal"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											PC:{CL.student?.user_id}
										</Typography>
										{CL.course_group_id ? (
											<Typography
												variant="small"
												color="green"
												className="font-normal mt-1"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Con grupo
											</Typography>
										) : (
											<Typography
												variant="small"
												color="red"
												className="font-normal mt-1"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Sin grupo asignado
											</Typography>
										)}
										{CL.instructor_code && (
											<Typography
												variant="small"
												color="blue-gray"
												className="font-normal mt-1"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Código: {CL.instructor_code}
											</Typography>
										)}
									</div>
									<div
										onClick={(e) => e.stopPropagation()}
										className="flex items-center gap-1 sm:gap-2 shrink-0"
									>
										<IconButton
											variant="text"
											color="blue"
											title="Detalles"
											onClick={() => handleOpenDialog(CL)}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											<Eye className="h-4 w-4" />
										</IconButton>
										{isAdmin && (
											<IconButton
												variant="text"
												color="green"
												title="Editar cornograma"
												onClick={() => {
													if (CL.status !== false) {
														navigateCourseStudent(CL);
													}
												}}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												<Pencil className="h-4 w-4" />
											</IconButton>
										)}
										{isAdmin && (
											<IconButton
												title={
													CL.status === false
														? 'Activar'
														: 'Desactivar'
												}
												variant={
													CL.status === false ? 'filled' : 'text'
												}
												color={
													CL.status === false ? 'green' : 'orange'
												}
												onClick={() =>
													handleToggleStatus(
														CL.id,
														CL.status !== false,
													)
												}
												disabled={togglingId === CL.id}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{CL.status === false ? (
													<Power className="h-4 w-4" />
												) : (
													<Power className="h-4 w-4" />
												)}
											</IconButton>
										)}
									</div>
								</ListItem>
							))}
						</List>
					)}

					{selectedStudent && (
						<Dialog
							open={openDialog}
							handler={handleCloseDialog}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<DialogHeader
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<div className="flex justify-between items-center w-full">
									<Typography
										variant="h5"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{selectedStudent?.student?.user?.name
											? `${selectedStudent.student.user.name} ${selectedStudent.student.user.last_name}`
											: 'Detalle del Piloto'}
									</Typography>
									<IconButton
										variant="text"
										color="red"
										onClick={handleCloseDialog}
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<X className="h-4 w-4" />
									</IconButton>
								</div>
							</DialogHeader>
							<DialogBody
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<div className="space-y-3">
									<div>
										<Typography
											variant="small"
											color="gray"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Curso:
										</Typography>
										<Typography
											variant="paragraph"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{selectedStudent.course?.name} (
											{selectedStudent.course?.course_level?.name}-
											{selectedStudent.course?.course_type?.name})
										</Typography>
									</div>
									<div>
										<Typography
											variant="small"
											color="gray"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Código del piloto:
										</Typography>
										<Typography
											variant="paragraph"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											PC:{selectedStudent.student?.user_id}
										</Typography>
									</div>
									{selectedStudent.instructor_code && (
										<div>
											<Typography
												variant="small"
												color="gray"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Código del curso:
											</Typography>
											<Typography
												variant="paragraph"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{selectedStudent.instructor_code}
											</Typography>
										</div>
									)}
									<div>
										<Typography
											variant="small"
											color="gray"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Estado:
										</Typography>
										<Typography
											variant="paragraph"
											color={selectedStudent.status ? 'green' : 'red'}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{selectedStudent.status ? 'Activo' : 'Inactivo'}
										</Typography>
									</div>
									<div>
										<Typography
											variant="small"
											color="gray"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Grupo:
										</Typography>
										<Typography
											variant="paragraph"
											color={
												selectedStudent.course_group_id
													? 'green'
													: 'red'
											}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{selectedStudent.course_group_id
												? 'Con grupo'
												: 'Sin grupo asignado'}
										</Typography>
									</div>
								</div>
							</DialogBody>
							<DialogFooter
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<Button
									variant="outlined"
									color="gray"
									onClick={handleCloseDialog}
									className="mr-2"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Cerrar
								</Button>
								{selectedStudent && (
									<>
										<Button
											variant="text"
											color="blue"
											onClick={() => {
												handleCloseDialog();
												navigateViewCourseStudent(selectedStudent);
											}}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Ver detalles
										</Button>
										{isAdmin && selectedStudent.status !== false && (
											<Button
												variant="filled"
												color="green"
												onClick={() => {
													handleCloseDialog();
													navigateCourseStudent(selectedStudent);
												}}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Editar
											</Button>
										)}
									</>
								)}
							</DialogFooter>
						</Dialog>
					)}

					{totalPages > 1 && (
						<>
							<div className="flex flex-col w-full text-center">
								<small> Total:{totalItems}</small>
							</div>
							<div className="flex w-full justify-center items-center gap-2 sm:gap-4 flex-wrap">
								<Button
									variant="text"
									size="sm"
									className="flex items-center gap-1 sm:gap-2 rounded-full"
									onClick={() => {
										prev();
									}}
									disabled={active === 1}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<ChevronLeft
										strokeWidth={2}
										className="h-3 w-3 sm:h-4 sm:w-4"
									/>
									<span className="hidden sm:inline">Prev</span>
								</Button>
								<div className="flex items-center gap-1 sm:gap-2">
									{pages.map((page) => {
										return (
											<IconButton
												key={page.name}
												size="sm"
												{...getItemProps(page.id + 1)}
											>
												{page.id + 1}
											</IconButton>
										);
									})}
								</div>
								<Button
									variant="text"
									size="sm"
									className="flex items-center gap-1 sm:gap-2 rounded-full"
									onClick={() => {
										next();
									}}
									disabled={active === totalPages}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<span className="hidden sm:inline">Sig</span>
									<ChevronRight
										strokeWidth={2}
										className="h-3 w-3 sm:h-4 sm:w-4"
									/>
								</Button>
							</div>
						</>
					)}
				</CardBody>
			</Card>
		</div>
	);
};

export default CourseStudentsSection;
