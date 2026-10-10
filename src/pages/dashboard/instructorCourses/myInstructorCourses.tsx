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
	Tab,
	Tabs,
	TabsHeader,
	Typography,
} from '@material-tailwind/react';
import {
	fetchSchedulesGrouped,
	fetchTestsWithParticipation,
	fetchAttendanceGrouped,
} from '../../../features/instructorSlice';
import {
	BookOpenCheck,
	Calendar,
	ClipboardCheck,
	NotebookText,
	PenLine,
	Users,
} from 'lucide-react';
import InstructorSignaturesTab from './tabs/InstructorSignaturesTab';
import InstructorSchedulesGroupedTab from './tabs/InstructorSchedulesGroupedTab';
import InstructorAttendanceGroupedTab from './tabs/InstructorAttendanceGroupedTab';
import InstructorEvaluationsGroupedTab from './tabs/InstructorEvaluationsGroupedTab';
import InstructorTestsParticipationTab from './tabs/InstructorTestsParticipationTab';
import InstructorGroupsTab from './tabs/InstructorGroupsTab';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];

const COURSE_OPTIONS_PAGE_SIZE = 500;

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

	const { courseStudentList, courseList, status, error } =
		useSelector((state: RootState) => state.courses);

	const { userLogged } = useSelector(
		(state: RootState) => state.users,
	);

	const instructor_id = userLogged?.instructor?.id ?? -1;

	const instructorState = useSelector(
		(state: RootState) => state.instructor,
	);

	const [activeTab, setActiveTab] = useState('schedule');

	const tabsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
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
		};
		loadOptions().catch(() => undefined);
		return () => {
			cancelled = true;
		};
	}, [instructor_id]);

	useEffect(() => {
		if (instructor_id <= 0) return;
		dispatch(fetchSchedulesGrouped({ instructor_id }));
	}, [instructor_id, dispatch]);

	useEffect(() => {
		if (instructor_id <= 0) return;
		dispatch(fetchTestsWithParticipation({ instructor_id }));
	}, [instructor_id, dispatch]);

	useEffect(() => {
		if (instructor_id <= 0) return;
		dispatch(fetchAttendanceGrouped({ instructor_id }));
	}, [instructor_id, dispatch]);

	const coursesForTabs = useMemo(
		() => (courseList ?? []) as course[],
		[courseList],
	);

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
				<div
					ref={tabsRef}
					className="flex flex-col gap-4 scroll-mt-4"
				>
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
							<InstructorSchedulesGroupedTab
								instructor_id={instructor_id}
								schedules={instructorState.schedulesGrouped}
								courses={coursesForTabs}
							/>
						)}
						{activeTab === 'groups' && (
							<InstructorGroupsTab instructor_id={instructor_id} />
						)}
						{activeTab === 'attendance' && (
							<InstructorAttendanceGroupedTab
								instructor_id={instructor_id}
								attendance={instructorState.attendanceGrouped}
								schedules={instructorState.schedulesGrouped}
								courses={coursesForTabs}
							/>
						)}
						{activeTab === 'assessment' && (
							<InstructorEvaluationsGroupedTab
								instructor_id={instructor_id}
								evaluations={instructorState.evaluationsGrouped}
								courses={coursesForTabs}
							/>
						)}
						{activeTab === 'tests' && (
							<InstructorTestsParticipationTab
								instructor_id={instructor_id}
								tests={instructorState.testsParticipation}
								schedules={instructorState.schedulesGrouped}
								courses={coursesForTabs}
							/>
						)}
						{activeTab === 'signatures' && (
							<InstructorSignaturesTab
								instructor_id={instructor_id}
								schedules={instructorState.schedulesGrouped}
								courses={coursesForTabs}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default MyInstructorCourses;
