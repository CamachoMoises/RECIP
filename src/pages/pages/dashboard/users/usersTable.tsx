import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import {
	fetchUsers,
	updateUser,
	userInstructor,
	userStudent,
} from '../../../../features/userSlice';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Chip,
	Typography,
	Tooltip,
	IconButton,
	Input,
} from '@material-tailwind/react';
import {
	Pencil,
	Plane,
	Plus,
	Power,
	PowerOff,
	Presentation,
	Search,
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
	const [searchTerm, setSearchTerm] = useState('');
	const { usersList, status, error } = useSelector(
		(state: RootState) => state.users
	);

	const filteredUsers = usersList?.filter(
		(user) =>
			`${user.name} ${user.last_name}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			`${user.user_doc_type?.symbol}-${user.doc_number}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase())
	);

	const handleOpen = async (user: user | null = null) => {
		try {
			const { resp, status } = await axiosGetDefault(
				'api/users/userDocType'
			);
			if (status > 199 && status < 400) {
				setUserDocTypes(resp);
				setUserSelect(user);
				setOpenNewUser(!openNewUser);
			} else {
				toast.error('Ocurrió un error al consultar el servidor');
			}
		} catch (err) {
			toast.error('Error al cargar tipos de documento');
			console.error(err);
		}
	};

	const switchUser = async (user: user) => {
		const req: user = { ...user, is_active: !user.is_active };
		dispatch(updateUser(req));
	};

	useEffect(() => {
		dispatch(fetchUsers());
	}, [dispatch]);

	if (status === 'loading') {
		return <LoadingPage />;
	}

	if (status === 'failed') {
		return <ErrorPage error={error || 'Error indefinido'} />;
	}

	const TABLE_HEAD = [
		'ID',
		'Nombre',
		'Teléfono',
		'Email',
		'Tipo',
		'Estatus',
		'Acciones',
	];

	return (
		<div className="container mx-auto px-4">
			<PageTitle title="Administradores" breadCrumbs={breadCrumbs} />

			<div className="flex flex-col gap-6">
				{/* Card de acciones */}
				<Card
					className="w-full"
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					placeholder={undefined}
				>
					<CardBody
						className="p-4 md:p-6"
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
					>
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<Typography
								variant="h4"
								color="blue-gray"
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								placeholder={undefined}
							>
								Gestión de Usuarios
							</Typography>

							<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
								<div className="relative flex w-full md:w-72">
									<Input
										type="text"
										placeholder="Buscar usuario..."
										className="pr-8"
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										containerProps={{ className: 'min-w-[100px]' }}
										labelProps={{ className: 'hidden' }}
										crossOrigin={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									/>
									<Search className="absolute right-3 top-2.5 h-5 w-5 text-blue-gray-300" />
								</div>

								<Button
									className="flex items-center gap-2"
									color="blue"
									onClick={() => handleOpen(null)}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									placeholder={undefined}
								>
									<Plus size={18} />
									Nuevo Usuario
								</Button>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Tabla de usuarios */}
				<Card
					className="w-full overflow-hidden"
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					placeholder={undefined}
				>
					<CardHeader
						floated={false}
						shadow={false}
						color="transparent"
						className="m-0 p-4 md:p-6 border-b"
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
					>
						<Typography
							variant="h5"
							color="blue-gray"
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							placeholder={undefined}
						>
							Listado de Usuarios
						</Typography>
						<Typography
							variant="small"
							color="gray"
							className="mt-1"
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							placeholder={undefined}
						>
							{filteredUsers?.length || 0} usuarios registrados
						</Typography>
					</CardHeader>

					<CardBody
						className="p-0"
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
					>
						<div className="overflow-x-auto">
							<table className="w-full min-w-max">
								<thead>
									<tr>
										{TABLE_HEAD.map((head) => (
											<th
												key={head}
												className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4"
											>
												<Typography
													variant="small"
													color="blue-gray"
													className="font-bold text-center"
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													placeholder={undefined}
												>
													{head}
												</Typography>
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{filteredUsers?.length ? (
										filteredUsers.map((user) => {
											const userType = [];
											if (user.student?.id) userType.push('Piloto');
											if (user.instructor?.id)
												userType.push('Instructor');
											if (userType.length === 0)
												userType.push('Sin Roles');

											return (
												<tr
													key={user.id}
													className="hover:bg-blue-gray-50/50"
												>
													<td className="py-3 px-4 border-b border-blue-gray-100 text-center">
														{user.user_doc_type?.symbol}-
														{user.doc_number}
													</td>
													<td className="py-3 px-4 border-b border-blue-gray-100">
														<div className="flex items-center gap-3">
															{/* <Avatar
																src={user.photo || undefined}
																alt={`${user.name} ${user.last_name}`}
																size="sm"
																className="border-2 border-white shadow-lg shadow-blue-gray-500/10"
																placeholder={undefined}
															>
																{!user.photo && (
																	<User className="h-4 w-4" />
																)}
															</Avatar> */}
															<div>
																<Typography
																	variant="small"
																	color="blue-gray"
																	className="font-semibold"
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																	placeholder={undefined}
																>
																	{user.name} {user.last_name}
																</Typography>
															</div>
														</div>
													</td>
													<td className="py-3 px-4 border-b border-blue-gray-100 text-center">
														{user.phone || 'N/A'}
													</td>
													<td className="py-3 px-4 border-b border-blue-gray-100 text-center">
														{user.email}
													</td>
													<td className="py-3 px-4 border-b border-blue-gray-100 text-center">
														{userType.join(' / ')}
													</td>
													<td className="py-3 px-4 border-b border-blue-gray-100 text-center">
														<Chip
															color={user.is_active ? 'green' : 'red'}
															value={
																user.is_active ? 'Activo' : 'Inactivo'
															}
															className="capitalize"
														/>
													</td>
													<td className="py-3 px-4 border-b border-blue-gray-100 text-center">
														<div className="flex justify-center gap-1">
															{!user.student?.id && (
																<Tooltip content="Hacer Piloto">
																	<IconButton
																		variant="text"
																		color="blue"
																		onClick={() =>
																			dispatch(
																				userStudent(user.id || -1)
																			)
																		}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																		placeholder={undefined}
																	>
																		<Plane className="h-4 w-4" />
																	</IconButton>
																</Tooltip>
															)}
															{!user.instructor?.id && (
																<Tooltip content="Hacer Instructor">
																	<IconButton
																		variant="text"
																		color="amber"
																		onClick={() =>
																			dispatch(
																				userInstructor(user.id || -1)
																			)
																		}
																		onPointerEnterCapture={undefined}
																		onPointerLeaveCapture={undefined}
																		placeholder={undefined}
																	>
																		<Presentation className="h-4 w-4" />
																	</IconButton>
																</Tooltip>
															)}
															<Tooltip
																content={
																	user.is_active
																		? 'Desactivar'
																		: 'Activar'
																}
															>
																<IconButton
																	variant="text"
																	color={
																		user.is_active ? 'red' : 'green'
																	}
																	onClick={() => switchUser(user)}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																	placeholder={undefined}
																>
																	{user.is_active ? (
																		<PowerOff className="h-4 w-4" />
																	) : (
																		<Power className="h-4 w-4" />
																	)}
																</IconButton>
															</Tooltip>
															<Tooltip content="Editar">
																<IconButton
																	variant="text"
																	color="blue-gray"
																	onClick={() => handleOpen(user)}
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	<Pencil className="h-4 w-4" />
																</IconButton>
															</Tooltip>
														</div>
													</td>
												</tr>
											);
										})
									) : (
										<tr>
											<td
												colSpan={TABLE_HEAD.length}
												className="py-6 text-center"
											>
												<Typography
													variant="small"
													color="blue-gray"
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													placeholder={undefined}
												>
													No se encontraron usuarios
												</Typography>
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</CardBody>
				</Card>
			</div>

			{/* Modal */}
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
