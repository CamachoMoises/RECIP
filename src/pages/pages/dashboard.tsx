import { Route, Routes } from 'react-router-dom';
import Icons from './dashboard/icons';
import UsersTable from './dashboard/users/usersTable';
import GeneralCourses from './dashboard/courses/generalCourses';
import CourseDetail from './dashboard/courses/courseDetail';
import NewCourse from './dashboard/courses/newCourse';

const Dashboard = () => {
	return (
		<>
			{/* <PageTitle title="Configuración" breadCrumbs={[]} /> */}
			<Routes>
				<Route path="/" element={<Icons />} />
				<Route path="users" element={<UsersTable />} />
				<Route path="courses" element={<GeneralCourses />} />
				<Route path="course/:id" element={<CourseDetail />} />
				<Route path="new_course/:id" element={<NewCourse />} />
			</Routes>
		</>
	);
};

export default Dashboard;
