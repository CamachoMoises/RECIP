import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import {
	breadCrumbsItems,
	course,
	courseStudent,
} from '../../../types/utilities';
import { useEffect, useMemo, useRef, useState } from 'react';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import PageTitle from '../../../components/PageTitle';
import { axiosGetDefault } from '../../../services/axios';
import {
	Card,
	CardBody,
	CardHeader,
	Tab,
	Tabs,
	TabsHeader,
	Typography,
	Button,
	IconButton,
} from '@material-tailwind/react';
import {
	fetchCoursesStudentsByInstructor,
	fetchCourses,
} from '../../../features/courseSlice';
import {
	BookOpenCheck,
	Calendar,
	ChevronLeft,
	ChevronRight,
	ClipboardCheck,
	Eye,
	NotebookText,
	PenLine,
	Users,
} from 'lucide-react';
import InstructorScheduleTab from './tabs/InstructorScheduleTab';
import InstructorGroupsTab from './tabs/InstructorGroupsTab';
import InstructorAttendanceTab from './tabs/InstructorAttendanceTab';
import InstructorAssessmentTab from './tabs/InstructorAssessmentTab';
import InstructorTestsTab from './tabs/InstructorTestsTab';
import InstructorSignaturesTab from './tabs/InstructorSignaturesTab';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];

const fixedPageSize = 10;
const COURSE_OPTIONS_PAGE_SIZE = 500;

/**
 * Tablas del panel del instructor. Todas las consultas van orientadas al
 * `instructor_id` del usuario logueado: cada endpoint (`/api/instructor/*`,
 * `/api/course_groups`, `/api/attendance`) resuelve las apariciones del
 * instructor a través de sus schedules, así que el corte por curso es solo de
 * pantalla.
 */
const tabs = [
	{
		label: 'Cronograma',
		value: 'schedule',
		icon: Calendar,
	},
	{
		label: 'Grupos',
		value: 'groups',
		icon: Users,
	},
	{
		label: 'Asistencia',
		value: 'attendance',
		icon: ClipboardCheck,
	},
	{
		label: 'Evaluaciones',
		value: 'assessment',
		icon: NotebookText,
	},
	{
		label: 'Exámenes',
		value: 'tests',
		icon: BookOpenCheck,
	},
	{
		label: 'Firmas',
		value: 'signatures',
		icon: PenLine,
	},
];

