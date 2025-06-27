import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { breadCrumbsItems } from '../../../../types/utilities';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import PageTitle from '../../../../components/PageTitle';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
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
} from '../../../../features/assessmentSlice';
import moment from 'moment';
import CSAD_form from './CSAD_form';
import { useReactToPrint } from 'react-to-print';
import CSA_PDF from './CSA_PDF';
import { axiosPostDefault } from '../../../../services/axios';
// const day_names = [
// 	'Manejo General',
// 	'Manejo General y Asimétrico',
// 	'Manejo de Vuelo Normal y Asimétrico',
// 	'Procedimientos Anormales',
// 	'Procedimientos de Emergencia',
// 	'',
// 	'',
// 	'',
// 	'',
// 	'',
// ];
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
	const [isDataLoaded, setIsDataLoaded] = useState(false);
	const componentRef = useRef<HTMLDivElement>(null);
	const [activeStep, setActiveStep] = useState(0);
	const handleNext = () =>
		!isLastStep && setActiveStep((cur) => cur + 1);
	const handlePrev = () =>
		!isFirstStep && setActiveStep((cur) => cur - 1);

	const { assessment } = useSelector((state: RootState) => {
		return {
			assessment: state.assessment,
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
				})
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
			})
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
				})
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
		await dispatch(
			fetchAssessmentData(
				assessment.courseStudentAssessmentSelected?.id
					? assessment.courseStudentAssessmentSelected.id
					: -1
			)
		);
		setIsDataLoaded(true);
		handlePrint();
		// console.log(componentRef, isDataLoaded, data);
		// setTimeout(() => {
		// }, 5000);
		// // ;
	};

	const handlePrint = useReactToPrint({
		contentRef: componentRef,
		documentTitle: `Evaluacion-${assessment.courseStudentAssessmentSelected?.code}`,
	});
	const [isLastStep, setIsLastStep] = useState(false);
	const [isFirstStep, setIsFirstStep] = useState(false);
	const [isApproved, setIsApproved] = useState(
		assessment.courseStudentAssessmentSelected?.approve
			? assessment.courseStudentAssessmentSelected.approve
			: false
	);
	const handleChangeStatus = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setIsApproved(event.target.checked);
		const req = {
			approve: event.target.checked,
			course_student_assessment_id:
				assessment.courseStudentAssessmentSelected?.id,
		};
		const res = await axiosPostDefault(
			'api/assessment/courseStudentAssessmentApprove',
			req
		);
		console.log(res);
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
								{assessment.courseStudentAssessmentSelected?.code}
							</Typography>
						</div>
						<hr />
						<div className="flex flex-col gap-2 ">
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
											Cliente:{' '}
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
											{
												assessment.courseStudentAssessmentSelected
													?.student?.user?.phone
											}
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
											{assessment.courseStudentAssessmentSelected
												?.course_student?.date
												? moment(
														assessment.courseStudentAssessmentSelected
															?.course_student?.date
												  ).format('YYYY-MM-DD')
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
											{moment(
												assessment.courseStudentAssessmentDaySelected
													?.createdAt
											).format('YYYY-MM-DD')}
										</Typography>
									</div>
								</div>
							</div>
							{missingDay && (
								<div>
									<Typography
										variant="h4"
										color="red"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Faltan dias por calificar
									</Typography>
								</div>
							)}
							<div className="flex flex-col gap-2 ">
								<Typography
									variant="h4"
									color={isApproved ? 'green' : 'indigo'}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{isApproved ? 'Aprobado' : 'Por aprobar'}
								</Typography>
								<div className="flex flex-row text-left justify-center">
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
									assessment.courseStudentAssessmentSelected?.course_student_assessment_days?.find(
										(CSAD_D) =>
											CSAD_D.day === day.id + 1 && CSAD_D.airport
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
							<CSAD_form
								day={activeStep + 1}
								printCSA={printCSA}
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
			{isDataLoaded && (
				<div style={{ display: 'none' }}>
					<div ref={componentRef} className="flex flex-col w-full">
						<CSA_PDF day={activeStep + 1} />
					</div>
				</div>
			)}
		</>
	);
};

export default DetailAssessment;
