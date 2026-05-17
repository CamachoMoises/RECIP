import { AppDispatch, RootState } from '../../../store';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../../../components/PageTitle';

import { fetchSubjects } from '../../../features/subjectSlice';
import {
	fetchCourse,
	fetchCourseStudent,
	fetchCoursesStudentsTests,
} from '../../../features/courseSlice';
import {
	breadCrumbsItems,
	courseStudent,
} from '../../../types/utilities';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import {
	Card,
	CardBody,
	Typography,
	List,
} from '@material-tailwind/react';
import { useEffect, useRef, useState } from 'react';
import {
	createCourseStudentTest,
	fetchCourseStudentTest,
	fetchTest,
	fetchTestStudent,
} from '../../../features/testSlice';

import { fetchUser } from '../../../features/userSlice';
import { useReactToPrint } from 'react-to-print';
import toast from 'react-hot-toast';
import { axiosPostDefault } from '../../../services/axios';
import BypassMaxTriesSwitch from './components/BypassMaxTriesSwitch';
import TestListItem from './components/TestListItem';
import TestListPagination from './components/TestListPagination';
import ExamsModal from './components/ExamsModal';
import ResultsPdfContainer from './components/ResultsPdfContainer';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];

const GeneralTest = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const componentRef = useRef<HTMLDivElement>(null);
	const [isGeneratingTest, setIsGeneratingTest] = useState(false);
	const [openExamsModal, setOpenExamsModal] = useState(false);
	const [byPassMaxTries, setByPassMaxTries] = useState(false);
	const [now, setNow] = useState<Date>(new Date());
