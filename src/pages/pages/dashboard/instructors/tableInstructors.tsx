import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { fetchInstructors } from '../../../../features/userSlice';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Typography,
	Tooltip,
	IconButton,
	Input,
	Chip,
} from '@material-tailwind/react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { axiosGetDefault } from '../../../../services/axios';
import toast from 'react-hot-toast';
import PageTitle from '../../../../components/PageTitle';
import ModalFormUser from '../users/modalFormUser';
import { PermissionsValidate } from '../../../../services/permissionsValidate';
import {
	breadCrumbsItems,
	user,
	userDocType,
} from '../../../../types/utilities';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];

const TableInstructors = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [openNewUser, setOpenNewUser] = useState(false);
	const [userSelect, setUserSelect] = useState<user | null>(null);
	const [userDocTypes, setUserDocTypes] = useState<
		userDocType[] | null
	>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const { instructorList } = useSelector(
		(state: RootState) => state.users
	);

	const validated = PermissionsValidate(['instructor', 'staff']);

	const filteredInstructors = instructorList?.filter(
		(instructor) =>
			`${instructor.name} ${instructor.last_name}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			instructor.email
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			instructor.phone
				?.toLowerCase()
				.includes(searchTerm.toLowerCase())
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
			toast.error('Ocurrió un error al consultar el servidor');
		}
	};

	useEffect(() => {
		dispatch(fetchInstructors());
	}, [dispatch]);

	return (
		<>
			<PageTitle title="Instructores" breadCrumbs={breadCrumbs} />

			<div className="flex flex-col gap-6">
				{/* Card de acciones */}
				<Card
					className="w-full"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<CardBody
						className="p-4 md:p-6"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
							<Typography
								variant="h4"
								color="blue-gray"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Gestión de Instructores
							</Typography>

							<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
								<div className="relative flex w-full md:w-72">
									<Input
										type="text"
										placeholder="Buscar instructor..."
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
									disabled={!validated}
									onClick={() => handleOpen(null)}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<Plus size={18} />
									Nuevo Instructor
								</Button>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Lista de instructores */}
				<Card
					className="w-full overflow-hidden"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<CardHeader
						floated={false}
						shadow={false}
						color="transparent"
						className="m-0 p-4 md:p-6 border-b"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Typography
							variant="h5"
							color="blue-gray"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Listado de Instructores
						</Typography>
						<Typography
							variant="small"
							color="gray"
							className="mt-1"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{filteredInstructors?.length || 0} instructores
							registrados
						</Typography>
					</CardHeader>

					<CardBody
						className="p-0"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="overflow-x-auto">
							<table className="w-full min-w-max">
								<thead>
									<tr>
										<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
											<Typography
												variant="small"
												color="blue-gray"
												className="font-bold"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Instructor
											</Typography>
										</th>
										<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
											<Typography
												variant="small"
												color="blue-gray"
												className="font-bold"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Contacto
											</Typography>
										</th>
										<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-left">
											<Typography
												variant="small"
												color="blue-gray"
												className="font-bold"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Estado
											</Typography>
										</th>
										<th className="border-b border-blue-gray-100 bg-blue-gray-50 py-3 px-4 text-center">
											<Typography
												variant="small"
												color="blue-gray"
												className="font-bold"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Acciones
											</Typography>
										</th>
									</tr>
								</thead>
								<tbody>
									{filteredInstructors?.map((instructor) => (
										<tr
											key={instructor.id}
											className="hover:bg-blue-gray-50/50"
										>
											<td className="py-3 px-4 border-b border-blue-gray-100">
												<div className="flex items-center gap-3">
													{/* <Avatar
														src={instructor.email || undefined}
														alt={`${instructor.name} ${instructor.last_name}`}
														variant="circular"
														size="sm"
														withBorder={true}
														className="border-2 border-white shadow-lg shadow-blue-gray-500/10"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														<User className="h-4 w-4" />
													</Avatar> */}
													<div>
														<Typography
															variant="small"
															color="blue-gray"
															className="font-semibold"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															{instructor.name} {instructor.last_name}
														</Typography>
														<Typography
															variant="small"
															color="blue-gray"
															className="text-xs opacity-70"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															ID: {instructor.id}
														</Typography>
													</div>
												</div>
											</td>
											<td className="py-3 px-4 border-b border-blue-gray-100">
												<div className="flex flex-col">
													<Typography
														variant="small"
														color="blue-gray"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{instructor.email}
													</Typography>
													<Typography
														variant="small"
														color="blue-gray"
														className="text-xs"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{instructor.phone || 'Sin teléfono'}
													</Typography>
												</div>
											</td>
											<td className="py-3 px-4 border-b border-blue-gray-100">
												<div className="flex flex-col gap-1">
													<Chip
														variant="ghost"
														color={
															instructor.is_active ? 'green' : 'red'
														}
														size="sm"
														value={
															instructor.is_active
																? 'Activo'
																: 'Inactivo'
														}
														className="w-fit capitalize"
													/>
													{instructor.instructor?.status && (
														<Chip
															variant="ghost"
															color="blue"
															size="sm"
															value="Disponible"
															className="w-fit capitalize"
														/>
													)}
												</div>
											</td>
											<td className="py-3 px-4 border-b border-blue-gray-100 text-center">
												<div className="flex justify-center gap-2">
													<Tooltip content="Editar">
														<IconButton
															variant="text"
															color="blue-gray"
															onClick={() => handleOpen(instructor)}
															disabled={!validated}
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															<Pencil className="h-4 w-4" />
														</IconButton>
													</Tooltip>
													<Tooltip content="Eliminar">
														<IconButton
															variant="text"
															color="red"
															disabled={!validated}
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															<Trash2 className="h-4 w-4" />
														</IconButton>
													</Tooltip>
												</div>
											</td>
										</tr>
									))}
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
					module={2}
				/>
			)}
		</>
	);
};

export default TableInstructors;
