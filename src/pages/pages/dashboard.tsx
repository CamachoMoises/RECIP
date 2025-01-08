import { Route, Routes, useNavigate } from 'react-router-dom';
import Icons from './dashboard/icons';
import UsersTable from './dashboard/users/usersTable';
import GeneralCourses from './dashboard/courses/generalCourses';
import CourseDetail from './dashboard/config/courseDetail';
import NewCourse from './dashboard/courses/newCourseStudentSchedule';
import TableStudents from './dashboard/students/tableStudents';
import TableInstructors from './dashboard/instructors/tableInstructors';
import GeneralAssessment from './dashboard/assessment/generalAssessment';
import NewAssessment from './dashboard/assessment/newAssessment';
import NewTest from './dashboard/test/newTest';
import GeneralTest from './dashboard/test/generalTest';
import GeneralConfig from './dashboard/config/generalConfig';
import TestList from './dashboard/config/testList';
import QuestionTestList from './dashboard/config/questionTestList';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const Dashboard = () => {
	const navigate = useNavigate();

	const auth = useSelector((state: RootState) => {
		return state.auth;
	});
	useEffect(() => {
		if (!auth.token) {
			navigate('/login');
		}
	}, [auth.token, navigate]);

	return (
		<div className="video-container">
			<div className="flex flex-col p-2">
				<div className=" flex flex-row gap-3 ">
					<div className="my-6">
						<video
							className="rounded-lg shadow-lg"
							width="170"
							height="170"
							loop
							autoPlay
							muted
						>
							<source
								src="/video/video_background.mp4"
								type="video/mp4"
							/>
							Tu navegador no soporta el elemento de video.
						</video>
					</div>
					<div className="w-full my-6">
						{/* <PageTitle title="Configuración" breadCrumbs={[]} /> */}
						<Routes>
							<Route path="/" element={<Icons />} />
							<Route path="users" element={<UsersTable />} />
							<Route path="courses" element={<GeneralCourses />} />
							<Route path="students" element={<TableStudents />} />
							<Route path="config" element={<GeneralConfig />} />
							<Route
								path="instructors"
								element={<TableInstructors />}
							/>
							<Route
								path="assessment"
								element={<GeneralAssessment />}
							/>
							<Route path="test" element={<GeneralTest />} />
							<Route
								path="config/course/:id"
								element={<CourseDetail />}
							/>
							<Route path="config/test/:id" element={<TestList />} />
							<Route
								path="config/testQuestion/:course_id/:test_id/:question_type_id"
								element={<QuestionTestList />}
							/>
							<Route
								path="new_course/:id/:course_id"
								element={<NewCourse />}
							/>
							<Route
								path="course_assessment/:id/:course_id"
								element={<NewAssessment />}
							/>
							<Route
								path="new_test/:id/:course_id/:test_id"
								element={<NewTest />}
							/>
						</Routes>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
