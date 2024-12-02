import { useEffect } from 'react';
import { breadCrumbsItems } from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import {
	Card,
	CardBody,
	List,
	ListItem,
	Typography,
} from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { fetchInstructors } from '../../../../features/userSlice';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
];
const TableInstructors = () => {
	const dispatch = useDispatch<AppDispatch>();

	const { instructorList } = useSelector((state: RootState) => {
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
		dispatch(fetchInstructors());
	}, [dispatch]);
	return (
		<>
			<PageTitle title="Instructores" breadCrumbs={breadCrumbs} />
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
						{instructorList?.map((CL) => (
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

export default TableInstructors;
