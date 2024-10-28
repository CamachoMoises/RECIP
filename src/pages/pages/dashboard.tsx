import { Route, Routes } from 'react-router-dom';
import Icons from './dashboard/icons';
import UsersTable from './dashboard/users/usersTable';
import GeneralCourses from './dashboard/courses/generalCourses';

const Dashboard = () => {
	return (
		<>
			{/* <PageTitle title="Configuración" breadCrumbs={[]} /> */}
			<Routes>
				<Route path="/" element={<Icons />} />
				<Route path="users" element={<UsersTable />} />
				<Route path="courses" element={<GeneralCourses />} />
			</Routes>
		</>
	);
};

export default Dashboard;
