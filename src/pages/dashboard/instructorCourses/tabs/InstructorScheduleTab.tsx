import { useEffect, useState } from 'react';
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

type Props = {
	instructor_id: number;
	course_id: number;
};

type ScheduleItem = {
	id: number;
	date: string;
	hour: string;
	classTime: number;
	student?: {
		id: number;
		user?: {
			name: string;
			last_name: string;
		};
	};
	subject?: {
		name: string;
	};
	subject_day?: {
		day: number;
	};
};

const InstructorScheduleTab = ({ instructor_id, course_id }: Props) => {
	const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadSchedule = async () => {
			if (instructor_id <= 0) {
				setLoading(false);
				return;
			}
			setLoading(true);
			try {
				const { resp, status } = await axiosGetDefault(
					`api/instructor/schedule/${instructor_id}`,
				);
				if (status >= 200 && status < 400) {
					const filtered = course_id
						? resp.filter(
								(s: any) =>
									s.course_student?.course_id === course_id,
							)
						: resp;
					setSchedule(filtered);
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
	}, [instructor_id, course_id]);

	if (loading) return <LoadingPage />;
	if (error) return <ErrorPage error={error} />;

	const groupedByDay = schedule.reduce<Record<number, ScheduleItem[]>>(
		(acc, item) => {
			const day = item.subject_day?.day ?? 0;
			if (!acc[day]) acc[day] = [];
			acc[day].push(item);
			return acc;
		},
		{});

	const days = Object.keys(groupedByDay)
		.map(Number)
		.sort((a, b) => a - b);

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
					Cronograma de Clases
				</Typography>

				{schedule.length === 0 ? (
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
						{days.map((day) => (
							<div key={day}>
								<Typography
									variant="h6"
									color="blue-gray"
									className="mb-2 flex items-center gap-2"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<Calendar size={16} />
									Día {day}
								</Typography>
								<div className="flex flex-col gap-2 ml-6">
									{groupedByDay[day]
										.sort((a, b) =>
											moment(`${a.date} ${a.hour}`).diff(
												moment(`${b.date} ${b.hour}`),
											),
										)
										.map((item) => (
											<div
												key={item.id}
												className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 border border-blue-gray-50 rounded-lg hover:bg-blue-gray-50/50 transition-colors"
											>
												<div className="flex items-center gap-2 text-sm text-gray-600 min-w-[140px]">
													<Clock size={14} />
													{moment(item.date).format('DD/MM/YYYY')}{' '}
													{item.hour}
													<span className="text-xs text-gray-400">
														({item.classTime}h)
													</span>
												</div>
												<div className="flex items-center gap-2 text-sm">
													<User size={14} className="text-gray-400" />
													<span className="font-medium">
														{item.student?.user
															? `${item.student.user.name} ${item.student.user.last_name}`
															: '-'}
													</span>
												</div>
												<div className="text-sm text-gray-500">
													{item.subject?.name ?? '-'}
												</div>
											</div>
										))}
								</div>
							</div>
						))}
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default InstructorScheduleTab;
