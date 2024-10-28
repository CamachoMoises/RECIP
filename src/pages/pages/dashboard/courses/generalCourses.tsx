import { Typography } from '@material-tailwind/react';
import { breadCrumbsItems } from '../../../../types/utilidades';
import PageTitle from '../../../../components/PageTitle';
import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchCourses } from '../../../../features/courseSlice';
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
	return (
		<div className="container">
			<PageTitle title="Cursos" breadCrumbs={breadCrumbs} />
			<code>{JSON.stringify(courseList, null, 4)}</code>
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				OJO
			</Typography>
		</div>
	);
};

export default GeneralCourses;
