import { Card, CardBody, Typography } from '@material-tailwind/react';
import { breadCrumbsItems } from '../../../../types/utilidades';
import PageTitle from '../../../../components/PageTitle';
import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchCourses } from '../../../../features/courseSlice';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
];
const GeneralCourses = () => {
	const dispatch = useDispatch<AppDispatch>();

	const { courseList, status, error } = useSelector(
		(state: RootState) => {
			// console.log(state);

			return (
				state.courses || {
					list: [],
					status: 'idle2',
					error: null,
				}
			);
		}
	);
	useEffect(() => {
		dispatch(fetchCourses()); // Llamada al thunk para obtener los usuarios
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

	return (
		<div className="container">
			<PageTitle title="Cursos" breadCrumbs={breadCrumbs} />
			{/* <code>{JSON.stringify(courseList, null, 4)}</code> */}
			{/* <Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				OJO
			</Typography> */}
			<div className="grid grid-cols-5 gap-2">
				<div className="flex flex-col col-span-3">
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
								variant="h5"
							>
								Cursos actuales
							</Typography>
							<div className="grid grid-cols-2 gap-2">
								{courseList.map((course) => {
									return (
										<div key={course.id}>
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
														onPointerLeaveCapture
														variant="small"
													>
														{course.name}
													</Typography>
													<Typography
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{course.course_type.name}
													</Typography>
												</CardBody>
											</Card>
										</div>
									);
								})}
							</div>
						</CardBody>
					</Card>
				</div>
				<div className="flex flex-col col-span-2">
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
								variant="h5"
							>
								Editar Cursos
							</Typography>
						</CardBody>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default GeneralCourses;
