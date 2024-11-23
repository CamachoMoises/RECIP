import { useDispatch, useSelector } from 'react-redux';
import PageTitle from '../../../../components/PageTitle';
import { breadCrumbsItems } from '../../../../types/utilidades';
import { AppDispatch, RootState } from '../../../../store';
import {
	Card,
	CardBody,
	List,
	ListItem,
	Typography,
} from '@material-tailwind/react';
import { useEffect } from 'react';
import { fetchStudents } from '../../../../features/userSlice';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
];
const TableStudents = () => {
	const dispatch = useDispatch<AppDispatch>();

	const { studentList } = useSelector((state: RootState) => {
		console.log(state);

		return (
			state.users || {
				studentList: [],
				status: 'idle2',
				error: null,
			}
		);
	});
	useEffect(() => {
		dispatch(fetchStudents());
	}, [dispatch]);
	return (
		<>
			<PageTitle title="Pilotos" breadCrumbs={breadCrumbs} />
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
						{studentList?.map((CL) => (
							<ListItem
								key={`${CL.id}.courseList`}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								// onClick={() =>
								// 	navigate(`../new_course/${CL.id}/${CL.course_id}`)
								// }
							>
								{/* <ListItemPrefix
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{CL.}
								</ListItemPrefix> */}
								<div>
									<Typography
										variant="h6"
										color="blue-gray"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Piloto
									</Typography>
									<Typography
										variant="small"
										color="gray"
										className="font-normal"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{CL.name} {CL.last_name}
									</Typography>
								</div>
							</ListItem>
						))}
					</List>
				</CardBody>
			</Card>
		</>
	);
};

export default TableStudents;
