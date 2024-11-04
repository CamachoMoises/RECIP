import {
	Button,
	Card,
	CardBody,
	Typography,
} from '@material-tailwind/react';
import {
	breadCrumbsItems,
	course,
	courseType,
} from '../../../../types/utilidades';
import PageTitle from '../../../../components/PageTitle';
import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchCourses } from '../../../../features/courseSlice';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import { axiosGetDefault } from '../../../../services/axios';
import ModalFormCourse from './modalFormCourse';
import toast from 'react-hot-toast';
import { Pencil, Plus } from 'lucide-react';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
];
const GeneralCourses = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [courseSelected, setCourseSelected] = useState<course | null>(
		null
	);
	const [courseTypes, setCourseTypes] = useState<courseType[] | null>(
		null
	);
	const { courseList, status, error } = useSelector(
		(state: RootState) => {
			console.log(state);

			return (
				state.courses || {
					list: [],
					status: 'idle2',
					error: null,
				}
			);
		}
	);
	const [openNewCourse, setOpenNewCourse] = useState(false);

	useEffect(() => {
		dispatch(fetchCourses()); // Llamada al thunk para obtener los usuarios
	}, [dispatch]);

	const handleOpenEdit = async (course: course | null = null) => {
		const { resp, status } = await axiosGetDefault(
			'api/courses/courseTypes'
		);
		if (status > 199 && status < 400) {
			setCourseTypes(resp);
			setCourseSelected(course);
			setOpenNewCourse(!openNewCourse);
		} else {
			toast.error('Ocurrio un error al consultar el servidor');
		}
	};

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
			{/* 
				<Typography
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					OJO
				</Typography> 
			*/}
			<div className="grid lg:grid-cols-4 gap-2">
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
								{/* <code>{JSON.stringify(courseList, null, 4)}</code> */}
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
														variant="lead"
													>
														{course.name}
													</Typography>
													<Typography
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture
														variant="small"
													>
														{course.description}
													</Typography>
													<Typography
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{course.course_type.name}
													</Typography>
													<Button
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
														onClick={() => handleOpenEdit(course)}
													>
														<Pencil />
													</Button>
												</CardBody>
											</Card>
										</div>
									);
								})}
							</div>
						</CardBody>
					</Card>
				</div>
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
								Agregar
							</Typography>
							<div className="flex flex-col">
								<Button
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									className="flex flex-col text-center justify-center "
									onClick={() => {
										handleOpenEdit();
									}}
								>
									<Plus size={15} className="mx-auto text-lg" />
								</Button>
							</div>
						</CardBody>
					</Card>
				</div>
			</div>
			{openNewCourse && courseTypes && (
				<ModalFormCourse
					courseSelected={courseSelected}
					openNewCourse={openNewCourse}
					handleOpen={handleOpenEdit}
					courseTypes={courseTypes}
				/>
			)}
		</div>
	);
};

export default GeneralCourses;
