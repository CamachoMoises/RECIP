import { Route, Routes } from 'react-router-dom';
import Icons from './dashboard/icons';
import UsersTable from './dashboard/users/usersTable';
import GeneralCourses from './dashboard/courses/generalCourses';
import StudentCourses from './dashboard/courses/StudentCourses';
import CourseDetail from './dashboard/config/courseDetail';
import NewCourse from './dashboard/courses/newCourseStudentSchedule';
import ViewCourseStudentSchedule from './dashboard/courses/viewCourseStudentSchedule';
import TableStudents from './dashboard/students/tableStudents';
import TableInstructors from './dashboard/instructors/tableInstructors';
import GeneralAssessment from './dashboard/assessment/generalAssessment';
import Reports from './dashboard/reports/Reports';
import NewTest from './dashboard/test/newTest';
import GeneralTest from './dashboard/test/generalTest';
import GeneralConfig from './dashboard/config/generalConfig';
import TestList from './dashboard/config/testList';
import QuestionTestList from './dashboard/config/questionTestList';
import { useEffect, useState } from 'react';
import DetailAssessment from './dashboard/assessment/detailAssessment';
import ReviewTest from './dashboard/test/reviewTest';
import RouteGuard from '../components/RouteGuard';

const Dashboard = () => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 200) {
				setIsVisible(false);
			} else {
				setIsVisible(true);
			}
		};

		window.addEventListener('scroll', handleScroll);

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	return (
		<div className="min-h-screen bg-transparent p-4">
			<div className="flex flex-col gap-4">
				<div className="flex flex-row gap-4">
					<div className="hidden lg:block">
						<div
							className={`transition-all duration-1000 ${
								isVisible ? 'opacity-100' : 'opacity-0 hidden'
							}`}
						>
							<div className="my-6">
								<video
									className="rounded-2xl shadow-2xl shadow-blue-500/20 border-2 border-blue-500/30 animate-glow"
									width="180"
									height="180"
									loop
									autoPlay
									muted
								>
									<source
										src="https://res.cloudinary.com/moisesinc/video/upload/v1751816931/recip_resource/avion2_drrbld.mp4"
										type="video/mp4"
									/>
									Tu navegador no soporta el elemento de video.
								</video>
							</div>
						</div>
					</div>

					<div className="w-full my-6">
						<div className="glass-panel p-6 animate-fade-up">
							<Routes>
								<Route path="/" element={<RouteGuard><Icons /></RouteGuard>} />
								<Route path="users" element={<RouteGuard roles={['staff']}><UsersTable /></RouteGuard>} />
								<Route path="courses" element={<RouteGuard roles={['staff', 'instructor']}><GeneralCourses /></RouteGuard>} />
								<Route path="my-courses" element={<RouteGuard roles={['student']}><StudentCourses /></RouteGuard>} />
								<Route path="students" element={<RouteGuard roles={['staff']}><TableStudents /></RouteGuard>} />
								<Route path="config" element={<RouteGuard roles={['staff']}><GeneralConfig /></RouteGuard>} />
								<Route
									path="instructors"
									element={<RouteGuard roles={['instructor', 'staff']}><TableInstructors /></RouteGuard>}
								/>
								<Route
									path="assessment"
									element={<RouteGuard roles={['instructor']}><GeneralAssessment /></RouteGuard>}
								/>
								<Route path="reports" element={<RouteGuard roles={['super_user']}><Reports /></RouteGuard>} />
								<Route path="test" element={<RouteGuard roles={['student', 'instructor']}><GeneralTest /></RouteGuard>} />
								<Route
									path="config/course/:id"
									element={<RouteGuard roles={['staff']}><CourseDetail /></RouteGuard>}
								/>
								<Route
									path="config/test/:id"
									element={<RouteGuard roles={['staff']}><TestList /></RouteGuard>}
								/>
								<Route
									path="config/testQuestion/:course_id/:test_id/:question_type_id/:test_question_type_id"
									element={<RouteGuard roles={['staff']}><QuestionTestList /></RouteGuard>}
								/>
								<Route
									path="new_course/:id/:course_id"
									element={<RouteGuard roles={['staff', 'instructor']}><NewCourse /></RouteGuard>}
								/>
								<Route
									path="view_course/:id/:course_id"
									element={<RouteGuard roles={['staff', 'instructor', 'student']}><ViewCourseStudentSchedule /></RouteGuard>}
								/>
								<Route
									path="course_assessment/:id/:course_id"
									element={<RouteGuard roles={['instructor']}><DetailAssessment /></RouteGuard>}
								/>
								<Route
									path="new_test/:id/:course_id/:test_id"
									element={<RouteGuard roles={['student', 'instructor']}><NewTest /></RouteGuard>}
								/>
								<Route
									path="review_test/:CST_id/:test_id/:course_id/:CS_id/:user_id"
									element={<RouteGuard roles={['student', 'instructor']}><ReviewTest /></RouteGuard>}
								/>
							</Routes>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
