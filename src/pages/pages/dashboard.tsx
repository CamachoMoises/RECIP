import { Route, Routes } from 'react-router-dom';
import Icons from './dashboard/icons';
import UsersTable from './dashboard/users/usersTable';

const Dashboard = () => {
	return (
		<>
			{/* <PageTitle title="Configuración" breadCrumbs={[]} /> */}
			<Routes>
				<Route path="/" element={<Icons />} />
				<Route path="users" element={<UsersTable />} />
			</Routes>
		</>
	);
};

export default Dashboard;