const MyInstructorCourses = () => {
	const dispatch = useDispatch<AppDispatch>();

	const {
		courseStudentList,
		courseList,
		status,
		error,
		currentPage,
		totalPages,
		totalItems,
	} = useSelector((state: RootState) => state.courses);

	const { userLogged } = useSelector(
		(state: RootState) => state.users,
	);

	const instructor_id = userLogged?.instructor?.id ?? -1;

	const [active, setActive] = useState(currentPage);
	const [courseFilter, setCourseFilter] = useState<
		string | undefined
	>(undefined);
	const [activeTab, setActiveTab] = useState('schedule');
	const [courseOptions, setCourseOptions] = useState<
		{ id: number; name: string }[]
	>([]);
	const tabsRef = useRef<HTMLDivElement>(null);

	const fetchWithFilter = (page: number = 1) => {
		if (instructor_id <= 0) return;
		dispatch(
			fetchCoursesStudentsByInstructor({
				instructor_id,
				currentPage: page,
				pageSize: fixedPageSize,
				status: true,
			}),
		);
	};

	/**
	 * El listado se pagina en el servidor, así que el selector de cursos se
	 * arma con una consulta aparte de todas las apariciones: si se armara con la
	 * página visible, al cambiar de página desaparecerían cursos del filtro.
	 */
	useEffect(() => {
		if (instructor_id <= 0) {
			setCourseOptions([]);
			return;
		}
		let cancelled = false;
		const loadOptions = async () => {
			const { resp, status } = await axiosGetDefault(
				'api/courses/coursesStudents',
				{ instructor_id, pageSize: COURSE_OPTIONS_PAGE_SIZE },
			);
			if (cancelled) return;
			if (status < 200 || status >= 400) return;
			const rows: courseStudent[] = resp.data || [];
			const options: { id: number; name: string }[] = [];
			rows.forEach((cs) => {
				const name = cs.course?.name;
				if (!name || options.some((o) => o.id === cs.course_id))
					return;
				options.push({ id: cs.course_id, name });
			});
			setCourseOptions(
				options.sort((a, b) => a.name.localeCompare(b.name)),
			);
		};
		loadOptions().catch(() => undefined);
		return () => {
			cancelled = true;
		};
	}, [instructor_id]);

	useEffect(() => {
		dispatch(fetchCourses());
		if (instructor_id > 0) {
			fetchWithFilter(1);
		}
	}, [dispatch, instructor_id]);

	useEffect(() => {
		setActive(currentPage);
	}, [currentPage]);

	const next = async () => {
		if (active === totalPages) return;
		const nextPage = active + 1;
		setActive(nextPage);
		fetchWithFilter(nextPage);
	};

	const prev = async () => {
		if (active === 1) return;
		const prevPage = active - 1;
		setActive(prevPage);
		fetchWithFilter(prevPage);
	};

	const selectedCourseId = courseFilter
		? parseInt(courseFilter)
		: null;

	/**
	 * Antes las tabs vivían en una página aparte por curso; ahora se filtran desde
	 * acá y se baja el scroll al panel para no perder el contexto del listado.
	 */
	const selectCourse = (cs: courseStudent) => {
		setCourseFilter(String(cs.course_id));
		setActive(1);
		setActiveTab('schedule');
		tabsRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	};

	const filteredList = courseFilter
		? courseStudentList?.filter(
				(cs) => cs.course_id === parseInt(courseFilter),
			)
		: courseStudentList;

	// `GET /api/courses/` trae el catálogo completo (con `course_type`,
	// `course_level`, `days`/`sessions`), que es de donde las tabs resuelven el
	// programa de cada curso sin depender de la página visible del listado.
	const coursesForTabs = useMemo(
		() => (courseList ?? []) as course[],
		[courseList],
	);

	/**
	 * Si la consulta de opciones todavía no respondió (o falló) se cae al listado
	 * visible para que el filtro nunca quede vacío sin motivo.
	 */
	const uniqueCourses = useMemo(() => {
		if (courseOptions.length > 0) return courseOptions;
		return (
			courseStudentList?.reduce<{ id: number; name: string }[]>(
				(acc, cs) => {
					if (cs.course && !acc.find((c) => c.id === cs.course_id)) {
						acc.push({ id: cs.course_id, name: cs.course.name });
					}
					return acc;
				},
				[],
			) ?? []
		);
	}, [courseOptions, courseStudentList]);

	if (status === 'loading' && !courseStudentList) {
		return <LoadingPage />;
	}

	if (status === 'failed') {
		return <ErrorPage error={error ? error : 'Indefinido'} />;
	}

	if (instructor_id <= 0) {
		return (
			<>
				<PageTitle title="Mis Cursos" breadCrumbs={breadCrumbs} />
				<div className="flex flex-col gap-4">
					<Card
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<CardBody
							className="p-8"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Typography
								color="gray"
								className="text-center"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								No tiene perfil de instructor asociado
							</Typography>
						</CardBody>
					</Card>
				</div>
			</>
		);
	}

	return (
		<>
			<PageTitle title="Mis Cursos" breadCrumbs={breadCrumbs} />

			<div className="flex flex-col gap-4">
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
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<div>
								<Typography
									variant="h4"
									color="blue-gray"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Mis Cursos Asignados
								</Typography>
								<Typography
									variant="small"
									color="gray"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{totalItems} apariciones en {uniqueCourses.length}{' '}
									{uniqueCourses.length === 1 ? 'curso' : 'cursos'}
								</Typography>
							</div>

							<div className="relative flex w-full md:w-64">
								<select
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
									value={courseFilter ?? ''}
									onChange={(e) => {
										setCourseFilter(e.target.value || undefined);
										setActive(1);
									}}
								>
									<option value="">Todos los cursos</option>
									{uniqueCourses?.map((c) => (
										<option key={c.id} value={String(c.id)}>
											{c.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</CardBody>
				</Card>

				<Card
					className="w-full overflow-hidden"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<CardHeader
						floated={false}
						shadow={false}
						color="transparent"
						className="m-0 p-4 md:p-6 border-b"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Typography
							variant="h5"
							color="blue-gray"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Listado de Cursos
						</Typography>
						<Typography
							variant="small"
							color="gray"
							className="mt-1"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{totalItems} registros encontrados
						</Typography>
					</CardHeader>

					<CardBody
						className="p-0"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr>
										<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
											<Typography
												variant="small"
												color="blue-gray"
												className="font-bold"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Curso
											</Typography>
										</th>
										<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
											<Typography
												variant="small"
												color="blue-gray"
												className="font-bold"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Piloto
											</Typography>
										</th>

										<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
											<Typography
												variant="small"
												color="blue-gray"
												className="font-bold"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Estado
											</Typography>
										</th>
										<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-center">
											<Typography
												variant="small"
												color="blue-gray"
												className="font-bold"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Acciones
											</Typography>
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredList && filteredList.length > 0 ? (
										filteredList.map((cs) => (
											<tr
												key={cs.id}
												className="hover:bg-blue-gray-50/50 transition-colors"
											>
												<td className="py-3 px-4 border-b border-blue-gray-50">
													<Typography
														variant="small"
														color="blue-gray"
														className="font-medium"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{cs.course?.name ?? '-'}
													</Typography>
													<Typography
														variant="small"
														color="gray"
														className="font-normal"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{cs.course?.course_level?.name} -{' '}
														{cs.course?.course_type?.name}
													</Typography>
												</td>
												<td className="py-3 px-4 border-b border-blue-gray-50">
													<Typography
														variant="small"
														color="blue-gray"
														className="font-medium"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{cs.student?.user
															? `${cs.student.user.name} ${cs.student.user.last_name}`
															: 'Sin Piloto'}
													</Typography>
												</td>

												<td className="py-3 px-4 border-b border-blue-gray-50">
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${
															cs.status
																? 'bg-green-100 text-green-700'
																: 'bg-red-100 text-red-700'
														}`}
													>
														{cs.status ? 'Activo' : 'Inactivo'}
													</span>
												</td>
												<td className="py-3 px-4 border-b border-blue-gray-50 text-center">
													<IconButton
														disabled
														variant="text"
														color="blue"
														size="sm"
														title="Ver el curso en el panel"
														onClick={() => selectCourse(cs)}
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														<Eye size={18} />
													</IconButton>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan={5}
												className="py-8 text-center border-b border-blue-gray-50"
											>
												<Typography
													variant="h6"
													color="blue-gray"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													No hay cursos asignados
												</Typography>
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</CardBody>
				</Card>

				{totalPages > 1 && (
					<div className="flex flex-col items-center gap-2">
						<Typography
							variant="small"
							color="gray"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Página {currentPage} de {totalPages} ({totalItems}{' '}
							registros)
						</Typography>
						<div className="flex items-center gap-2">
							<Button
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								variant="text"
								className="flex items-center gap-2 rounded-full"
								onClick={prev}
								disabled={active === 1}
								placeholder={undefined}
							>
								<ChevronLeft strokeWidth={2} className="h-4 w-4" />
								Prev
							</Button>
							<Button
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								variant="text"
								className="flex items-center gap-2 rounded-full"
								onClick={next}
								disabled={active === totalPages}
								placeholder={undefined}
							>
								Sig
								<ChevronRight strokeWidth={2} className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}

				<div
					ref={tabsRef}
					className="flex flex-col gap-4 scroll-mt-4"
				>
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
							<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
								<Typography
									variant="h4"
									color="blue-gray"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{selectedCourseId
										? (coursesForTabs.find(
												(c) => c.id === selectedCourseId,
											)?.name ?? 'Curso')
										: 'Todos mis cursos'}
								</Typography>
								<Typography
									variant="small"
									color="gray"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Las tablas se consultan por instructor; el filtro de
									curso solo recorta la vista
								</Typography>
							</div>
						</CardBody>
					</Card>

					{/* `Tabs` de MT v2 no expone onChange (lo reparte al div como handler
					    DOM). El estado activo real lo cambia el click en cada `Tab`, así
					    que el onClick de cada tab es lo que mueve `activeTab`. */}
					<Tabs value={activeTab}>
						<TabsHeader
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{tabs.map(({ label, value, icon: Icon }) => (
								<Tab
									key={value}
									value={value}
									onClick={() => setActiveTab(value)}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<div className="flex items-center gap-2">
										<Icon size={16} />
										<span className="hidden sm:inline">{label}</span>
									</div>
								</Tab>
							))}
						</TabsHeader>
					</Tabs>

					<div className="mt-4">
						{activeTab === 'schedule' && (
							<InstructorScheduleTab
								instructor_id={instructor_id}
								courses={coursesForTabs}
								courseId={selectedCourseId}
							/>
						)}
						{activeTab === 'groups' && (
							<InstructorGroupsTab
								instructor_id={instructor_id}
								courseId={selectedCourseId}
							/>
						)}
						{activeTab === 'attendance' && (
							<InstructorAttendanceTab
								instructor_id={instructor_id}
								courses={coursesForTabs}
								courseId={selectedCourseId}
							/>
						)}
						{activeTab === 'assessment' && (
							<InstructorAssessmentTab
								instructor_id={instructor_id}
								courses={coursesForTabs}
								courseId={selectedCourseId}
							/>
						)}
						{activeTab === 'tests' && (
							<InstructorTestsTab
								instructor_id={instructor_id}
								courses={coursesForTabs}
								courseId={selectedCourseId}
							/>
						)}
						{activeTab === 'signatures' && (
							<InstructorSignaturesTab
								instructor_id={instructor_id}
								courses={coursesForTabs}
								courseId={selectedCourseId}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default MyInstructorCourses;
