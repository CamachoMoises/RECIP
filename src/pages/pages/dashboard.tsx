import { Route, Routes } from 'react-router-dom';
import Icons from './dashboard/icons';
import UsersTable from './dashboard/users/usersTable';
import GeneralCourses from './dashboard/courses/generalCourses';
import CourseDetail from './dashboard/courses/courseDetail';
import NewCourse from './dashboard/courses/newCourse';
import TableStudents from './dashboard/students/tableStudents';
import TableInstructors from './dashboard/intructors/tableInstructors';
import GeneralAssessment from './dashboard/assessment/generealAssessment';
import NewAssessment from './dashboard/assessment/newAssessment';
import NewTest from './dashboard/test/newTest';
import GeneralTest from './dashboard/test/generalTest';

const Dashboard = () => {
	return (
		<div className="video-container">
			<div className="flex flex-col p-2">
				<div className=" flex flex-row gap-3 ">
					<div>
						<video
							className="rounded-lg shadow-lg"
							width="150"
							height="150"
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
					<div className="w-full">
						{/* <PageTitle title="Configuración" breadCrumbs={[]} /> */}
						<Routes>
							<Route path="/" element={<Icons />} />
							<Route path="users" element={<UsersTable />} />
							<Route path="courses" element={<GeneralCourses />} />
							<Route path="students" element={<TableStudents />} />
							<Route
								path="instructors"
								element={<TableInstructors />}
							/>
							<Route
								path="assessment"
								element={<GeneralAssessment />}
							/>
							<Route path="test" element={<GeneralTest />} />
							<Route path="course/:id" element={<CourseDetail />} />
							<Route
								path="new_course/:id/:course_id"
								element={<NewCourse />}
							/>
							<Route
								path="course_assessment/:id/:course_id"
								element={<NewAssessment />}
							/>
							<Route
								path="new_test/:id/:course_id"
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
