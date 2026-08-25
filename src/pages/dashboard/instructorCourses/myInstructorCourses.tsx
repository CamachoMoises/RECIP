import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import {
	breadCrumbsItems,
	courseStudent,
} from '../../../types/utilities';
import { useNavigate } from 'react-router-dom';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import PageTitle from '../../../components/PageTitle';
import {
	Card,
	CardBody,
	CardHeader,
	Typography,
	Button,
	IconButton,
} from '@material-tailwind/react';
import {
	fetchCoursesStudentsByInstructor,
	fetchCourses,
	fetchCourse,
} from '../../../features/courseSlice';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];

const fixedPageSize = 10;

const MyInstructorCourses = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const {
		courseStudentList,
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
	const [courseFilter, setCourseFilter] = useState<string | undefined>(
		undefined,
	);

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

	const navigateViewCourse = async (CS: courseStudent) => {
		const courseId = CS.course_id ?? -1;
		await dispatch(fetchCourse(courseId));
		navigate(`../my-instructor-course/${courseId}`);
	};

	const filteredList = courseFilter
		? courseStudentList?.filter(
				(cs) => cs.course_id === parseInt(courseFilter),
			)
		: courseStudentList;

	const uniqueCourses = courseStudentList?.reduce<
		{ id: number; name: string }[]
	>((acc, cs) => {
		if (cs.course && !acc.find((c) => c.id === cs.course_id)) {
			acc.push({ id: cs.course_id, name: cs.course.name });
		}
		return acc;
	}, []);

	if (status === 'loading' && !courseStudentList) {
		return <LoadingPage />;
	}

	if (status === 'failed') {
		return <ErrorPage error={error ? error : 'Indefinido'} />;
	}

	if (instructor_id <= 0) {
		return (
			<>
				<PageTitle
					title="Mis Cursos"
					breadCrumbs={breadCrumbs}
				/>
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
			<PageTitle
				title="Mis Cursos"
				breadCrumbs={breadCrumbs}
			/>

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
							<Typography
								variant="h4"
								color="blue-gray"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Mis Cursos Asignados
							</Typography>

							<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
												Código
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
													<Typography
														variant="small"
														color="blue-gray"
														className="font-medium"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{cs.code}
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
														variant="text"
														color="blue"
														size="sm"
														onClick={() => navigateViewCourse(cs)}
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
			</div>
		</>
	);
};

export default MyInstructorCourses;
