import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	Button,
	Card,
	CardBody,
	Checkbox,
	Input,
	Option,
	Radio,
	Select,
	Tab,
	TabPanel,
	Tabs,
	TabsBody,
	TabsHeader,
	Typography,
} from '@material-tailwind/react';
import { useEffect, useRef, useState } from 'react';
import { breadCrumbsItems, user } from '../../../../types/utilidades';
import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchSubjects } from '../../../../features/subjectSlice';
import {
	fetchCourse,
	fetchCourseStudent,
	updateCourseStudent,
} from '../../../../features/courseSlice';
import {
	fetchInstructors,
	fetchStudents,
} from '../../../../features/userSlice';
import PageTitle from '../../../../components/PageTitle';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import moment from 'moment';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';

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
const NewCourse = () => {
	const componentRef = useRef<HTMLDivElement>(null);

	const dispatch = useDispatch<AppDispatch>();
	const { id, course_id } = useParams<{
		id: string;
		course_id: string;
	}>();

	// // const navigate = useNavigate();
	const { course, subject, user } = useSelector(
		(state: RootState) => {
			return {
				course: state.courses,
				subject: state.subjects,
				user: state.users,
			};
		}
	);

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

	useEffect(() => {
		dispatch(fetchSubjects(parseInt(course_id ? course_id : '-1')));
		dispatch(fetchCourse(parseInt(course_id ? course_id : '-1')));
		dispatch(fetchCourseStudent(parseInt(id ? id : '-1')));
		dispatch(fetchInstructors());
		dispatch(fetchStudents());
	}, [dispatch, id, course_id]);
	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Curso-${course.courseStudent?.code}`,
	});
	const [open, setOpen] = useState(1);

	const handleOpen = (value: number) =>
		setOpen(open === value ? 0 : value);
	const [studentSelect, setStudentSelect] = useState<user | null>();
	const studentSelectRef = useRef<user | null>();

	const handlePartipante = (value: string | undefined) => {
		const studentSelected = user.studentList.find(
			(part) => part.student?.id === parseInt(value ? value : '-1')
		);
		if (studentSelected) {
			setStudentSelect(studentSelected);
			studentSelectRef.current = studentSelected;
			console.log(studentSelectRef.current?.student?.id);
		}
		handleChange();
	};
	const handleChange = async () => {
		if (course.courseSelected?.id && course.courseStudent?.id) {
			dispatch(
				updateCourseStudent({
					course_id: course.courseSelected.id,
					course_student_id: course.courseStudent.id,
					date: dateInputRef.current?.value,
					student_id: studentSelectRef.current?.student?.id,
					typeTrip: typeTripRef.current,
					license: licenseRef.current,
					regulation: regulationRef.current,
				})
			);
		}
	};
	const handleChangeRadio = (id: number, type: string) => {
		switch (type) {
			case 'type_trip':
				typeTripRef.current = id;
				break;
			case 'license':
				licenseRef.current = id;
				break;
			case 'regulation':
				regulationRef.current = id;
				break;

			default:
				console.log('type error in radio Button');

				break;
		}
		handleChange();
	};
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
		<div className="content-center" ref={componentRef}>
			<PageTitle
				title={`${course.courseSelected?.name}`}
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
					{/* <code>{JSON.stringify(course.courseStudent, null, 4)}</code> */}

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
					<div className="grid grid-cols-7 gap-4 py-2">
						<div className="flex flex-col col-span-3 gap-2 max-w-96">
							<div className="">
								<Select
									label="Selecionar Piloto"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									value={`${studentSelect?.student?.id}`}
									onPointerLeaveCapture={undefined}
									onChange={(e) => {
										handlePartipante(e);
									}}
								>
									{user.studentList.map((participante) => (
										<Option
											key={participante.student?.id}
											value={`${participante.student?.id}`}
										>
											{participante.name} {participante.last_name}
										</Option>
									))}
								</Select>
							</div>

							{studentSelect && (
								<>
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
								</>
							)}
							<Input
								type="date"
								label="Fecha de inicio"
								value={
									course.courseStudent?.date
										? moment(course.courseStudent.date).format(
												'YYYY-MM-DD'
										  )
										: undefined
								}
								onChange={handleChange}
								inputRef={dateInputRef}
								required={true}
								crossOrigin={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							/>
						</div>
						<div className="flex flex-col w-full  pl-16  col-span-4 border border-gray-400 rounded-md">
							<div className="flex flex-row w-full gap-8 px-20">
								<Radio
									name="type_trip"
									defaultChecked={
										course.courseStudent?.type_trip === 1
									}
									label="PIC"
									color="red"
									onChange={() => {
										handleChangeRadio(1, 'type_trip');
									}}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									crossOrigin={undefined}
								/>
								<Radio
									name="type_trip"
									defaultChecked={
										course.courseStudent?.type_trip === 2
									}
									label="SIC"
									color="red"
									onChange={() => {
										handleChangeRadio(2, 'type_trip');
									}}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									crossOrigin={undefined}
								/>
								<Radio
									name="type_trip"
									defaultChecked={
										course.courseStudent?.type_trip === 3
									}
									label="TRIP"
									onChange={() => {
										handleChangeRadio(3, 'type_trip');
									}}
									color="red"
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									crossOrigin={undefined}
								/>
							</div>
							<div className="flex flex-row w-max gap-4">
								<Typography
									variant="h6"
									className="pt-2"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Licencia
								</Typography>

								<div className="flex gap-10">
									<Radio
										name="license"
										defaultChecked={
											course.courseStudent?.license === 1
										}
										label="ATP"
										onChange={() => {
											handleChangeRadio(1, 'license');
										}}
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
									<Radio
										name="license"
										defaultChecked={
											course.courseStudent?.license === 2
										}
										label="Commercial"
										color="red"
										onChange={() => {
											handleChangeRadio(2, 'license');
										}}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>

									<Radio
										name="license"
										defaultChecked={
											course.courseStudent?.license === 3
										}
										label="Privado"
										color="red"
										onChange={() => {
											handleChangeRadio(3, 'license');
										}}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
								</div>
							</div>
							<div className="flex flex-row w-max gap-4">
								<Typography
									variant="h6"
									className="pt-2"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Cumplimiento de la Normativa
								</Typography>

								<div className="flex gap-10">
									<Radio
										name="regulation"
										defaultChecked={
											course.courseStudent?.regulation === 1
										}
										label="INAC"
										color="red"
										onChange={() => {
											handleChangeRadio(1, 'regulation');
										}}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
									<Radio
										name="regulation"
										defaultChecked={
											course.courseStudent?.regulation === 2
										}
										label="No-INAC"
										color="red"
										onChange={() => {
											handleChangeRadio(2, 'regulation');
										}}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
								</div>
							</div>
						</div>
						<div>
							<Button
								fullWidth
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								onClick={() => {
									handlePrint();
								}}
							>
								<Printer />
							</Button>
						</div>
					</div>

					<hr />
					<Accordion
						open={open === 1}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<AccordionHeader
							onClick={() => handleOpen(1)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Modulos del Curso
						</AccordionHeader>
						<AccordionBody>
							<Tabs value="Dia 1">
								<TabsHeader
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{days.map((day) => (
										<Tab
											key={`${day.id}-day`}
											value={day.name}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{day.name}
										</Tab>
									))}
								</TabsHeader>
								<TabsBody
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{days.map((day) => (
										<TabPanel
											key={`${day.id}-day_detail`}
											value={day.name}
										>
											<div className="flex flex-col gap-2 ">
												{subject.subjectList.map((subjectItem) => (
													<div
														key={subjectItem.id}
														className="flex flex-row gap-4 rounded-md border border-blue-gray-300"
													>
														<div className="grid grid-cols-4 gap-4 py-2 px-2">
															<div className="flex flex-row gap-2">
																<Typography
																	variant="h6"
																	className="w-60"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	{subjectItem.name}
																</Typography>
															</div>
															{!subjectItem.status && (
																<Typography
																	variant="h5"
																	className="w-full text-center"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	La asignacion esta inactiva
																</Typography>
															)}
															{subjectItem.subject_days?.some(
																(sd) =>
																	sd.day === day.id + 1 &&
																	sd.status &&
																	subjectItem.status
															) && (
																<>
																	<div className="flex flex-col gap-2">
																		<Input
																			type="date"
																			label="Fecha"
																			required={true}
																			crossOrigin={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		/>
																		<br />
																		<Input
																			type="time"
																			label="Hora de inicio"
																			required={true}
																			crossOrigin={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		/>
																	</div>
																	<div className="flex flex-row gap-2">
																		<Input
																			type="number"
																			inputMode="numeric"
																			label="Horas de clase"
																			className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																			crossOrigin={undefined}
																		/>
																		<Typography
																			variant="h6"
																			className="w-60"
																			placeholder={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		>
																			Max: {subjectItem.order}Hrs
																		</Typography>
																	</div>
																	<div className="flex flex-row gap-2">
																		<Select
																			label="Selecionar Instructor"
																			placeholder={undefined}
																			onPointerEnterCapture={
																				undefined
																			}
																			onPointerLeaveCapture={
																				undefined
																			}
																		>
																			{user.instructorList.map(
																				(instr) => (
																					<Option
																						key={instr.id}
																						value={`${instr.id}`}
																					>
																						{instr.name}{' '}
																						{instr.last_name}
																					</Option>
																				)
																			)}
																		</Select>
																	</div>
																</>
															)}
														</div>
													</div>
												))}
											</div>
										</TabPanel>
									))}
								</TabsBody>
							</Tabs>
						</AccordionBody>
					</Accordion>
					<Accordion
						open={open === 2}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<AccordionHeader
							onClick={() => handleOpen(2)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Resultados
						</AccordionHeader>
						<AccordionBody>
							<div className="grid grid-cols-3 gap-4 py-2 px-2">
								<div className="flex flex-row gap-2">
									<Typography
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Resulatos del Examen %
									</Typography>
									<Input
										type="number"
										inputMode="numeric"
										label="Resultado "
										className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
								</div>
								<div className="flex flex-row gap-2 justify-center">
									<Checkbox
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
									<Typography
										variant="small"
										className="pt-3"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Corregido el 100%
									</Typography>
								</div>
								<div className="flex flex-row gap-2">
									<Input
										type="date"
										label="Fecha de completado"
										required={true}
										crossOrigin={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									/>
								</div>
							</div>
							<hr />
							<div className="grid grid-cols-3 gap-4 py-2 px-2">
								<div className="flex flex-row gap-2">
									<Typography
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Resultados para repetir examen %
									</Typography>
									<Input
										type="number"
										inputMode="numeric"
										label="Resultado "
										className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
								</div>
								<div className="flex flex-row gap-2 justify-center">
									<Checkbox
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
									<Typography
										variant="small"
										className="pt-3"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Corregido el 100%
									</Typography>
								</div>
								<div className="flex flex-row gap-2">
									<Typography
										variant="small"
										className="pt-3"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Horas totales en clases:
									</Typography>
									<Input
										type="number"
										inputMode="numeric"
										label="Resultado "
										className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
									<Typography
										variant="small"
										className="pt-3"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Dias totales clases:
									</Typography>
									<Input
										type="number"
										inputMode="numeric"
										label="Resultado "
										className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
								</div>
							</div>
						</AccordionBody>
					</Accordion>
				</CardBody>
			</Card>
		</div>
	);
};

export default NewCourse;
