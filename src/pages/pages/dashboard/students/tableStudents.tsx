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
	List,
	ListItem,
	Typography,
} from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { fetchStudents } from '../../../../features/userSlice';
import { Plus } from 'lucide-react';
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
	const { studentList } = useSelector((state: RootState) => {
		return state.users;
	});
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
	useEffect(() => {
		dispatch(fetchStudents());
	}, [dispatch]);
	const validated = PermissionsValidate(['instructor', 'staff']);
	return (
		<>
			<PageTitle
				title="Pilotos / Participantes"
				breadCrumbs={breadCrumbs}
			/>
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
								Agregar Piloto / Participante
							</Typography>
							<div className="flex flex-col">
								<Button
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									disabled={!validated}
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
					>
						<CardBody
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<List
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{studentList?.map((student) => (
									<ListItem
										key={`${student.id}.courseList`}
										placeholder={undefined}
										disabled={!validated}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										onClick={() => handleOpen(student)}
									>
										{/* <ListItemPrefix
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{student.}
								</ListItemPrefix> */}
										<div className="flex flex-row align-middle justify-center gap-5">
											<div className="flex flex-col ">
												<Typography
													variant="h6"
													color="blue-gray"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Piloto{' '}
												</Typography>
												<Typography
													variant="small"
													color="gray"
													className="font-normal"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{student.name} {student.last_name}
												</Typography>
											</div>
											<div className="flex flex-col ">
												<Typography
													variant="h6"
													color="blue-gray"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Correo
												</Typography>
												<Typography
													variant="small"
													color="gray"
													className="font-normal"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{student.email}
												</Typography>
											</div>
											<div className="flex flex-col ">
												<Typography
													variant="h6"
													color="blue-gray"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Telefono
												</Typography>
												<Typography
													variant="small"
													color="gray"
													className="font-normal"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													{student.phone}
												</Typography>
											</div>
										</div>
									</ListItem>
								))}
							</List>
						</CardBody>
					</Card>
				</div>
			</div>
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
