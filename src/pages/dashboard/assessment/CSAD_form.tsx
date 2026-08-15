import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../store';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
	Button,
	Checkbox,
	Input,
	Option,
	Select,
	Textarea,
	Typography,
} from '@material-tailwind/react';
import { Eraser, Mail, Printer, Save } from 'lucide-react';
import LessonDetails from './lessonDetails';
import { Cloudinary } from '@cloudinary/url-gen';
import {
	SignatureUrls,
	courseStudentAssessmentDay,
} from '../../../types/utilities';
import {
	saveSignatures,
	updateCourseStudentAssessmentDay,
} from '../../../features/assessmentSlice';
import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import toast from 'react-hot-toast';

type Inputs = {
	airport: string;
	airstrip: string;
	elevation: number;
	meteorology: string;
	temperature: number;
	qnh: string;
	wind: string;
	weight: number;
	flaps: string;
	power: string;
	takeoff: number;
	landing: number;
	takeoff_day: number;
	takeoff_night: number;
	landing_day: number;
	landing_night: number;
	training_time: number;
	check_time: number;
	type: string;
	seat: string;
	comments: string;
	consent: boolean;
};
const cld = new Cloudinary({ cloud: { cloudName: 'moisesinc' } });
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
	const [signatureUrls, setSignatureUrls] = useState<SignatureUrls>(
		{},
	);
	const [isFormDisabled, setIsFormDisabled] = useState(false);
	const isSuperuser = !!userLogged?.is_superuser;

	const [consentChecked, setConsentChecked] = useState(false);
	const [missingSignature, setMissingSignature] = useState<
		Partial<Record<keyof SignatureUrls, boolean>>
	>({});

	useEffect(() => {
		const fetchSignatures = async () => {
			if (!assessment.courseStudentAssessmentDaySelected?.id) return;

			const CSAD_id =
				assessment.courseStudentAssessmentDaySelected.id;

			setMissingSignature({});
			setSignatureUrls({
				student: cld
					.image(`firmas/firmas/signature_1_${CSAD_id}`)
					.format('webp')
					.toURL(),
				instructor: cld
					.image(`firmas/firmas/signature_2_${CSAD_id}`)
					.format('webp')
					.toURL(),
				fcaa: isLastStep
					? cld
							.image(`firmas/firmas/signature_3_${CSAD_id}`)
							.format('webp')
							.toURL()
					: undefined,
			});
		};

		fetchSignatures();
	}, [assessment.courseStudentAssessmentDaySelected?.id, isLastStep]);

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
	} = useForm<Inputs>({
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

	const buildCSADReq = (data: Inputs): courseStudentAssessmentDay => {
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

	const onSaveTop: SubmitHandler<Inputs> = async (data) => {
		const result = await dispatch(
			updateCourseStudentAssessmentDay(buildCSADReq(data)),
		);
		if (updateCourseStudentAssessmentDay.fulfilled.match(result)) {
			toast.success('Datos del formulario guardados');
		} else {
			toast.error('Error al guardar los datos del formulario');
		}
	};

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
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
			console.log(
				'Saving signatures if they exist...',
				signature1Data,
				signature2Data,
				signature3Data,
			);

			// 2. Guardar firmas si existen
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
					const CSAD_id = updatedCSAD.id;
					setSignatureUrls({
						student: signature1Data
							? cld
									.image(`firmas/firmas/signature_1_${CSAD_id}`)
									.format('webp')
									.toURL()
							: signatureUrls.student,
						instructor: signature2Data
							? cld
									.image(`firmas/firmas/signature_2_${CSAD_id}`)
									.format('webp')
									.toURL()
							: signatureUrls.instructor,
						fcaa: signature3Data
							? cld
									.image(`firmas/firmas/signature_3_${CSAD_id}`)
									.format('webp')
									.toURL()
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
	const proficiencyLabel = (score: number | undefined) => {
		if (score == null) return '';
		if (score < 3) return 'Insatisfactorio';
		if (score < 4) return 'Satisfactorio';
		return 'Excelente';
	};

	return (
		<div className="content-center">
			{/* Form for CSAD */}
			<form onSubmit={handleSubmit(onSubmit)}>
				<fieldset disabled={isFormDisabled}>
					<div
						className={`grid grid-cols-4 gap-4 py-3 rounded-md ${
							dayStarted ? '' : 'bg-orange-100 p-2'
						}`}
					>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Aeropuerto"
								placeholder="Aeropuerto"
								maxLength={20}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('airport', {
									required: {
										value: true,
										message: 'El aeropuerto es requerido',
									},
								})}
								aria-invalid={errors.airport ? 'true' : 'false'}
							/>
							{errors.airport && (
								<span className="text-red-500">
									{errors.airport.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Pista"
								placeholder="Pista"
								maxLength={20}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('airstrip', {
									required: {
										value: true,
										message: 'La pista es requerida',
									},
								})}
								aria-invalid={errors.airstrip ? 'true' : 'false'}
							/>
							{errors.airstrip && (
								<span className="text-red-500">
									{errors.airstrip.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Elevación"
								placeholder="Elevación"
								pattern="^\d+(\.\d+)?$"
								maxLength={20}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('elevation', {
									required: {
										value: true,
										message: 'La elevación es requerida',
									},
								})}
								aria-invalid={errors.elevation ? 'true' : 'false'}
							/>
							{errors.elevation && (
								<span className="text-red-500">
									{errors.elevation.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Meteorología"
								placeholder="Meteorología"
								maxLength={20}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('meteorology', {
									required: {
										value: true,
										message: 'La meteorología es requerida',
									},
								})}
								aria-invalid={errors.meteorology ? 'true' : 'false'}
							/>
							{errors.meteorology && (
								<span className="text-red-500">
									{errors.meteorology.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Temperatura"
								placeholder="Temperatura"
								pattern="^\d+(\.\d+)?$"
								maxLength={20}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('temperature', {
									required: {
										value: true,
										message: 'La temperatura es requerida',
									},
								})}
								aria-invalid={errors.temperature ? 'true' : 'false'}
							/>
							{errors.temperature && (
								<span className="text-red-500">
									{errors.temperature.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="QNH"
								placeholder="QNH"
								maxLength={20}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('qnh', {
									required: {
										value: true,
										message: 'El QNH es requerido',
									},
								})}
								aria-invalid={errors.qnh ? 'true' : 'false'}
							/>
							{errors.qnh && (
								<span className="text-red-500">
									{errors.qnh.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Viento"
								placeholder="Viento"
								maxLength={20}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('wind', {
									required: {
										value: true,
										message: 'El viento es requerido',
									},
								})}
								aria-invalid={errors.wind ? 'true' : 'false'}
							/>
							{errors.wind && (
								<span className="text-red-500">
									{errors.wind.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Peso"
								placeholder="Peso"
								pattern="^\d+(\.\d+)?$"
								maxLength={20}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('weight', {
									required: {
										value: true,
										message: 'El peso es requerido',
									},
								})}
								aria-invalid={errors.weight ? 'true' : 'false'}
							/>
							{errors.weight && (
								<span className="text-red-500">
									{errors.weight.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Flaps"
								placeholder="Flaps"
								maxLength={20}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('flaps', {
									required: {
										value: true,
										message: 'Las flaps son requeridas',
									},
								})}
								aria-invalid={errors.flaps ? 'true' : 'false'}
							/>
							{errors.flaps && (
								<span className="text-red-500">
									{errors.flaps.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Potencia"
								placeholder="Potencia"
								maxLength={20}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('power', {
									required: {
										value: true,
										message: 'La potencia es requerida',
									},
								})}
								aria-invalid={errors.power ? 'true' : 'false'}
							/>
							{errors.power && (
								<span className="text-red-500">
									{errors.power.message}
								</span>
							)}
						</div>
						<div>
							<Input
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="text"
								label="Puesto"
								placeholder="Puesto"
								maxLength={20}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								crossOrigin={undefined}
								{...register('seat', {
									required: {
										value: true,
										message: 'El puesto es requerido',
									},
								})}
								aria-invalid={errors.seat ? 'true' : 'false'}
							/>
							{errors.seat && (
								<span className="text-red-500">
									{errors.seat.message}
								</span>
							)}
						</div>
					</div>
					{!dayStarted && (
						<div className="flex flex-row gap-2 mt-2">
							<Button
								variant="gradient"
								color="green"
								type="button"
								onClick={handleSubmit(onSaveTop)}
								title="Guardar datos del formulario superior"
								className="flex flex-row justify-center"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<Save size={15} /> Guardar
							</Button>
						</div>
					)}
					<br />
					<hr />
					{assessment.courseStudentAssessmentDaySelected?.airport && (
						<>
							<LessonDetails day={day} disabled={isFormDisabled} />
							<hr />
							<div className="flex flex-col sm:flex-row gap-4 my-4">
								<div className="flex-1 rounded-lg border border-blue-gray-200 bg-white p-4">
									<Typography
										variant="small"
										className="font-bold text-blue-gray-600 mb-1"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Promedio del curso
									</Typography>
									<Typography
										variant="h6"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{courseScoreAverage != null
											? `${courseScoreAverage} (${proficiencyLabel(
													courseScoreAverage,
												)})`
											: '—'}
									</Typography>
								</div>
							</div>
							<div className="grid grid-cols-1 gap-6 my-6">
								<div className="rounded-lg border border-blue-gray-200 bg-white p-4">
									<Typography
										variant="small"
										className="font-bold text-blue-gray-600 mb-3"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Despegues
									</Typography>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										<Input
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											type="number"
											label="Total"
											placeholder="Total"
											maxLength={20}
											className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
											crossOrigin={undefined}
											{...register('takeoff', {})}
											aria-invalid={errors.takeoff ? 'true' : 'false'}
										/>
										<Input
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											type="number"
											min={0}
											label="Diurnos"
											placeholder="Diurnos"
											maxLength={20}
											className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
											crossOrigin={undefined}
											{...register('takeoff_day', {
												valueAsNumber: true,
											})}
											aria-invalid={
												errors.takeoff_day ? 'true' : 'false'
											}
										/>
										<Input
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											type="number"
											min={0}
											label="Nocturnos"
											placeholder="Nocturnos"
											maxLength={20}
											className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
											crossOrigin={undefined}
											{...register('takeoff_night', {
												valueAsNumber: true,
											})}
											aria-invalid={
												errors.takeoff_night ? 'true' : 'false'
											}
										/>
									</div>
								</div>
								<div className="rounded-lg border border-blue-gray-200 bg-white p-4">
									<Typography
										variant="small"
										className="font-bold text-blue-gray-600 mb-3"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Aterrizajes
									</Typography>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
										<Input
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											type="number"
											label="Total"
											placeholder="Total"
											maxLength={20}
											className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
											crossOrigin={undefined}
											{...register('landing', {})}
											aria-invalid={errors.landing ? 'true' : 'false'}
										/>
										<Input
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											type="number"
											min={0}
											label="Diurnos"
											placeholder="Diurnos"
											maxLength={20}
											className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
											crossOrigin={undefined}
											{...register('landing_day', {
												valueAsNumber: true,
											})}
											aria-invalid={
												errors.landing_day ? 'true' : 'false'
											}
										/>
										<Input
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											type="number"
											min={0}
											label="Nocturnos"
											placeholder="Nocturnos"
											maxLength={20}
											className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
											crossOrigin={undefined}
											{...register('landing_night', {
												valueAsNumber: true,
											})}
											aria-invalid={
												errors.landing_night ? 'true' : 'false'
											}
										/>
									</div>
								</div>
								<div className="rounded-lg border border-blue-gray-200 bg-white p-4">
									<Typography
										variant="small"
										className="font-bold text-blue-gray-600 mb-3"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Tipo
									</Typography>
									<Controller
										name="type"
										control={control}
										render={({ field }) => (
											<Select
												label="Tipo"
												placeholder="Tipo"
												value={field.value ?? ''}
												onChange={(value) => field.onChange(value)}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												<Option value="entrenamiento">
													Entrenamiento
												</Option>
												<Option value="reentrenamiento">
													Reentrenamiento
												</Option>
												<Option value="chequeo">Chequeo</Option>
												<Option value="re-chequeo">Re-chequeo</Option>
												<Option value="experiencia_reciente">
													Experiencia reciente
												</Option>
											</Select>
										)}
									/>
								</div>
								<div className="rounded-lg border border-blue-gray-200 bg-white p-4">
									<Typography
										variant="small"
										className="font-bold text-blue-gray-600 mb-3"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Tiempos de vuelo
									</Typography>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<Input
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											type="number"
											min={0}
											step="0.01"
											label="Entrenamiento (horas)"
											className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
											crossOrigin={undefined}
											{...register('training_time', {
												valueAsNumber: true,
											})}
											aria-invalid={
												errors.training_time ? 'true' : 'false'
											}
										/>
										<Input
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											type="number"
											min={0}
											step="0.01"
											label="Chequeo (horas)"
											className="bg-slate-400 rounded-md p-2 w-full block text-slate-900"
											crossOrigin={undefined}
											{...register('check_time', {
												valueAsNumber: true,
											})}
											aria-invalid={
												errors.check_time ? 'true' : 'false'
											}
										/>
									</div>
								</div>
							</div>
							<div className="flex flex-col py-2">
								<Textarea
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									label="Comentarios "
									maxLength={500}
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									{...register('comments')}
									aria-invalid={errors.comments ? 'true' : 'false'}
								/>
								<div className="flex flex-row gap-2 justify-center mb-2">
									<div className="flex flex-col gap-3 border border-[#b0bec5] bg-white rounded-sm basis-1/2">
										<Typography
											variant="h5"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Firma del alumno
										</Typography>
										{signatureUrls.student &&
										missingSignature.student !== true ? (
											<img
												src={signatureUrls.student}
												className="signature-image"
												alt="Firma alumno"
												onError={() =>
													setMissingSignature((prev) => ({
														...prev,
														student: true,
													}))
												}
												onLoad={() =>
													setMissingSignature((prev) => ({
														...prev,
														student: false,
													}))
												}
											/>
										) : (
											<SignatureCanvas
												ref={sigCanvas1}
												penColor="black"
												canvasProps={{
													width: 500,
													height: 200,
													className: isFormDisabled
														? 'signatureCanvas pointer-events-none'
														: 'signatureCanvas',
												}}
											/>
										)}
										<hr />
									</div>
									<div className="flex flex-col gap-3 border border-[#b0bec5] bg-white rounded-sm basis-1/2">
										<Typography
											variant="h5"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Firma del Instructor
										</Typography>
										{signatureUrls.instructor &&
										missingSignature.instructor !== true ? (
											<img
												src={signatureUrls.instructor}
												className="signature-image"
												alt="Firma instructor"
												onError={() =>
													setMissingSignature((prev) => ({
														...prev,
														instructor: true,
													}))
												}
												onLoad={() =>
													setMissingSignature((prev) => ({
														...prev,
														instructor: false,
													}))
												}
											/>
										) : (
											<SignatureCanvas
												ref={sigCanvas2}
												penColor="black"
												canvasProps={{
													width: 500,
													height: 200,
													className: isFormDisabled
														? 'signatureCanvas pointer-events-none'
														: 'signatureCanvas',
												}}
											/>
										)}
										<hr />
									</div>
								</div>
								{isLastStep && (
									<div className="flex flex-row gap-2 justify-center m-2">
										<div className="flex flex-col gap-3 border border-[#b0bec5] bg-white rounded-sm">
											<Typography
												variant="h5"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												firma del FCAA
											</Typography>
											{signatureUrls.fcaa &&
											missingSignature.fcaa !== true ? (
												<img
													src={signatureUrls.fcaa}
													className="signature-image"
													alt="Firma FCAA"
													onError={() =>
														setMissingSignature((prev) => ({
															...prev,
															fcaa: true,
														}))
													}
													onLoad={() =>
														setMissingSignature((prev) => ({
															...prev,
															fcaa: false,
														}))
													}
												/>
											) : (
												<SignatureCanvas
													ref={sigCanvas3}
													penColor="black"
													canvasProps={{
														width: 500,
														height: 200,
														className: isFormDisabled
															? 'signatureCanvas pointer-events-none'
															: 'signatureCanvas',
													}}
												/>
											)}
											<hr />
										</div>
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
				<div className="mt-6 p-4 border border-[#b0bec5] rounded-md bg-gray-50">
					<div className="flex items-start gap-3">
						<Checkbox
							checked={consentChecked}
							onChange={(e) => setConsentChecked(e.target.checked)}
							className="mt-1"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
						/>
						<Typography
							variant="small"
							className="text-slate-700 leading-relaxed"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Por medio del presente, autorizo a CEA 360 ATC, de forma
							expresa el registro en audio y video de la sesión de
							entrenamiento con el único fin de recibir instrucción,
							evaluación técnica y retroalimentación operativa. Esta
							captura de imagen y voz se gestionará bajo estricta
							confidencialidad, garantizando que el material no será
							difundido públicamente ni utilizado con fines
							comerciales. Asimismo, se reconoce el derecho a revocar
							este consentimiento y a solicitar el borrado seguro del
							contenido audiovisual según la normativa vigente de
							protección de datos.
						</Typography>
					</div>
					{!consentChecked && (
						<span className="text-red-500 text-sm ml-10">
							Debe aceptar el consentimiento para guardar
						</span>
					)}
				</div>
				<br />
				<div className="flex flex-row gap-2">
					{isFormDisabled && (
						<div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
							{isSuperuser ? (
								<Button
									variant="outlined"
									color="blue"
									onClick={() => {
										setIsFormDisabled(false);
										setConsentChecked(false);
									}}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Editar
								</Button>
							) : (
								<Typography
									variant="small"
									className="text-slate-700"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Formulario bloqueado
								</Typography>
							)}
						</div>
					)}
				</div>
				<div className="flex flex-row gap-2">
					<fieldset disabled={isFormDisabled} className="contents">
						<Button
							variant="gradient"
							color="green"
							type="submit"
							title="Guardar datos"
							className="flex flex-row justify-center"
							fullWidth
							disabled={!consentChecked}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Save size={15} />
						</Button>
					</fieldset>
					{dayStarted && (
						<Button
							variant="gradient"
							onClick={async () => {
								printCSA();
							}}
							title="imprimir resultados"
							className="flex flex-row justify-center"
							fullWidth
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Printer size={15} />
						</Button>
					)}
					{dayStarted && (
						<Button
							variant="gradient"
							color="blue"
							onClick={async () => {
								sendCSA();
							}}
							disabled={sendingEmail}
							title="enviar resultados por correo"
							className="flex flex-row justify-center"
							fullWidth
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Mail size={15} />
						</Button>
					)}
				</div>
			</form>
		</div>
	);
};

export default CSAD_form;
