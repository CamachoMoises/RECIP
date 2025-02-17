import { useEffect, useState } from 'react';
import {
	breadCrumbsItems,
	user,
	userDocType,
} from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import {
	Button,
	Card,
	CardBody,
	List,
	ListItem,
	Typography,
} from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { fetchInstructors } from '../../../../features/userSlice';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { axiosGetDefault } from '../../../../services/axios';
import ModalFormUser from '../users/modalFormUser';
import { PermissionsValidate } from '../../../../services/permissionsValidate';
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
	const { instructorList } = useSelector((state: RootState) => {
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
		dispatch(fetchInstructors());
	}, [dispatch]);
	const validated = PermissionsValidate(['instructor', 'staff']);

	return (
		<>
			<PageTitle title="Instructores" breadCrumbs={breadCrumbs} />
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
								Agregar Instructor
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
							{instructorList?.map((instructor) => (
								<ListItem
									key={`${instructor.id}.courseList`}
									placeholder={undefined}
									disabled={!validated}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									onClick={() => handleOpen(instructor)}
								>
									{/* <ListItemPrefix
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{instructor.}
								</ListItemPrefix> */}
									<div>
										<Typography
											variant="h6"
											color="blue-gray"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Instructor
										</Typography>
										<Typography
											variant="small"
											color="gray"
											className="font-normal"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{instructor.name} {instructor.last_name}
										</Typography>
									</div>
								</ListItem>
							))}
						</List>
					</CardBody>
				</Card>
			</div>
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
