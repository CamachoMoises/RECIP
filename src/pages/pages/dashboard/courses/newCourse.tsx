import {
	Accordion,
	AccordionBody,
	AccordionHeader,
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
import { useEffect, useState } from 'react';
import { breadCrumbsItems, user } from '../../../../types/utilidades';
import { AppDispatch, RootState } from '../../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchSubjects } from '../../../../features/subjectSlice';
import {
	fetchCourse,
	fetchCourseStudent,
} from '../../../../features/courseSlice';
import {
	fetchInstructors,
	fetchStudents,
} from '../../../../features/userSlice';
import PageTitle from '../../../../components/PageTitle';

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

	useEffect(() => {
		dispatch(fetchSubjects(parseInt(course_id ? course_id : '-1')));
		dispatch(fetchCourse(parseInt(course_id ? course_id : '-1')));
		dispatch(fetchCourseStudent(parseInt(id ? id : '-1')));
		dispatch(fetchInstructors());
		dispatch(fetchStudents());
	}, [dispatch, id, course_id]);

	const [open, setOpen] = useState(1);

	const handleOpen = (value: number) =>
		setOpen(open === value ? 0 : value);
	const [studentSelect, setStudentSelect] = useState<user | null>();

	// const modulos: moduloTeoria[] = [
	// 	{
	// 		id: 0,
	// 		name: 'Bienvenida/Papeleo',
	// 		hours: 0.25,
	// 	},
	// 	{
	// 		id: 1,
	// 		name: 'Generalidades de la Aeronave/ Procedimientos Operacionales / Plan de vuelo/ Maniobras. ',
	// 		hours: 7.75,
	// 	},
	// 	{
	// 		id: 2,
	// 		name: 'Peso y Balance, Planificación y  Performance ',
	// 		hours: 8,
	// 	},
	// 	{
	// 		id: 3,
	// 		name: 'Sistema eléctrico, Iluminación y Panel de Advertencia',
	// 		hours: 3,
	// 	},
	// 	{
	// 		id: 4,
	// 		name: 'Combustible',
	// 		hours: 2,
	// 	},
	// 	{
	// 		id: 5,
	// 		name: 'Motores/ Hélices',
	// 		hours: 3,
	// 	},
	// 	{
	// 		id: 6,
	// 		name: 'Protección Contra Incendio',
	// 		hours: 3,
	// 	},
	// 	{
	// 		id: 7,
	// 		name: 'Neumático, Protección contra Hielo y Lluvia',
	// 		hours: 2,
	// 	},
	// 	{
	// 		id: 8,
	// 		name: 'Aire Acondicionado/Presurización',
	// 		hours: 2,
	// 	},
	// 	{
	// 		id: 9,
	// 		name: 'Tren de aterrizaje /controles de vuelo',
	// 		hours: 2,
	// 	},
	// 	{
	// 		id: 10,
	// 		name: 'Instrumentos y Aviónica',
	// 		hours: 2,
	// 	},
	// 	{
	// 		id: 11,
	// 		name: 'Oxigeno',
	// 		hours: 2,
	// 	},
	// 	{
	// 		id: 12,
	// 		name: 'Manual de Vuelo',
	// 		hours: 1,
	// 	},
	// 	{
	// 		id: 13,
	// 		name: 'Procedimientos Anormales /Emergencias ',
	// 		hours: 3,
	// 	},
	// 	{
	// 		id: 14,
	// 		name: 'CRM /Cortante de Viento Cruzado',
	// 		hours: 2,
	// 	},
	// 	{
	// 		id: 19,
	// 		name: 'Repaso',
	// 		hours: 4,
	// 	},
	// 	{
	// 		id: 20,
	// 		name: 'Examen/Encuesta',
	// 		hours: 2,
	// 	},
	// ];
	const handlePartipante = (value: string | undefined) => {
		const studentSelected = user.studentList.find(
			(part) => part.id == parseInt(value ? value : '-1')
		);
		if (studentSelected) {
			setStudentSelect(studentSelected);
		}
	};
	// if (!id || !course.courseSelected) {
	// 	navigate('/dashboard/courses');
	// }
	const days = course.courseSelected
		? Array.from({ length: course.courseSelected.days }, (_, i) => ({
				id: i,
				name: `Dia ${i + 1}`,
		  }))
		: [];

	return (
		<div className="content-center">
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
									onPointerLeaveCapture={undefined}
									onChange={(e) => {
										handlePartipante(e);
									}}
								>
									{user.studentList.map((participante) => (
										<Option
											key={participante.id}
											value={`${participante.id}`}
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
								required={true}
								crossOrigin={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							/>
						</div>
						<div className="flex flex-col w-full  pl-16  col-span-4 border border-gray-400 rounded-md">
							<div className="flex flex-row w-full gap-8 px-20">
								<Radio
									name="tipo"
									label="PIC"
									color="red"
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									crossOrigin={undefined}
								/>
								<Radio
									name="tipo"
									label="SIC"
									color="red"
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									crossOrigin={undefined}
								/>
								<Radio
									name="tipo"
									label="TRIP"
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
										name="licencia"
										label="ATP"
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
									<Radio
										name="licencia"
										label="Commercial"
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>

									<Radio
										name="licencia"
										label="Privado"
										defaultChecked
										color="red"
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
										name="cump"
										label="INAC"
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
									<Radio
										name="cump"
										label="No-INAC"
										defaultChecked
										color="red"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
									/>
								</div>
							</div>
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
											key={`${id}-day`}
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
															{subjectItem.subject_days?.some(
																(sd) =>
																	sd.day === day.id + 1 && sd.status
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