const { course, auth, user, test } = useSelector(
		(state: RootState) => ({
			course: state.courses,
			auth: state.auth,
			user: state.users,
			test: state.tests,
		}),
		shallowEqual,
	);

	const isSuperAdmin = auth.user?.is_superuser;
	const currentPage = course.currentPage;
	const pageSize = course.pageSize;
	const totalPages = course.totalPages;
	const totalItems = course.totalItems;
	const [active, setActive] = useState(currentPage);

	useEffect(() => {
		dispatch(
			fetchCoursesStudentsTests({
				pageSize: course.pageSize,
				currentPage: course.currentPage,
				course_type_id: 1,
			}),
		);
	}, [dispatch, course.currentPage, course.pageSize]);

	useEffect(() => {
		toast(
			'Cuando inicie el examen espere que sea generado, recuerde que tiene intentos limitados!',
			{
				icon: '⚠️',
			},
		);
		const interval = window.setInterval(() => {
			setNow(new Date());
		}, 5000);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	const handleEndTest = async (course_student_test_id: number) => {
		toast.loading('Finalizando examen', { id: 'endTest' });
		const resp = await axiosPostDefault(
			`api/test/courseStudentTestEnd`,
			{
				course_student_test_id: course_student_test_id,
			},
		);

		if (resp.score >= 0) {
			toast.dismiss('endTest');
			toast.success(
				'Examen finalizado, pronto podra ver su calificaion',
			);
		}
	};

	const navigateCourseStudentTest = async (
		CS: courseStudent,
		date: string,
	) => {
		setIsGeneratingTest(true);
		const loadingToast = toast.loading('Generando examen');
		try {
			await dispatch(
				fetchSubjects({
					course_id: CS.course_id ? CS.course_id : -1,
					status: true,
					is_schedulable: true,
				}),
			);
			await dispatch(fetchCourse(CS.course_id ? CS.course_id : -1));
			await dispatch(fetchCourseStudent(CS.id ? CS.id : -1));
			const CST = await dispatch(
				createCourseStudentTest({
					course_student_id: CS.id ? CS.id : -1,
					date: date,
				}),
			).unwrap();
			await dispatch(fetchTest(CST.test_id));
			toast.dismiss(loadingToast);
			navigate(`../new_test/${CS.id}/${CS.course_id}/${CST.test_id}`);
		} catch (error) {
			toast.dismiss(loadingToast);
			toast.error('Error al generar el examen');
			setIsGeneratingTest(false);
		}
	};

	const navigateReviewTest = async (
		CST_id: number,
		test_id: number,
		course_id: number,
		CS_id: number,
		user_id: number,
	) => {
		console.log(
			'CST_id',
			CST_id,
			'test_id',
			test_id,
			'course_id',
			course_id,
			'CS_id',
			CS_id,
			'user_id',
			user_id,
		);

		navigate(
			`../review_test/${CST_id}/${test_id}/${course_id}/${CS_id}/${user_id}`,
		);
	};

	const seeReults = async (
		CST_id: number,
		course_id: number,
		user_id: number,
	) => {
		const userdata = await dispatch(fetchUser(user_id)).unwrap();
		const coursedata = await dispatch(
			fetchCourse(course_id),
		).unwrap();
		const testData = await dispatch(
			fetchCourseStudentTest(CST_id),
		).unwrap();
		if (coursedata && userdata && testData) {
			seeResults();
		}
	};

	const getItemProps = (index: number) =>
		({
			variant: active === index ? 'filled' : 'text',
			color: 'gray',
			onClick: async () => {
				await dispatch(
					fetchCoursesStudentsTests({
						pageSize,
						currentPage: index,
						course_type_id: 1,
					}),
				);
				setActive(index);
			},
			className: 'rounded-full',
		}) as any;

	const next = async () => {
		if (active === totalPages) return;
		setActive(active + 1);
		await dispatch(
			fetchCoursesStudentsTests({
				pageSize,
				currentPage: active + 1,
				course_type_id: 1,
			}),
		);
	};

	const prev = async () => {
		if (active === 1) return;
		setActive(active - 1);
		await dispatch(
			fetchCoursesStudentsTests({
				pageSize,
				currentPage: active - 1,
				course_type_id: 1,
			}),
		);
	};

	const seeResults = async () => {
		handlePrint();
	};

const [selectedUserId, setSelectedUserId] = useState<number>(-1);

	const openExamsList = async (
		studentId: number,
		courseStudentId: number,
		userId: number,
	) => {
		setSelectedUserId(userId);
		await dispatch(
			fetchTestStudent({
				student_id: studentId,
				course_student_id: courseStudentId,
			}),
		);
		setOpenExamsModal(true);
	};

	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Examen-${test.testSelected?.code}`,
	});

	if (course.status === 'loading') {
		return <LoadingPage />;
	}

	if (course.status === 'failed') {
		return (
			<ErrorPage error={course.error ? course.error : 'Indefinido'} />
		);
	}

	return (
		<div className="container mx-auto px-2 sm:px-4">
			<PageTitle title="Examenes" breadCrumbs={breadCrumbs} />

			{isSuperAdmin && (
				<BypassMaxTriesSwitch
					checked={byPassMaxTries}
					onChange={() => setByPassMaxTries((prev) => !prev)}
				/>
			)}

			<div className="flex flex-col pt-4">
				<Card
					className="w-full"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<CardBody
						className="p-2 sm:p-4"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						{course.courseStudentList?.length === 0 ? (
							<>
								<Typography
									variant="h2"
									color="blue-gray"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Sin exámenes cargados
								</Typography>
							</>
						) : (
							<List
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{course.courseStudentList?.map((CL) => (
									<TestListItem
										key={`${CL.id}.courseList`}
										CL={CL}
										byPassMaxTries={byPassMaxTries}
										now={now}
										isGeneratingTest={isGeneratingTest}
										isSuperuser={auth.user?.is_superuser || false}
										authUserId={auth.user?.id || -1}
										onNavigateCourseStudentTest={
											navigateCourseStudentTest
										}
										onSeeResults={seeReults}
										onOpenExamsList={openExamsList}
										onNavigateReviewTest={navigateReviewTest}
									/>
								))}
							</List>
						)}

						{totalPages > 1 && (
							<TestListPagination
								active={active}
								totalPages={totalPages}
								totalItems={totalItems}
								getItemProps={getItemProps}
								onPrev={prev}
								onNext={next}
							/>
						)}
					</CardBody>
				</Card>
			</div>

<ExamsModal
				open={openExamsModal}
				onClose={() => setOpenExamsModal(false)}
				studentTestList={test.studentTestList || []}
				userId={selectedUserId}
				onNavigateReviewTest={navigateReviewTest}
				onHandleEndTest={handleEndTest}
			/>

			<ResultsPdfContainer
				componentRef={componentRef}
				course={course}
				test={test}
				user={user}
			/>
		</div>
	);
};

export default GeneralTest;
