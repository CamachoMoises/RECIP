import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { useParams } from 'react-router-dom';
import { breadCrumbsItems } from '../../../types/utilities';
import { fetchCourse } from '../../../features/courseSlice';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import PageTitle from '../../../components/PageTitle';
import {
	Card,
	CardBody,
	Tab,
	Tabs,
	TabsHeader,
	Typography,
} from '@material-tailwind/react';
import {
	Calendar,
	Users,
	ClipboardCheck,
	NotebookText,
	BookOpenCheck,
} from 'lucide-react';
import InstructorScheduleTab from './tabs/InstructorScheduleTab';
import InstructorGroupsTab from './tabs/InstructorGroupsTab';
import InstructorAttendanceTab from './tabs/InstructorAttendanceTab';
import InstructorAssessmentTab from './tabs/InstructorAssessmentTab';
import InstructorTestsTab from './tabs/InstructorTestsTab';
import {
	ordinalNounPlural,
	programSize,
} from '../../../utils/programSize';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
	{
		name: 'Mis Cursos',
		href: '/dashboard/my-instructor-courses',
	},
];

const MyInstructorCourseDetail = () => {
	const dispatch = useDispatch<AppDispatch>();
	const { course_id } = useParams<{ course_id: string }>();
	const [activeTab, setActiveTab] = useState('schedule');

	const { courseSelected, status, error } = useSelector(
		(state: RootState) => state.courses,
	);

	const { userLogged } = useSelector(
		(state: RootState) => state.users,
	);

	const instructor_id = userLogged?.instructor?.id ?? -1;
	console.log(
		'instructor ID',
		instructor_id,
		'course selected',
		courseSelected,
	);

	useEffect(() => {
		const id = parseInt(course_id || '-1');
		if (id > 0) {
			dispatch(fetchCourse(id));
		}
	}, [dispatch, course_id]);

	if (status === 'loading' && !courseSelected) {
		return <LoadingPage />;
	}

	if (status === 'failed') {
		return <ErrorPage error={error ? error : 'Indefinido'} />;
	}

	const courseId = parseInt(course_id || '-1');

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
	];

	return (
		<>
			<PageTitle
				title={`Curso: ${courseSelected?.name ?? '...'}`}
				breadCrumbs={breadCrumbs}
			/>

			<div className="flex flex-col gap-4">
				{courseSelected && (
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
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div>
									<Typography
										variant="small"
										color="gray"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Nombre
									</Typography>
									<Typography
										variant="h6"
										color="blue-gray"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{courseSelected.name}
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
										Código
									</Typography>
									<Typography
										variant="h6"
										color="blue-gray"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{courseSelected.code}
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
										Nivel - Tipo
									</Typography>
									<Typography
										variant="h6"
										color="blue-gray"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{courseSelected.course_level?.name} -{' '}
										{courseSelected.course_type?.name}
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
										Horas / {ordinalNounPlural(courseSelected)}
									</Typography>
									<Typography
										variant="h6"
										color="blue-gray"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{courseSelected.hours}h /{' '}
										{programSize(courseSelected)}d
									</Typography>
								</div>
							</div>
						</CardBody>
					</Card>
				)}

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
							course_id={courseId}
							course={courseSelected}
						/>
					)}
					{activeTab === 'groups' && (
						<InstructorGroupsTab
							instructor_id={instructor_id}
							course_id={courseId}
						/>
					)}
					{activeTab === 'attendance' && (
						<InstructorAttendanceTab
							instructor_id={instructor_id}
							course_id={courseId}
							course={courseSelected}
						/>
					)}
					{activeTab === 'assessment' && (
						<InstructorAssessmentTab
							instructor_id={instructor_id}
							course_id={courseId}
						/>
					)}
					{activeTab === 'tests' && (
						<InstructorTestsTab
							instructor_id={instructor_id}
							course_id={courseId}
						/>
					)}
				</div>
			</div>
		</>
	);
};

export default MyInstructorCourseDetail;
