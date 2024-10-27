import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../../../features/userSlice';
import { AppDispatch, RootState } from '../../../../store';
import {
	Button,
	Card,
	CardBody,
	Typography,
} from '@material-tailwind/react';
import { Pencil, Plus, Settings } from 'lucide-react';
import ModalNewUser from './modalNewUser';
import { breadCrumbsItems, user } from '../../../../types/utilidades';
import PageTitle from '../../../../components/PageTitle';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
];
const UserTable = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [userSelect, setUserSelect] = useState<user | null>(null);
	const { usersList, status, error } = useSelector(
		(state: RootState) => {
			console.log(state);

			return (
				state.users || {
					list: [],
					status: 'idle2',
					error: null,
				}
			);
		}
	);
	const [openNewUser, setOpenNewUser] = useState(false);
	const handleOpen = () => {
		setUserSelect(null);
		setOpenNewUser(!openNewUser);
	};
	const handleOpenEdit = (user: user) => {
		setUserSelect(user);
		setOpenNewUser(true);
	};

	useEffect(() => {
		dispatch(fetchUsers()); // Llamada al thunk para obtener los usuarios
	}, [dispatch]);

	if (status === 'loading') {
		return (
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Cargando usuarios...
			</Typography>
		);
	}

	if (status === 'failed') {
		return (
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Error: {error}
			</Typography>
		);
	}

	const TABLE_HEAD = ['Id', 'Nombre', 'Telefono', 'Email'];

	return (
		<div className="container">
			<PageTitle title="Usuarios" breadCrumbs={breadCrumbs} />
			<div className="grid lg:grid-cols-4 gap-2">
				<div className="flex flex-col col-span-3">
					<Card
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						className="h-full w-full pt-3"
					>
						<Typography
							variant="h5"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Usuarios
						</Typography>
						<table className="w-full min-w-max table-auto text-left">
							<thead>
								<tr>
									{TABLE_HEAD.map((head) => (
										<th
											key={head}
											className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
										>
											<Typography
												variant="small"
												color="blue-gray"
												className="font-normal leading-none opacity-70"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{head}
											</Typography>
										</th>
									))}
									<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-normal leading-none opacity-70"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											<Settings />
										</Typography>
									</th>
								</tr>
							</thead>
							<tbody>
								{usersList.map((user, index) => {
									const isLast = index === usersList.length - 1;
									const classes = isLast
										? 'p-4'
										: 'p-4 border-b border-blue-gray-50';

									return (
										<tr key={user.id}>
											<td className={classes}>{user.id}</td>
											<td className={classes}>
												{user.name} {user.last_name}
											</td>
											<td className={classes}>{user.phone}</td>
											<td className={classes}>{user.email}</td>
											<td>
												<Button
													variant="text"
													size="sm"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													onClick={() => {
														handleOpenEdit(user);
													}}
												>
													<Pencil size={18} />
												</Button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</Card>
				</div>
				<div className="flex flex-col">
					<Card
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<CardBody
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Typography
								variant="h5"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Configuracion
							</Typography>
							<div className="flex flex-col">
								<Button
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									className="text-center justify-center"
									onClick={handleOpen}
								>
									<Plus size={15} />
								</Button>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>

			{/* <code>{JSON.stringify(openNewUser, null, 4)}</code> */}
			{openNewUser && (
				<ModalNewUser
					userSelect={userSelect}
					openNewUser={openNewUser}
					handleOpen={handleOpen}
				/>
			)}
		</div>
	);
};

export default UserTable;
