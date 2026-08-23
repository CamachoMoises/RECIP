import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../store';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Textarea } from '@material-tailwind/react';
import { Eraser } from 'lucide-react';
import LessonDetails from './lessonDetails';
import { courseStudentAssessmentDay } from '../../../types/utilities';
import {
	saveSignatures,
	updateCourseStudentAssessmentDay,
} from '../../../features/assessmentSlice';
import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import toast from 'react-hot-toast';
import { CsadInputs } from './csadForm.types';
import { signatureUrl } from './csadForm.utils';
import useCsadSignatures from './useCsadSignatures';
import CsadFlightConditions from './CsadFlightConditions';
import CsadOperationsSection from './CsadOperationsSection';
import CsadSignaturePanel from './CsadSignaturePanel';
import CsadConsentBlock from './CsadConsentBlock';
import CsadActionsRow from './CsadActionsRow';

const CSAD_form = ({
	day,
	printCSA,
	sendCSA,
	sendingEmail,
	isLastStep,
}: {
	day: number;
	printCSA: () => Promise<void>;
	sendCSA: () => Promise<void>;
	sendingEmail: boolean;
	isFirstStep: boolean;
	isLastStep: boolean;
}) => {
	const { assessment, userLogged } = useSelector(
		(state: RootState) => {
			return {
				assessment: state.assessment,
				userLogged: state.users.userLogged,
			};
		},
	);
	const {
		signatureUrls,
		setSignatureUrls,
		missingSignature,
		setMissingSignature,
	} = useCsadSignatures(isLastStep);

	const [isFormDisabled, setIsFormDisabled] = useState(false);
	const isSuperuser = !!userLogged?.is_superuser;
	const lockedClass = isFormDisabled
		? 'bg-gray-100 cursor-not-allowed'
		: 'bg-slate-400';
	const lockedLabelClass = isFormDisabled
		? '!text-blue-gray-700'
		: '';

	const [consentChecked, setConsentChecked] = useState(false);

	const sigCanvas1 = useRef<SignatureCanvas>(null);
	const sigCanvas2 = useRef<SignatureCanvas>(null);
	const sigCanvas3 = useRef<SignatureCanvas>(null);
	const dayStarted = assessment.courseStudentAssessmentDaySelected
		?.airport
		? true
		: false;
	const hasAnyCanvas =
		!signatureUrls.student ||
		missingSignature.student === true ||
		!signatureUrls.instructor ||
		missingSignature.instructor === true ||
		(isLastStep &&
			(!signatureUrls.fcaa || missingSignature.fcaa === true));

	const CSAD_D = assessment.courseStudentAssessmentDaySelected;
	const hasTakeoffData = CSAD_D
		? (CSAD_D.takeoff_day || 0) +
				(CSAD_D.takeoff_night || 0) +
				(CSAD_D.takeoff || 0) >
			0
		: false;
	const hasLandingData = CSAD_D
		? (CSAD_D.landing_day || 0) +
				(CSAD_D.landing_night || 0) +
				(CSAD_D.landing || 0) >
			0
		: false;
	const requiredSignatures = isLastStep
		? (['student', 'instructor', 'fcaa'] as const)
		: (['student', 'instructor'] as const);
	const signaturesSettled = requiredSignatures.every(
		(k) => typeof missingSignature[k] === 'boolean',
	);
	const signaturesPresent = !hasAnyCanvas;

	const canLockForm =
		hasTakeoffData &&
		hasLandingData &&
		signaturesSettled &&
		signaturesPresent;

	useEffect(() => {
		setIsFormDisabled(canLockForm);
		if (canLockForm) {
			setConsentChecked(true);
		}
	}, [canLockForm]);
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const clear = () => {
		sigCanvas1.current?.clear();
		sigCanvas2.current?.clear();
		sigCanvas3.current?.clear();
	};

	const {
		register,
		handleSubmit,
		control,

		formState: { errors },
	} = useForm<CsadInputs>({
		defaultValues: {
			airport: assessment.courseStudentAssessmentDaySelected?.airport,
			airstrip:
				assessment.courseStudentAssessmentDaySelected?.airstrip,
			elevation:
				assessment.courseStudentAssessmentDaySelected?.elevation,
			meteorology:
				assessment.courseStudentAssessmentDaySelected?.meteorology,
			temperature:
				assessment.courseStudentAssessmentDaySelected?.temperature,
			qnh: assessment.courseStudentAssessmentDaySelected?.qnh,
			wind: assessment.courseStudentAssessmentDaySelected?.wind,
			weight: assessment.courseStudentAssessmentDaySelected?.weight,
			flaps: assessment.courseStudentAssessmentDaySelected?.flaps,
			power: assessment.courseStudentAssessmentDaySelected?.power,
			seat: assessment.courseStudentAssessmentDaySelected?.seat,
			takeoff: assessment.courseStudentAssessmentDaySelected?.takeoff,
			landing: assessment.courseStudentAssessmentDaySelected?.landing,
			takeoff_day:
				assessment.courseStudentAssessmentDaySelected?.takeoff_day,
			takeoff_night:
				assessment.courseStudentAssessmentDaySelected?.takeoff_night,
			landing_day:
				assessment.courseStudentAssessmentDaySelected?.landing_day,
			landing_night:
				assessment.courseStudentAssessmentDaySelected?.landing_night,
			training_time:
				assessment.courseStudentAssessmentDaySelected?.training_time,
			check_time:
				assessment.courseStudentAssessmentDaySelected?.check_time,
			type: assessment.courseStudentAssessmentDaySelected?.type,
			comments:
				assessment.courseStudentAssessmentDaySelected?.comments,
			consent: false,
		},
	});

	const buildCSADReq = (
		data: CsadInputs,
	): courseStudentAssessmentDay => {
		const CSAD = assessment.courseStudentAssessmentDaySelected;
		return {
			...data,
			takeoff_day: Number.isNaN(data.takeoff_day)
				? undefined
				: Number(data.takeoff_day),
			takeoff_night: Number.isNaN(data.takeoff_night)
				? undefined
				: Number(data.takeoff_night),
			landing_day: Number.isNaN(data.landing_day)
				? undefined
				: Number(data.landing_day),
			landing_night: Number.isNaN(data.landing_night)
				? undefined
				: Number(data.landing_night),
			training_time: Number.isNaN(data.training_time)
				? undefined
				: Number(data.training_time),
			check_time: Number.isNaN(data.check_time)
				? undefined
				: Number(data.check_time),
			id: CSAD?.id ? CSAD.id : -1,
			course_id: CSAD?.course_id ? CSAD.course_id : -1,
			student_id: CSAD?.student_id ? CSAD.student_id : -1,
			course_student_id: CSAD?.course_student_id
				? CSAD.course_student_id
				: -1,
			course_student_assessment_id: CSAD?.course_student_assessment_id
				? CSAD.course_student_assessment_id
				: -1,
			day: CSAD?.day ? CSAD.day : -1,
		};
	};

	const onSaveTop: SubmitHandler<CsadInputs> = async (data) => {
		const result = await dispatch(
			updateCourseStudentAssessmentDay(buildCSADReq(data)),
		);
		if (updateCourseStudentAssessmentDay.fulfilled.match(result)) {
			toast.success('Datos del formulario guardados');
		} else {
			toast.error('Error al guardar los datos del formulario');
		}
	};

	const onSubmit: SubmitHandler<CsadInputs> = async (data) => {
		const req = buildCSADReq(data);
		let signature1Data = undefined;
		let signature2Data = undefined;
		let signature3Data = undefined;
		if (sigCanvas1.current) {
			const sing1 = sigCanvas1.current.isEmpty();
			signature1Data = sing1
				? undefined
				: sigCanvas1.current.toDataURL();
		}
		if (sigCanvas2.current) {
			const sing2 = sigCanvas2.current.isEmpty();
			signature2Data = sing2
				? undefined
				: sigCanvas2.current.toDataURL();
		}
		if (sigCanvas3.current) {
			const sing3 = sigCanvas3.current.isEmpty();
			signature3Data = sing3
				? undefined
				: sigCanvas3.current.toDataURL();
		}
		const updateResult = await dispatch(
			updateCourseStudentAssessmentDay(req),
		);

		if (
			updateCourseStudentAssessmentDay.fulfilled.match(updateResult)
		) {
			const updatedCSAD = updateResult.payload;

			// Guardar firmas si existen
			if (signature1Data || signature2Data || signature3Data) {
				const saveResult = await dispatch(
					saveSignatures({
						CSAD_id: updatedCSAD.id ? updatedCSAD.id : -1,
						signature1: signature1Data,
						signature2: signature2Data,
						signature3: signature3Data,
					}),
				);

				if (saveSignatures.fulfilled.match(saveResult)) {
					navigate('/dashboard');
					const CSAD_id = updatedCSAD.id ? updatedCSAD.id : -1;
					setSignatureUrls({
						student: signature1Data
							? signatureUrl(1, CSAD_id)
							: signatureUrls.student,
						instructor: signature2Data
							? signatureUrl(2, CSAD_id)
							: signatureUrls.instructor,
						fcaa: signature3Data
							? signatureUrl(3, CSAD_id)
							: signatureUrls.fcaa,
					});
					setMissingSignature({
						student: signature1Data
							? false
							: missingSignature.student,
						instructor: signature2Data
							? false
							: missingSignature.instructor,
						fcaa: signature3Data ? false : missingSignature.fcaa,
					});
				}
			}
		}
	};

	const courseScoreAverage =
		assessment.courseStudentAssessmentSelected?.course_score_average;

	return (
		<div className="content-center">
			{/* Form for CSAD */}
			<form onSubmit={handleSubmit(onSubmit)}>
				<fieldset disabled={isFormDisabled}>
					<CsadFlightConditions
						register={register}
						errors={errors}
						isFormDisabled={isFormDisabled}
						lockedClass={lockedClass}
						lockedLabelClass={lockedLabelClass}
						dayStarted={dayStarted}
						onSaveTopClick={handleSubmit(onSaveTop)}
					/>
					<br />
					<hr />
					{assessment.courseStudentAssessmentDaySelected?.airport && (
						<>
							<LessonDetails day={day} disabled={isFormDisabled} />
							<hr />
							<CsadOperationsSection
								register={register}
								control={control}
								isFormDisabled={isFormDisabled}
								lockedClass={lockedClass}
								lockedLabelClass={lockedLabelClass}
								courseScoreAverage={courseScoreAverage}
							/>
							<div className="flex flex-col py-2">
								<Textarea
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									label="Comentarios "
									maxLength={500}
									className={`${lockedClass} rounded-md p-2 w-full mb-2 block text-slate-900`}
									shrink={isFormDisabled}
									labelProps={{ className: lockedLabelClass }}
									{...register('comments')}
									aria-invalid={errors.comments ? 'true' : 'false'}
								/>
								<div className="flex flex-row gap-2 justify-center mb-2">
									<CsadSignaturePanel
										title="Firma del piloto"
										alt="Firma piloto"
										imageUrl={signatureUrls.student}
										imageMissing={missingSignature.student === true}
										onImageError={() =>
											setMissingSignature((prev) => ({
												...prev,
												student: true,
											}))
										}
										onImageLoad={() =>
											setMissingSignature((prev) => ({
												...prev,
												student: false,
											}))
										}
										canvasRef={sigCanvas1}
										disabled={isFormDisabled}
										className="basis-1/2"
									/>
									<CsadSignaturePanel
										title="Firma del Instructor"
										alt="Firma instructor"
										imageUrl={signatureUrls.instructor}
										imageMissing={
											missingSignature.instructor === true
										}
										onImageError={() =>
											setMissingSignature((prev) => ({
												...prev,
												instructor: true,
											}))
										}
										onImageLoad={() =>
											setMissingSignature((prev) => ({
												...prev,
												instructor: false,
											}))
										}
										canvasRef={sigCanvas2}
										disabled={isFormDisabled}
										className="basis-1/2"
									/>
								</div>
								{isLastStep && (
									<div className="flex flex-row gap-2 justify-center m-2">
										<CsadSignaturePanel
											title="firma del FCAA"
											alt="Firma FCAA"
											imageUrl={signatureUrls.fcaa}
											imageMissing={missingSignature.fcaa === true}
											onImageError={() =>
												setMissingSignature((prev) => ({
													...prev,
													fcaa: true,
												}))
											}
											onImageLoad={() =>
												setMissingSignature((prev) => ({
													...prev,
													fcaa: false,
												}))
											}
											canvasRef={sigCanvas3}
											disabled={isFormDisabled}
										/>
									</div>
								)}
								{hasAnyCanvas && (
									<div className="flex flex-row gap-2">
										<Button
											variant="gradient"
											onClick={clear}
											fullWidth
											className="flex flex-row justify-center"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											<Eraser size={15} />
										</Button>
									</div>
								)}
							</div>
						</>
					)}
				</fieldset>
				<CsadConsentBlock
					checked={consentChecked}
					onChange={setConsentChecked}
				/>
				<br />
				<CsadActionsRow
					isFormDisabled={isFormDisabled}
					isSuperuser={isSuperuser}
					consentChecked={consentChecked}
					onEdit={() => {
						setIsFormDisabled(false);
						setConsentChecked(false);
					}}
					dayStarted={dayStarted}
					sendingEmail={sendingEmail}
					printCSA={printCSA}
					sendCSA={sendCSA}
				/>
			</form>
		</div>
	);
};

export default CSAD_form;
