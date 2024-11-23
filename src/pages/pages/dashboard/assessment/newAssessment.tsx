import { useDispatch, useSelector } from 'react-redux';
import { breadCrumbsItems } from '../../../../types/utilidades';
import { AppDispatch, RootState } from '../../../../store';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import PageTitle from '../../../../components/PageTitle';
import { Card, CardBody, Typography } from '@material-tailwind/react';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
	{
		name: 'Evaluaciones',
		href: '/dashboard/assessment',
	},
];

const NewAssessment = () => {
	const componentRef = useRef<HTMLDivElement>(null);

	const dispatch = useDispatch<AppDispatch>();

	const { course, subject, user } = useSelector(
		(state: RootState) => {
			return {
				course: state.courses,
				subject: state.subjects,
				user: state.users,
			};
		}
	);
	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Evaluacion-${course.courseStudent?.code}`,
	});
	const days = course.courseSelected
		? Array.from({ length: course.courseSelected.days }, (_, i) => ({
				id: i,
				name: `Dia ${i + 1}`,
		  }))
		: [];
	if (course.status === 'loading') {
		return (
			<>
				<LoadingPage />
			</>
		);
	}
	if (course.status === 'failed') {
		return (
			<>
				<ErrorPage
					error={course.error ? course.error : 'Indefinido'}
				/>
			</>
		);
	}
	return (
		<div className="container">
			<PageTitle
				title={`Evaluacion de ${course.courseSelected?.name}`}
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
					<div className="bg-blue-100 rounded-md">
						<Typography
							variant="h5"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{course.courseSelected?.name}
						</Typography>
						<Typography
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							variant="lead"
						>
							{course.courseSelected?.description}
						</Typography>
						<Typography
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							variant="lead"
						>
							{course.courseStudent?.code}
						</Typography>
					</div>
					<hr />
				</CardBody>
			</Card>
		</div>
	);
};

export default NewAssessment;
