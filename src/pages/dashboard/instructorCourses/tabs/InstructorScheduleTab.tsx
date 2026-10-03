import { useEffect, useMemo, useState } from 'react';
import { axiosGetDefault } from '../../../../services/axios';
import {
	Card,
	CardBody,
	Typography,
} from '@material-tailwind/react';
import { Calendar, Clock, User } from 'lucide-react';
import moment from 'moment';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import { course } from '../../../../types/utilities';
import {
	buildCourseCatalog,
	courseIdOfStudent,
	courseTitle,
	type InstructorScheduleItem,
} from './instructorShared';

/**
 * El cronograma se consulta **solo por `instructor_id`**: el endpoint
 * `GET /api/instructor/schedule/:instructor_id` devuelve la totalidad de sus
 * cursos. `courseId` es únicamente un recorte de pantalla.
 */
type Props = {
	instructor_id: number;
	courses?: course[] | null;
	courseId?: number | null;
};

const InstructorScheduleTab = ({
	instructor_id,
	courses,
	courseId,
}: Props) => {
	const [schedule, setSchedule] = useState<InstructorScheduleItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const catalog = useMemo(() => buildCourseCatalog(courses), [courses]);

	useEffect(() => {
		const loadSchedule = async () => {
			if (instructor_id <= 0) {
				setLoading(false);
				return;
			}
			setLoading(true);
			setError(null);
			try {
				const { resp, status } = await axiosGetDefault(
					`api/instructor/schedule/${instructor_id}`,
				);
				if (status >= 200 && status < 400) {
					const list: InstructorScheduleItem[] = Array.isArray(resp)
						? resp
						: (resp?.data ?? []);
					setSchedule(list);
				} else {
					setError('Error al cargar el cronograma');
				}
			} catch {
				setError('Error al conectar con el servidor');
			} finally {
				setLoading(false);
			}
		};
		loadSchedule();
	}, [instructor_id]);

	if (loading) return <LoadingPage />;
	if (error) return <ErrorPage error={error} />;

	const visible = courseId
		? schedule.filter((item) => courseIdOfStudent(item) === courseId)
		: schedule;

	const byCourse = new Map<number, InstructorScheduleItem[]>();
	visible.forEach((item) => {
		const id = courseIdOfStudent(item);
		if (id === null) return;
		if (!byCourse.has(id)) byCourse.set(id, []);
		byCourse.get(id)!.push(item);
	});

	const courseIds = [...byCourse.keys()].sort((a, b) => a - b);

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
					className="mb-1"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Cronograma de Clases
				</Typography>
				<Typography
					variant="small"
					color="gray"
					className="mb-4"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{visible.length} actividades programadas en{' '}
					{courseIds.length}{' '}
					{courseIds.length === 1 ? 'curso' : 'cursos'}
				</Typography>

				{visible.length === 0 ? (
					<Typography
						color="gray"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						No hay actividades programadas
					</Typography>
				) : (
					<div className="flex flex-col gap-6">
						{courseIds.map((id) => {
							const list = byCourse.get(id)!;
							const courseData = catalog.get(id);
							const grouped = list.reduce<
								Record<number, InstructorScheduleItem[]>
							>((acc, item) => {
								const day = item.subject_day?.day ?? 0;
								if (!acc[day]) acc[day] = [];
								acc[day].push(item);
								return acc;
							}, {});
							const days = Object.keys(grouped)
								.map(Number)
								.sort((a, b) => a - b);

							return (
								<div key={id}>
									<Typography
										variant="h6"
										color="blue-gray"
										className="mb-2 flex items-center gap-2"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<Calendar size={16} />
										{courseTitle(id, catalog, courseData)}
									</Typography>
									<div className="flex flex-col gap-3 ml-6">
										{days.map((day) => (
											<div key={day}>
												<Typography
													variant="small"
													color="gray"
													className="font-semibold"
													placeholder={undefined}
													onPointerEnterCapture={
														undefined
													}
													onPointerLeaveCapture={
														undefined
													}
												>
													Día {day} ({grouped[day].length}{' '}
													{grouped[day].length === 1
														? 'clase'
														: 'clases'}
													)
												</Typography>
												<div className="flex flex-col gap-2 mt-1">
													{grouped[day]
														.sort((a, b) =>
															moment(
																`${a.date} ${a.hour}`,
															).diff(
																moment(
																	`${b.date} ${b.hour}`,
																),
															),
														)
														.map((item) => (
															<div
																key={item.id}
																className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 border border-blue-gray-50 rounded-lg hover:bg-blue-gray-50/50 transition-colors"
															>
																<div className="flex items-center gap-2 text-sm text-gray-600 min-w-[140px]">
																	<Clock
																		size={
																			14
																		}
																	/>
																	{moment(
																		item.date,
																	).format(
																		'DD/MM/YYYY',
																	)}{' '}
																	{item.hour}
																	<span className="text-xs text-gray-400">
																		(
																		{
																			item.classTime
																		}
																		h)
																	</span>
																</div>
																<div className="flex items-center gap-2 text-sm">
																	<User
																		size={
																			14
																		}
																		className="text-gray-400"
																	/>
																	<span className="font-medium">
																		{item.student
																			?.user
																			? `${item.student.user.name} ${item.student.user.last_name}`
																			: (item.course_student
																					?.student
																					?.user
																				? `${item.course_student.student.user.name} ${item.course_student.student.user.last_name}`
																				: '-')}
																	</span>
																</div>
																<div className="text-sm text-gray-500">
																	{item.subject
																		?.name ??
																		'-'}
																</div>
															</div>
														))}
												</div>
											</div>
										))}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default InstructorScheduleTab;
