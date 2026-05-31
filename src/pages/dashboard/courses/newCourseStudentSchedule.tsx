import {
	Accordion,
	AccordionBody,
	AccordionHeader,
	Button,
	Card,
	CardBody,
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
import { breadCrumbsItems, user } from '../../../types/utilities';
import { AppDispatch, RootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { updateCourseStudent } from '../../../features/courseSlice';
import PageTitle from '../../../components/PageTitle';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import moment from 'moment';
import { useReactToPrint } from 'react-to-print';
import { Mail, Printer } from 'lucide-react';
import NewCourseSubject from './newCourseStudentScheduleSubject';
import PDFCourseSchedule from './pdfCourseSchedule';
import { PermissionsValidate } from '../../../services/permissionsValidate';
import { sendCourseScheduleEmail } from '../../../features/courseSlice';
import toast from 'react-hot-toast';

import { pdf } from '@react-pdf/renderer';
import { getLogoBase64 } from '../../../utils/logoBase64'; // ajusta el path
import PDFCourseScheduleDocument from './PDFCourseScheduleDocument';
import SearchableParticipantSelect from './SearchableParticipantSelect';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
	{
		name: 'Cursos',
		href: '/dashboard/courses',
	},
];

const NewCourseStudentSchedule = () => {
	const canViewContent = PermissionsValidate(['staff', 'instructor']);
	const componentRef = useRef<HTMLDivElement>(null);
	const dispatch = useDispatch<AppDispatch>();
	const { course, subject, user } = useSelector(
		(state: RootState) => ({
			course: state.courses,
			subject: state.subjects,
			user: state.users,
		}),
	);

	// Refs
	const dateInputRef = useRef<HTMLInputElement | null>(null);
	const typeTripRef = useRef<number>(
		course.courseStudent?.type_trip || 1,
	);
	const licenseRef = useRef<number>(
		course.courseStudent?.license || 1,
	);
	const [mailsended, setMailsended] = useState(false);
	const regulationRef = useRef<number>(
		course.courseStudent?.regulation || 1,
	);
	const studentSelectRef = useRef<user | null>(null);
	const instructorCodeRef = useRef<string>('');

	// State
	const [open, setOpen] = useState(1);
	const [studentSelect, setStudentSelect] = useState<user | null>(
		null,
	);

	// Handlers
	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Curso-${course.courseStudent?.code}`,
	});
	const handleSend = async () => {
		toast('enviando documento...', { icon: '📧' });
		setMailsended(true);

		if (!studentSelect?.email) {
			toast.error('Selecciona un piloto con email');
			return;
		}

		try {
			// 1. Obtener el logo en base64
			const logoBase64 = await getLogoBase64();

			// 2. Generar el blob del PDF directamente desde el componente
			const pdfBlob = await pdf(
				<PDFCourseScheduleDocument
					course={course}
					studentSelect={studentSelect}
					logoBase64={logoBase64}
				/>,
			).toBlob();

			// 3. Armar el FormData y enviar
			const formData = new FormData();
			formData.append(
				'adjunto',
				pdfBlob,
				`Curso-${course.courseStudent?.code}.pdf`,
			);
			formData.append('to', studentSelect.email);
			formData.append(
				'subject',
				`Horario del Curso - ${course.courseSelected?.name}`,
			);
			formData.append(
				'body',
				`Adjunto el horario del curso ${course.courseSelected?.name}`,
			);

			await dispatch(sendCourseScheduleEmail(formData)).unwrap();
			toast.success('Correo enviado exitosamente');
		} catch (e) {
			console.error(e);
			toast.error('Error al enviar el correo');
		} finally {
			setMailsended(false);
		}
	};

	const handleOpen = (value: number) =>
		setOpen(open === value ? 0 : value);

	const handlePilot = (value: string | undefined) => {
		const studentSelected = user.studentList.find(
			(part) => part.student?.id === parseInt(value || '-1'),
		);
		if (studentSelected) {
			setStudentSelect(studentSelected);
			studentSelectRef.current = studentSelected;
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
					instructorCode: instructorCodeRef.current,
				}),
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

	// Effects
	useEffect(() => {
		const setStudentFunc = (value: number) => {
			const studentSelected = user.studentList.find(
				(part) => part.student?.id == value,
			);
			if (studentSelected) {
				setStudentSelect(studentSelected);
				studentSelectRef.current = studentSelected;
			}
		};

		if (course.courseStudent?.student?.id) {
			setStudentFunc(course.courseStudent.student.id);
		}
		if (course.courseStudent) {
			typeTripRef.current = course.courseStudent.type_trip;
			licenseRef.current = course.courseStudent.license;
			regulationRef.current = course.courseStudent.regulation;
			instructorCodeRef.current =
				course.courseStudent.instructor_code || '';
		}
	}, [course.courseStudent, user.studentList]);

	// Derived data
	const days = course.courseSelected
		? Array.from({ length: course.courseSelected.days }, (_, i) => ({
				id: i,
				name: `Dia ${i + 1}`,
			}))
		: [];

	// Loading and error states
	if (course.status === 'loading') return <LoadingPage />;
	if (course.status === 'failed')
		return <ErrorPage error={course.error || 'Indefinido'} />;

	return (
		<div className="content-center px-2 sm:px-4">
			<PageTitle
				title={`${course.courseSelected?.name} ${course.courseSelected?.course_level.name}`}
				breadCrumbs={breadCrumbs}
			/>

			<Card
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<CardBody
					className="p-2 sm:p-4"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{/* Header Section */}
					<div className="bg-blue-100 rounded-md p-2 sm:p-4 mb-2 sm:mb-4">
						<Typography
							variant="h6"
							className="text-sm sm:text-base"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{course.courseSelected?.name}{' '}
							{course.courseSelected?.course_level.name}
						</Typography>
						<Typography
							variant="small"
							className="text-xs sm:text-sm"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{course.courseSelected?.description}
						</Typography>
						<Typography
							variant="small"
							className="text-xs sm:text-sm"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{course.courseStudent?.code}
						</Typography>
					</div>

					<hr className="my-4" />

					{/* Student and Course Details */}
					<div className="grid grid-cols-1 lg:grid-cols-7 gap-2 sm:gap-4 py-2">
						<div className="lg:col-span-3">
							<div className="mb-4">
								<SearchableParticipantSelect
									disabled={
										course.courseStudent?.approve || !canViewContent
									}
									value={
										studentSelect
											? {
													student_id: studentSelect.student?.id ?? -1,
													name: `${studentSelect.name} ${studentSelect.last_name}`,
													email: studentSelect.email ?? '',
												}
											: null
									}
									onChange={(searched) => {
										// Buscar en studentList por student_id para mantener compatibilidad
										const found = user.studentList.find(
											(u) => u.student?.id === searched.student_id,
										);
										if (found) {
											setStudentSelect(found);
											studentSelectRef.current = found;
										} else {
											// Si no está en la lista local, construir un user mínimo
											setStudentSelect({
												student: { id: searched.student_id },
												name: searched.name,
												email: searched.email,
											} as any);
											studentSelectRef.current = {
												student: { id: searched.student_id },
												name: searched.name,
												email: searched.email,
											} as any;
										}
										handleChange();
									}}
								/>
							</div>

							{studentSelect && (
								<div className="flex flex-wrap gap-3 mb-4">
									<Typography
										variant="small"
										className="font-bold"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Número de Identificación:{' '}
										{studentSelect.doc_number}
									</Typography>
									<Typography
										variant="small"
										className="font-bold"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Teléfono: {studentSelect.phone}
									</Typography>
								</div>
							)}

							<Input
								type="date"
								label="Fecha de inicio"
								disabled={
									course.courseStudent?.approve || !canViewContent
								}
								value={
									course.courseStudent?.date
										? moment(course.courseStudent.date).format(
												'YYYY-MM-DD',
											)
										: undefined
								}
								onChange={handleChange}
								inputRef={dateInputRef}
								required={true}
								crossOrigin={undefined}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							/>

							<div className="mt-4">
								<Input
									label="Código"
									maxLength={15}
									disabled={
										course.courseStudent?.approve || !canViewContent
									}
									defaultValue={
										course.courseStudent?.instructor_code || ''
									}
									onChange={(e) => {
										instructorCodeRef.current = e.target.value;
										handleChange();
									}}
									crossOrigin={undefined}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								/>
							</div>
						</div>

						{/* Course Options */}
						<div className="lg:col-span-4 border border-gray-400 rounded-md p-2 sm:p-4">
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
								{/* Type Trip */}
								<div>
									<Typography
										variant="h6"
										className="mb-1 sm:mb-2 text-sm sm:text-base"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Jerarquia
									</Typography>
									<div className="flex flex-col gap-2">
										<Radio
											name="type_trip"
											defaultChecked={
												course.courseStudent?.type_trip === 1
											}
											label="PIC"
											color="red"
											disabled={
												course.courseStudent?.approve ||
												!canViewContent
											}
											onChange={() =>
												handleChangeRadio(1, 'type_trip')
											}
											crossOrigin={undefined}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
										<Radio
											name="type_trip"
											defaultChecked={
												course.courseStudent?.type_trip === 2
											}
											label="SIC"
											disabled={
												course.courseStudent?.approve ||
												!canViewContent
											}
											color="red"
											onChange={() =>
												handleChangeRadio(2, 'type_trip')
											}
											crossOrigin={undefined}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
										<Radio
											name="type_trip"
											defaultChecked={
												course.courseStudent?.type_trip === 3
											}
											label="SFI"
											disabled={
												course.courseStudent?.approve ||
												!canViewContent
											}
											onChange={() =>
												handleChangeRadio(3, 'type_trip')
											}
											color="red"
											crossOrigin={undefined}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
										<Radio
											name="type_trip"
											defaultChecked={
												course.courseStudent?.type_trip === 4
											}
											label="SFE"
											disabled={
												course.courseStudent?.approve ||
												!canViewContent
											}
											onChange={() =>
												handleChangeRadio(4, 'type_trip')
											}
											color="red"
											crossOrigin={undefined}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
									</div>
								</div>

								{/* License */}
								<div>
									<Typography
										variant="h6"
										className="mb-1 sm:mb-2 text-sm sm:text-base"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Licencia
									</Typography>
									<div className="flex flex-col gap-2">
										<Radio
											name="license"
											defaultChecked={
												course.courseStudent?.license === 1
											}
											disabled={
												course.courseStudent?.approve ||
												!canViewContent
											}
											label="ATP"
											onChange={() => handleChangeRadio(1, 'license')}
											color="red"
											crossOrigin={undefined}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
										<Radio
											name="license"
											defaultChecked={
												course.courseStudent?.license === 2
											}
											label="Commercial"
											color="red"
											disabled={
												course.courseStudent?.approve ||
												!canViewContent
											}
											onChange={() => handleChangeRadio(2, 'license')}
											crossOrigin={undefined}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
										<Radio
											name="license"
											disabled={
												course.courseStudent?.approve ||
												!canViewContent
											}
											defaultChecked={
												course.courseStudent?.license === 3
											}
											label="Privado"
											color="red"
											onChange={() => handleChangeRadio(3, 'license')}
											crossOrigin={undefined}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
										<Radio
											name="license"
											disabled={
												course.courseStudent?.approve ||
												!canViewContent
											}
											defaultChecked={
												course.courseStudent?.license === 4
											}
											label="FANB"
											color="red"
											onChange={() => handleChangeRadio(4, 'license')}
											crossOrigin={undefined}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
									</div>
								</div>

								{/* Regulation */}
								<div>
									<Typography
										variant="h6"
										className="mb-1 sm:mb-2 text-sm sm:text-base"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Normativa
									</Typography>
									<div className="flex flex-col gap-2">
										<Radio
											name="regulation"
											disabled={
												course.courseStudent?.approve ||
												!canViewContent
											}
											defaultChecked={
												course.courseStudent?.regulation === 1
											}
											label="INAC"
											color="red"
											onChange={() =>
												handleChangeRadio(1, 'regulation')
											}
											crossOrigin={undefined}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
										<Radio
											name="regulation"
											disabled={
												course.courseStudent?.approve ||
												!canViewContent
											}
											defaultChecked={
												course.courseStudent?.regulation === 2
											}
											label="No-INAC"
											color="red"
											onChange={() =>
												handleChangeRadio(2, 'regulation')
											}
											crossOrigin={undefined}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Action Buttons */}
						<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 col-span-full justify-end">
							{canViewContent && (
								<Button
									size="sm"
									className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
									onClick={() => {
										handleSend();
									}}
									disabled={!studentSelect || mailsended}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<Mail size={14} />{' '}
									<span className="hidden sm:inline">Enviar</span>
								</Button>
							)}
							<Button
								size="sm"
								className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
								onClick={() => {
									handlePrint();
								}}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<Printer size={14} />{' '}
								<span className="hidden sm:inline">Imprimir</span>
							</Button>
						</div>
					</div>

					<hr className="my-4" />

					{/* Course Sections Accordion */}
					<Accordion
						open={open === 1}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<AccordionHeader
							onClick={() => handleOpen(1)}
							className="text-sm sm:text-base"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Secciones del Curso
						</AccordionHeader>
						<AccordionBody>
							<Tabs
								value={`Dia ${course.day}`}
								orientation="vertical"
							>
								<TabsHeader
									placeholder={course.day}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{days.map((day) => (
										<Tab
											key={day.id}
											className="bg-green-300 hover:bg-green-100 rounded-sm"
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
									{days.map((day) => {
										let hours = 0;
										return (
											<TabPanel
												key={`${day.id}-day_detail`}
												value={day.name}
											>
												<div className="flex flex-col gap-2">
													{subject.subjectList.map((subjectItem) => {
														const SD = subjectItem.subject_days?.find(
															(sd) =>
																sd.day === day.id + 1 &&
																sd.status &&
																subjectItem.status,
														);
														if (SD) hours = hours + subjectItem.hours;

														const schedule =
															course.scheduleList?.find(
																(schedule) =>
																	schedule.subject_id ===
																		subjectItem.id &&
																	schedule.subject_days_id === SD?.id,
															);

														return (
															<div key={subjectItem.id}>
																<NewCourseSubject
																	hours={hours}
																	subjectItem={subjectItem}
																	user={user}
																	approve={
																		course.courseStudent?.approve
																	}
																	course_student={
																		course.courseStudent
																	}
																	schedule={schedule}
																	SD={SD}
																	student_id={
																		studentSelectRef.current?.student
																			?.id || -1
																	}
																	canViewContent={canViewContent}
																/>
															</div>
														);
													})}
												</div>
											</TabPanel>
										);
									})}
								</TabsBody>
							</Tabs>
						</AccordionBody>
					</Accordion>

					{/* Results Accordion */}
					<Accordion
						open={open === 2}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<AccordionHeader
							onClick={() => handleOpen(2)}
							className="text-sm sm:text-base"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Resultados
						</AccordionHeader>
						<AccordionBody>
							{course.courseStudent?.score && (
								<div className="space-y-4">
									{course.courseStudent.approve && (
										<Typography
											variant="h3"
											color="light-green"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											El piloto aprobó el examen
										</Typography>
									)}

									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										{/* Exam Results */}
										<div className="space-y-2">
											<Typography
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Resultados del Examen
											</Typography>
											<Input
												type="number"
												inputMode="numeric"
												value={
													course.courseStudent.approve
														? course.courseStudent.score
														: 0
												}
												label="Puntos"
												className="[&::-webkit-inner-spin-button]:appearance-none"
												crossOrigin={undefined}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											/>
										</div>

										{/* Completion Date */}
										<div className="space-y-2">
											<Typography
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Fecha de completado
											</Typography>
											<Input
												type="date"
												value={moment(course.courseStudent.date)
													.add(
														course.courseSelected?.days || -1,
														'days',
													)
													.format('YYYY-MM-DD')}
												crossOrigin={undefined}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											/>
										</div>

										{/* Retake Results */}
										<div className="space-y-2">
											<Typography
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Resultados para repetir examen
											</Typography>
											<Input
												type="number"
												inputMode="numeric"
												value={
													!course.courseStudent.approve
														? course.courseStudent.score
														: 0
												}
												label="Puntos"
												className="[&::-webkit-inner-spin-button]:appearance-none"
												crossOrigin={undefined}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											/>
										</div>

										{/* Course Info */}
										<div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Typography
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Horas totales en clases:
												</Typography>
												<Input
													type="number"
													inputMode="numeric"
													label="Horas"
													className="[&::-webkit-inner-spin-button]:appearance-none"
													value={course.courseSelected?.hours || -1}
													crossOrigin={undefined}
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												/>
											</div>
											<div className="space-y-2">
												<Typography
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												>
													Días totales clases:
												</Typography>
												<Input
													type="number"
													inputMode="numeric"
													label="Días"
													className="[&::-webkit-inner-spin-button]:appearance-none"
													value={course.courseSelected?.days || -1}
													crossOrigin={undefined}
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
												/>
											</div>
										</div>
									</div>
								</div>
							)}
						</AccordionBody>
					</Accordion>
				</CardBody>
			</Card>

			{/* Hidden PDF Section */}
			<div className="fixed -left-[9999px] top-0">
				<div ref={componentRef} className="w-full">
					<PDFCourseSchedule
						course={course}
						subjectList={subject.subjectList}
						studentSelect={studentSelect}
						days={days}
					/>
				</div>
			</div>
		</div>
	);
};

export default NewCourseStudentSchedule;
