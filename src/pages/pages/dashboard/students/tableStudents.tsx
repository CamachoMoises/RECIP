import { useDispatch, useSelector } from 'react-redux';
import PageTitle from '../../../../components/PageTitle';
import {
	breadCrumbsItems,
	user,
	userDocType,
} from '../../../../types/utilities';
import { AppDispatch, RootState } from '../../../../store';
import {
	Button,
	Card,
	CardBody,
	CardHeader,
	Typography,
	Avatar,
	Tooltip,
	IconButton,
	Input,
	Chip,
} from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { fetchStudents } from '../../../../features/userSlice';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { axiosGetDefault } from '../../../../services/axios';
import toast from 'react-hot-toast';
import ModalFormUser from '../users/modalFormUser';
import { PermissionsValidate } from '../../../../services/permissionsValidate';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
];

const TableStudents = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [openNewUser, setOpenNewUser] = useState(false);
	const [userSelect, setUserSelect] = useState<user | null>(null);
	const [userDocTypes, setUserDocTypes] = useState<
		userDocType[] | null
	>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const { studentList } = useSelector(
		(state: RootState) => state.users
	);

	const validated = PermissionsValidate(['instructor', 'staff']);

	const filteredStudents = studentList?.filter(
		(student) =>
			`${student.name} ${student.last_name}`
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			student.email
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			student.phone?.toLowerCase().includes(searchTerm.toLowerCase())
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
		dispatch(fetchStudents({ status: true }));
	}, [dispatch]);

	return (
		<>
			<PageTitle
				title="Pilotos / Participantes"
				breadCrumbs={breadCrumbs}
			/>

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
								Gestión de Pilotos
							</Typography>

							<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
								<div className="relative flex w-full md:w-72">
									<Input
										type="text"
										placeholder="Buscar piloto..."
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
									Nuevo Piloto
								</Button>
							</div>
						</div>
					</CardBody>
				</Card>

				{/* Lista de estudiantes */}
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
							Listado de Pilotos
						</Typography>
					</CardHeader>

					<CardBody
						className="p-0"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="overflow-x-auto">
							<table className="w-full min-w-max table-auto">
								<thead>
									<tr>
										<th className="border-b border-blue-gray-50 py-3 px-4 text-left">
											<Typography
												variant="small"
												color="blue-gray"
												className="font-bold"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Piloto
											</Typography>
										</th>
										<th className="border-b border-blue-gray-50 py-3 px-4 text-left">
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
										<th className="border-b border-blue-gray-50 py-3 px-4 text-left">
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
										<th className="border-b border-blue-gray-50 py-3 px-4 text-center">
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
									{filteredStudents?.map((student) => (
										<tr
											key={student.id}
											className="hover:bg-blue-gray-50/50 transition-colors"
										>
											<td className="py-3 px-4 border-b border-blue-gray-50">
												<div className="flex items-center gap-3">
													<Avatar
														src={student.email || undefined}
														alt={`${student.name} ${student.last_name}`}
														variant="circular"
														size="sm"
														placeholder={undefined}
														withBorder={true}
														className="border-2 border-white shadow-lg shadow-blue-gray-500/10"
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													/>
													<div>
														<Typography
															variant="small"
															color="blue-gray"
															className="font-semibold"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															{student.name} {student.last_name}
														</Typography>
														<Typography
															variant="small"
															color="blue-gray"
															className="text-xs opacity-70"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															ID: {student.id}
														</Typography>
													</div>
												</div>
											</td>
											<td className="py-3 px-4 border-b border-blue-gray-50">
												<div className="flex flex-col">
													<Typography
														variant="small"
														color="blue-gray"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{student.email}
													</Typography>
													<Typography
														variant="small"
														color="blue-gray"
														className="text-xs"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{student.phone || 'Sin teléfono'}
													</Typography>
												</div>
											</td>
											<td className="py-3 px-4 border-b border-blue-gray-50">
												<Chip
													variant="ghost"
													color={
														student.is_superuser ? 'green' : 'red'
													}
													size="sm"
													value={
														student.is_superuser
															? 'Super user'
															: 'Regular'
													}
													className="w-fit capitalize"
												/>
											</td>
											<td className="py-3 px-4 border-b border-blue-gray-50 text-center">
												<div className="flex justify-center gap-2">
													<Tooltip content="Editar">
														<IconButton
															variant="text"
															color="blue-gray"
															onClick={() => handleOpen(student)}
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
					module={1}
				/>
			)}
		</>
	);
};

export default TableStudents;
