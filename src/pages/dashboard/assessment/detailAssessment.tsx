import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { breadCrumbsItems } from '../../../types/utilities';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import PageTitle from '../../../components/PageTitle';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Step,
	Stepper,
	Switch,
	Typography,
} from '@material-tailwind/react';
import { Calendar, CalendarCheck } from 'lucide-react';
import {
	fetchAssessmentData,
	fetchCourseStudentAssessmentDay,
	fetchSubjectAssessment,
} from '../../../features/assessmentSlice';
import moment from 'moment';
import CSAD_form from './CSAD_form';
import { axiosPostDefault } from '../../../services/axios';
import toast from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import { getLogoBase64 } from '../../../utils/logoBase64';
import { sendCourseScheduleEmail } from '../../../features/courseSlice';
import { createEmailHistory } from '../../../features/emailSlice';
import CSAssessmentPDFDocument from './CSAssessmentPDFDocument';
import SendEmailModal from '../../../components/SendEmailModal';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
	{
		name: 'Evaluaciones',
		href: '/dashboard/assessment',
	},
];
const DetailAssessment = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const [missingDay, setMissingDay] = useState(false);
	const [mailsended, setMailsended] = useState(false);
	const [sendModalOpen, setSendModalOpen] = useState(false);
	const [activeStep, setActiveStep] = useState(0);
	const handleNext = () =>
		!isLastStep && setActiveStep((cur) => cur + 1);
	const handlePrev = () =>
		!isFirstStep && setActiveStep((cur) => cur - 1);

	const getEvaluationDate = (
		baseDate: string | undefined,
		step: number,
	) => {
		let daysToAdd = 0;
		let weekdaysAdded = 0;
		while (weekdaysAdded < step) {
			daysToAdd++;
			const dayOfWeek = moment(baseDate).add(daysToAdd, 'days').day();
			if (dayOfWeek !== 0 && dayOfWeek !== 6) {
				weekdaysAdded++;
			}
		}
		return moment(baseDate).add(daysToAdd, 'days');
	};

	const { assessment, authUser } = useSelector((state: RootState) => {
		return {
			assessment: state.assessment,
			authUser: state.auth.user,
		};
	});

	const CSA_id = assessment.courseStudentAssessmentSelected?.id
		? assessment.courseStudentAssessmentSelected.id
		: -1;
	const course_id = assessment.courseStudentAssessmentSelected
		?.course_id
		? assessment.courseStudentAssessmentSelected.course_id
		: -1;
	const student_id = assessment.courseStudentAssessmentSelected
		?.student_id
		? assessment.courseStudentAssessmentSelected.student_id
		: -1;
	const course_student_id = assessment.courseStudentAssessmentSelected
		?.course_student_id
		? assessment.courseStudentAssessmentSelected.course_student_id
		: -1;
	const days = assessment.courseStudentAssessmentSelected?.course
		?.days
		? Array.from(
				{
					length:
						assessment.courseStudentAssessmentSelected?.course?.days,
				},
				(_, i) => ({
					id: i,
					name: `Dia ${i + 1}`,
				}),
			)
		: [];
	useEffect(() => {
		if (assessment.courseStudentAssessmentSelected === null) {
			navigate('/dashboard');
		}
	}, [assessment.courseStudentAssessmentSelected, navigate]);
	useEffect(() => {
		const CSAD = dispatch(
			fetchCourseStudentAssessmentDay({
				CSA_id,
				day: activeStep + 1,
				course_id,
				student_id,
				course_student_id: course_student_id,
			}),
		).unwrap();
		CSAD.then((CSAD_Data) => {
			dispatch(
				fetchSubjectAssessment({
					day: activeStep + 1,
					course_id,
					student_id,
					course_student_id,
					course_student_assessment_id: CSA_id,
					course_student_assessment_day_id: CSAD_Data.id
						? CSAD_Data.id
						: -1,
				}),
			);
		});
	}, [
		activeStep,
		dispatch,
		CSA_id,
		course_id,
		student_id,
		course_student_id,
	]);
	const printCSA = async () => {
		const printWindow = window.open('', '_blank');
		const CSA = assessment.courseStudentAssessmentSelected;
		try {
			const fresh = await dispatch(
				fetchAssessmentData(CSA?.id ?? -1),
			).unwrap();
			const freshAssessment = {
				...assessment,
				courseStudentAssessmentSelected: fresh.CSA,
				daysSubjectList: fresh.CASD,
			};
			const logoBase64 = await getLogoBase64();
			const pdfBlob = await pdf(
				<CSAssessmentPDFDocument
					assessment={freshAssessment}
					logoBase64={logoBase64}
					day={activeStep + 1}
				/>,
			).toBlob();
			const url = URL.createObjectURL(pdfBlob);
			if (printWindow) {
				printWindow.addEventListener('load', () => {
					setTimeout(() => printWindow.print(), 500);
				});
				printWindow.location.href = url;
			} else {
				window.open(url, '_blank');
			}
		} catch {
			printWindow?.close();
			toast.error('Error al generar el PDF');
		}
	};

	const [isLastStep, setIsLastStep] = useState(false);
	const [isFirstStep, setIsFirstStep] = useState(false);
	const [isApproved, setIsApproved] = useState(
		assessment.courseStudentAssessmentSelected?.approve
			? assessment.courseStudentAssessmentSelected.approve
			: false,
	);
	const handleChangeStatus = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setIsApproved(event.target.checked);
		const req = {
			approve: event.target.checked,
			course_student_assessment_id:
				assessment.courseStudentAssessmentSelected?.id,
		};
		const res = await axiosPostDefault(
			'api/assessment/courseStudentAssessmentApprove',
			req,
		);
		console.log(res);
	};
	const sendEmail = async (to: string) => {
		if (!to) {
			toast.error('El correo de destino no es válido');
			return;
		}
		toast('enviando documento...', { icon: '📧' });
		setMailsended(true);

		const CSA = assessment.courseStudentAssessmentSelected;

		try {
			// 1. Obtener los datos completos de la evaluación para el PDF
			const fresh = await dispatch(
				fetchAssessmentData(CSA?.id ?? -1),
			).unwrap();
			const freshAssessment = {
				...assessment,
				courseStudentAssessmentSelected: fresh.CSA,
				daysSubjectList: fresh.CASD,
			};

			// 2. Obtener el logo en base64
			const logoBase64 = await getLogoBase64();

			// 3. Generar el blob del PDF directamente desde el componente
			const pdfBlob = await pdf(
				<CSAssessmentPDFDocument
					assessment={freshAssessment}
					logoBase64={logoBase64}
					day={fresh.CSA?.course?.days}
				/>,
			).toBlob();

			// 4. Armar el FormData y enviar
			const formData = new FormData();
			formData.append(
				'adjunto',
				pdfBlob,
				`Evaluacion-${fresh.CSA?.code}.pdf`,
			);
			formData.append('to', to);
			formData.append(
				'subject',
				`Evaluación de ${fresh.CSA?.course?.name}`,
			);
			formData.append(
				'body',
				`Adjunto la evaluación del curso ${fresh.CSA?.course?.name} de ${CSA?.student?.user?.name} ${CSA?.student?.user?.last_name}`,
			);

			await dispatch(sendCourseScheduleEmail(formData)).unwrap();
			toast.success('Correo enviado exitosamente');

			dispatch(
				createEmailHistory({
					user_id: authUser?.id ?? undefined,
					email: to,
					nombre_archivo: `Evaluacion-${fresh.CSA?.code}.pdf`,
					fecha: new Date().toISOString(),
					tipo: 'correo',
					descripcion: `Evaluación del curso ${fresh.CSA?.course?.name} (${fresh.CSA?.course?.course_level.name} - ${fresh.CSA?.course?.course_type.name}) enviada a ${to}`,
					modulo: 'Assessment',
				}),
			);
			setSendModalOpen(false);
		} catch (e) {
			console.error(e);
			toast.error('Error al enviar el correo');
		} finally {
			setMailsended(false);
		}
	};
	if (assessment.status === 'loading') {
		return (
			<>
				<LoadingPage />
			</>
		);
	}
	if (assessment.status === 'failed') {
		return (
			<>
				<ErrorPage
					error={assessment.error ? assessment.error : 'Indefinido'}
				/>
			</>
		);
	}
	// console.log(assessment.courseStudentAssessmentDaySelected);

	return (
		<>
			<PageTitle
				title={`Evaluacion de ${assessment.courseStudentAssessmentSelected?.student?.user?.name} ${assessment.courseStudentAssessmentSelected?.student?.user?.last_name} en ${assessment.courseStudentAssessmentSelected?.course?.name}`}
				breadCrumbs={breadCrumbs}
			/>

			<div className="flex flex-col gap-3 w-full ">
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
						<div className="flex flex-col gap-2 ">
							<Typography
								variant="h4"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{
									assessment.courseStudentAssessmentSelected?.course
										?.name
								}
							</Typography>
							<Typography
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								variant="lead"
							>
								{
									assessment.courseStudentAssessmentSelected?.course
										?.description
								}{' '}
								de{' '}
								{
									assessment.courseStudentAssessmentSelected?.course
										?.course_type.name
								}
							</Typography>
							<Typography
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								variant="lead"
							>
								{
									assessment.courseStudentAssessmentSelected
										?.course_student?.instructor_code
								}
							</Typography>
						</div>
						<hr />
						<div className="flex flex-col gap-4 pt-2">
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div className="flex flex-col gap-1">
									<Typography
										variant="small"
										className="font-bold text-blue-gray-600"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Cliente
									</Typography>
									<Typography
										variant="lead"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.name
										}{' '}
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.last_name
										}
									</Typography>
								</div>
								<div className="flex flex-col gap-1">
									<Typography
										variant="small"
										className="font-bold text-blue-gray-600"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Número de Identificación
									</Typography>
									<Typography
										variant="lead"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.user_doc_type?.symbol
										}
										-
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.doc_number
										}
									</Typography>
								</div>
								<div className="flex flex-col gap-1">
									<Typography
										variant="small"
										className="font-bold text-blue-gray-600"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Teléfono
									</Typography>
									<Typography
										variant="lead"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{
											assessment.courseStudentAssessmentSelected
												?.student?.user?.phone
										}
									</Typography>
								</div>
								<div className="flex flex-col gap-1">
									<Typography
										variant="small"
										className="font-bold text-blue-gray-600"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Fecha de inicio de entrenamiento
									</Typography>
									<Typography
										variant="lead"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{assessment.courseStudentAssessmentSelected
											?.course_student?.date
											? moment(
													assessment.courseStudentAssessmentSelected
														?.course_student?.date,
												).format('DD-MM-YYYY')
											: ''}
									</Typography>
								</div>
								<div className="flex flex-col gap-1">
									<Typography
										variant="small"
										className="font-bold text-blue-gray-600"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Fecha de evaluación
									</Typography>
									<Typography
										variant="lead"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{getEvaluationDate(
											assessment.courseStudentAssessmentSelected
												?.date,
											activeStep,
										).format('DD-MM-YYYY')}
									</Typography>
								</div>
							</div>
							{missingDay && (
								<div>
									<Typography
										variant="h5"
										color="red"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Faltan dias por calificar
									</Typography>
								</div>
							)}
							<div className="flex flex-row items-center justify-between rounded-lg bg-blue-gray-50 p-3">
								<Typography
									variant="h5"
									color={isApproved ? 'green' : 'indigo'}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{isApproved ? 'Aprobado' : 'Por aprobar'}
								</Typography>
								<Switch
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									crossOrigin={undefined}
									ripple={false}
									defaultChecked={isApproved}
									onChange={(event) => {
										handleChangeStatus(event);
									}}
									className="h-full w-full checked:bg-[#134475]"
									containerProps={{
										className: 'w-11 h-6',
									}}
									circleProps={{
										className: 'before:hidden left-0.5 border-none',
									}}
								/>
							</div>
						</div>
					</CardBody>
				</Card>
				<Card
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<CardHeader
						floated={false}
						className="h-24 px-3"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Stepper
							activeStep={activeStep}
							isLastStep={(value) => {
								if (value != isLastStep) {
									setIsLastStep(value);
								}
							}}
							isFirstStep={(value) => {
								if (value != isFirstStep) {
									setIsFirstStep(value);
								}
							}}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{days.map((day, index) => {
								const dayActive =
									assessment.courseStudentAssessmentSelected?.CourseStudentAssessmentDays?.find(
										(CSAD_D) =>
											CSAD_D.day === day.id + 1 && CSAD_D.airport,
									);
								if (!missingDay && !dayActive) {
									setMissingDay(true);
								}
								return (
									<Step
										onClick={() => setActiveStep(index)}
										placeholder={undefined}
										className="h-15 w-20"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{dayActive ? (
											<CalendarCheck className="h-10 w-5" />
										) : (
											<Calendar className="h-10 w-5" />
										)}
										<div className="absolute -bottom-[1.5rem] w-max text-center">
											<Typography
												variant="small"
												className="overflow-x-auto"
												color={
													activeStep === index ? 'blue-gray' : 'gray'
												}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												{day.name} <br />
												{/* <small>{day_names[index]}</small> */}
											</Typography>
										</div>
									</Step>
								);
							})}
						</Stepper>
					</CardHeader>
					<CardBody
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="flex flex-col gap-2 ">
							<div className="flex flex-col items-start gap-1 rounded-lg bg-blue-gray-50 p-3 text-left">
								<Typography
									variant="h6"
									className="font-bold"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Proficiencia de la evaluacion
								</Typography>
								<Typography
									variant="small"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									(1) Insatisfacción. (2) Por debajo del estándar
									esperado. (3) Cumple con los estándares (4)
									Excelente
								</Typography>
							</div>
						<CSAD_form
							day={activeStep + 1}
							printCSA={printCSA}
							sendCSA={async () => setSendModalOpen(true)}
							sendingEmail={mailsended}
							isLastStep={isLastStep}
							isFirstStep={isFirstStep}
						/>
						</div>
					</CardBody>
					<CardFooter
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="mt-16 flex justify-between gap-1">
							<Button
								onClick={handlePrev}
								disabled={isFirstStep}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{isFirstStep ? 'x' : `Dia ${activeStep}`}
							</Button>

							<Button
								onClick={handleNext}
								disabled={isLastStep}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{isLastStep ? 'x' : `Dia ${activeStep + 2}`}
							</Button>
						</div>
					</CardFooter>
				</Card>
			</div>
			<SendEmailModal
				open={sendModalOpen}
				onClose={() => setSendModalOpen(false)}
				participantEmail={
					assessment.courseStudentAssessmentSelected?.student?.user
						?.email
				}
				participantName={`${assessment.courseStudentAssessmentSelected?.student?.user?.name} ${assessment.courseStudentAssessmentSelected?.student?.user?.last_name}`}
				sending={mailsended}
				onSend={sendEmail}
			/>
		</>
	);
};

export default DetailAssessment;
