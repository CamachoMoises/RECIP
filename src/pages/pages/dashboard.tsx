import { Route, Routes } from 'react-router-dom';
import Icons from './dashboard/icons';
import UsersTable from './dashboard/users/usersTable';
import GeneralCourses from './dashboard/courses/generalCourses';
import CourseDetail from './dashboard/courses/courseDetail';
import NewCourse from './dashboard/courses/newCourse';
import TableStudents from './dashboard/students/tableStudents';
import TableInstructors from './dashboard/intructors/tableInstructors';
import GenerealAssessment from './dashboard/assessment/generealAssessment';
import NewAssessment from './dashboard/assessment/newAssessment';

const Dashboard = () => {
	return (
		<>
			{/* <PageTitle title="Configuración" breadCrumbs={[]} /> */}
			<Routes>
				<Route path="/" element={<Icons />} />
				<Route path="users" element={<UsersTable />} />
				<Route path="courses" element={<GeneralCourses />} />
				<Route path="students" element={<TableStudents />} />
				<Route path="instructors" element={<TableInstructors />} />
				<Route path="assessment" element={<GenerealAssessment />} />
				<Route path="course/:id" element={<CourseDetail />} />
				<Route
					path="new_course/:id/:course_id"
					element={<NewCourse />}
				/>
				<Route
					path="course_assessment/:id/:course_id"
					element={<NewAssessment />}
				/>
			</Routes>
		</>
	);
};

export default Dashboard;
