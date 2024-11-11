import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
	fetchUsers,
	updateUser,
	userInstructor,
	userStudent,
} from '../../../../features/userSlice';
import { AppDispatch, RootState } from '../../../../store';
import {
	Button,
	ButtonGroup,
	Card,
	CardBody,
	Chip,
	Typography,
} from '@material-tailwind/react';
import {
	Pencil,
	Plane,
	Plus,
	Power,
	PowerOff,
	Presentation,
	Settings,
} from 'lucide-react';
import ModalFormUser from './modalFormUser';
import { breadCrumbsItems, user } from '../../../../types/utilidades';
import PageTitle from '../../../../components/PageTitle';
import ErrorPage from '../../../../components/ErrorPage';
import LoadingPage from '../../../../components/LoadingPage';
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
			// console.log(state);

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
	const switchUser = async (user: user) => {
		const req: user = { ...user, is_active: !user.is_active };
		dispatch(updateUser(req));
	};

	useEffect(() => {
		dispatch(fetchUsers()); // Llamada al thunk para obtener los usuarios
	}, [dispatch]);

	if (status === 'loading') {
		return (
			<>
				<LoadingPage />
			</>
		);
	}

	if (status === 'failed') {
		return (
			<>
				<ErrorPage error={error ? error : 'Indefinido'} />
			</>
		);
	}

	const TABLE_HEAD = [
		'Id',
		'Nombre',
		'Telefono',
		'Email',
		'Tipo',
		'Estatus',
	];

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
												className="font-normal leading-none opacity-70 text-center"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{head}
											</Typography>
										</th>
									))}
									<th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4 justify-center">
										<Typography
											variant="small"
											color="blue-gray"
											className="font-normal leading-none opacity-70 text-center justify-center"
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
											<td className={classes}>
												{user.student?.id ? 'Piloto' : ''} <br />
												{user.instructor?.id ? 'Instructor' : ''}
											</td>
											<td className={classes}>
												{user.is_active ? (
													<Chip
														color="green"
														value="Activo"
														className="text-center"
													/>
												) : (
													<Chip
														color="red"
														value="Inativo"
														className="text-center"
													/>
												)}
											</td>

											<td>
												<ButtonGroup
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													variant="text"
													size="sm"
													color={user.is_active ? 'green' : 'red'}
												>
													{!user.student?.id && (
														<Button
															size="sm"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
															onClick={() => {
																dispatch(
																	userStudent(user.id ? user.id : -1)
																);
															}}
														>
															<Plane size={15} />
														</Button>
													)}
													{!user.instructor?.id && (
														<Button
															size="sm"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
															onClick={() => {
																dispatch(
																	userInstructor(
																		user.id ? user.id : -1
																	)
																);
															}}
														>
															<Presentation size={15} />
														</Button>
													)}
													<Button
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
														className="flex flex-col text-center justify-center "
														onClick={() => {
															switchUser(user);
														}}
														title={
															user.is_active
																? 'Desactivar'
																: 'Activar'
														}
													>
														{user.is_active ? (
															<PowerOff
																size={15}
																className="mx-auto text-lg"
															/>
														) : (
															<Power
																size={15}
																className="mx-auto text-lg"
															/>
														)}
													</Button>
													<Button
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
														onClick={() => {
															handleOpenEdit(user);
														}}
													>
														<Pencil size={18} />
													</Button>
												</ButtonGroup>
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
								Agregar
							</Typography>
							<div className="flex flex-col">
								<Button
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									className="flex flex-col text-center justify-center "
									onClick={handleOpen}
								>
									<Plus size={15} className="mx-auto text-lg" />
								</Button>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>

			{/* <code>{JSON.stringify(openNewUser, null, 4)}</code> */}
			{openNewUser && (
				<ModalFormUser
					userSelect={userSelect}
					openNewUser={openNewUser}
					handleOpen={handleOpen}
				/>
			)}
		</div>
	);
};

export default UserTable;
