import { useDispatch, useSelector } from 'react-redux';
import { breadCrumbsItems, user } from '../../../../types/utilities';
import { AppDispatch, RootState } from '../../../../store';
import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import PageTitle from '../../../../components/PageTitle';
import {
	Card,
	CardBody,
	Option,
	Select,
	Typography,
} from '@material-tailwind/react';
import moment from 'moment';

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
	const [studentSelect, setStudentSelect] = useState<user | null>();
	const studentSelectRef = useRef<user | null>();
	const dateInputRef = useRef<HTMLInputElement | null>(null);
	const typeTripRef = useRef<number>(
		course.courseStudent?.type_trip
			? course.courseStudent.type_trip
			: 1
	);
	const licenseRef = useRef<number>(
		course.courseStudent?.license ? course.courseStudent.license : 1
	);

	const regulationRef = useRef<number>(
		course.courseStudent?.regulation
			? course.courseStudent.regulation
			: 1
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
	useEffect(() => {
		const setStudentFunc = (value: number) => {
			const studentSelected = user.studentList.find(
				(part) => part.student?.id == value
			);
			if (studentSelected) {
				setStudentSelect(studentSelected);
				studentSelectRef.current = studentSelected;
			}
		};
		if (course.courseStudent?.student?.id) {
			console.log('student');
			setStudentFunc(course.courseStudent.student.id);
		}
		if (course.courseStudent) {
			typeTripRef.current = course.courseStudent.type_trip;
			licenseRef.current = course.courseStudent.license;
			regulationRef.current = course.courseStudent.regulation;
		}
	}, [course.courseStudent, user.studentList]);
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
					<div>
						<Typography
							variant="h5"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							REGISTRO DE ENTRENAMIENTO DE VUELO
						</Typography>
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
					{studentSelect && (
						<>
							<div className="flex flex-row">
								<div className="basis-1/2">
									<div className="flex flex-row gap-3">
										<Typography
											variant="lead"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Cliente: {studentSelect.name}{' '}
											{studentSelect.last_name}
										</Typography>
									</div>
									<div className="flex flex-row gap-3">
										<Typography
											variant="small"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Número de Identificación{' '}
										</Typography>
										<Typography
											variant="small"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{studentSelect.user_doc_type?.symbol}-
											{studentSelect.doc_number}
										</Typography>
										<Typography
											variant="small"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Telefono
										</Typography>
										<Typography
											variant="small"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{studentSelect.phone}
										</Typography>
									</div>
								</div>
								<div className="basis-1/2">
									<div className="flex flex-row gap-3">
										<Typography
											variant="small"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Fecha de inicio
										</Typography>
										<Typography
											variant="small"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{course.courseStudent?.date
												? moment(course.courseStudent.date).format(
														'YYYY-MM-DD'
												  )
												: ''}
										</Typography>
										<Typography
											variant="small"
											className="font-bold"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Fecha de revision
										</Typography>
										<Typography
											variant="small"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{moment().format('YYYY-MM-DD')}
										</Typography>
									</div>
								</div>
							</div>
						</>
					)}
					<hr />
					<div className="flex flex-col gap-2 ">
						<table className="w-full min-w-max table-auto text-left">
							<thead>
								<tr>
									<th className="text-left">Asignacion</th>
									{days.map((head) => (
										<th
											key={`${head.id}-day`}
											className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
										>
											<Typography
												variant="small"
												color="blue-gray"
												className="font-normal leading-none opacity-70"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{head.name}
											</Typography>
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{subject.subjectList.map((SL, index) => {
									const isLast =
										index === subject.subjectList.length - 1;
									const classes = isLast
										? 'p-4'
										: 'p-4 border-b border-blue-gray-50';

									return (
										<tr key={`${SL.id}-subject`}>
											<td className={classes}>
												<p>{SL.name}</p>
											</td>
											{days.map((day) => {
												const SD = SL.subject_days?.find(
													(sd) =>
														sd.day === day.id + 1 &&
														sd.status &&
														SL.status
												);
												return (
													<td
														className={
															classes +
															` ${!SD ? 'bg-gray-300 rounded ' : ''}`
														}
														key={`${day.id}-file`}
													>
														{SD ? (
															<div className="flex flex-col gap-2">
																<Select
																	label="Evaluacion"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	<Option>1</Option>
																	<Option>2</Option>
																	<Option>3</Option>
																	<Option>4</Option>
																</Select>
															</div>
														) : (
															''
														)}
													</td>
												);
											})}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</CardBody>
			</Card>
		</div>
	);
};

export default NewAssessment;
