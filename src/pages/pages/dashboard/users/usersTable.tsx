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
} from 'lucide-react';
import ModalFormUser from './modalFormUser';
import {
	breadCrumbsItems,
	user,
	userDocType,
} from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import ErrorPage from '../../../../components/ErrorPage';
import LoadingPage from '../../../../components/LoadingPage';
import { axiosGetDefault } from '../../../../services/axios';
import toast from 'react-hot-toast';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];
const UserTable = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [openNewUser, setOpenNewUser] = useState(false);
	const [userSelect, setUserSelect] = useState<user | null>(null);
	const [userDocTypes, setUserDocTypes] = useState<
		userDocType[] | null
	>(null);
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
	const handleOpen = async (user: user | null = null) => {
		const { resp, status } = await axiosGetDefault(
			'api/users/userDocType'
		);
		if (status > 199 && status < 400) {
			setUserDocTypes(resp);
			setUserSelect(user);
			setOpenNewUser(!openNewUser);
		} else {
			toast.error('Ocurrio un error al consultar el servidor');
		}
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
		'Edit',
	];

	return (
		<div className="container">
			<PageTitle title="Usuarios" breadCrumbs={breadCrumbs} />
			{/* <code>{JSON.stringify(usersList)}</code> */}
			<div className="flex flex-col gap-3">
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
									onClick={() => {
										handleOpen(null);
									}}
								>
									<Plus size={15} className="mx-auto text-lg" />
								</Button>
							</div>
						</CardBody>
					</Card>
				</div>
				<div className="flex flex-col col-span-5">
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
						<table>
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
											<td className={classes}>
												{user.user_doc_type?.symbol}-{user.doc_number}
											</td>
											<td className={classes}>
												{user.name} {user.last_name}
											</td>
											<td className={classes}>{user.phone}</td>
											<td className={classes}>{user.email}</td>
											<td className={classes}>
												{!user.student?.id && !user.instructor?.id
													? 'Sin Roles'
													: ''}
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

											<td className={classes}>
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
															handleOpen(user);
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
			</div>

			{/* <code>{JSON.stringify(openNewUser, null, 4)}</code> */}
			{openNewUser && userDocTypes && (
				<ModalFormUser
					userSelect={userSelect}
					openNewUser={openNewUser}
					handleOpen={handleOpen}
					userDocTypes={userDocTypes}
					module={0}
				/>
			)}
		</div>
	);
};

export default UserTable;
