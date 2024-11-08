import { Card, CardBody, Typography } from '@material-tailwind/react';
import { breadCrumbsItems } from '../../../../types/utilidades';
import PageTitle from '../../../../components/PageTitle';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { useNavigate, useParams } from 'react-router-dom';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
	{
		name: 'Cursos',
		href: '/dashboard/courses',
	},
];
const CourseDetail = () => {
	const navigate = useNavigate();
	const { courseList } = useSelector((state: RootState) => {
		console.log(state);

		return (
			state.courses || {
				list: [],
				status: 'idle2',
				error: null,
			}
		);
	});
	const { id } = useParams<{ id: string }>();
	if (!id) {
		navigate('/dashboard/courses');
	} else {
		const selectedCourse = courseList.find(
			(course) => course.id === parseInt(id)
		);
		if (selectedCourse) {
			return (
				<>
					<PageTitle
						title={`${selectedCourse.name}`}
						breadCrumbs={breadCrumbs}
					/>
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
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Actividades
							</Typography>
						</CardBody>
					</Card>
				</>
			);
		} else {
			navigate('/dashboard/courses');
		}
	}
};

export default CourseDetail;
