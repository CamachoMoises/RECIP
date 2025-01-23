import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button, Input, Textarea } from '@material-tailwind/react';
import { Save } from 'lucide-react';
import LessonDetails from './lessonDetails';
import { courseStudentAssessmentDay } from '../../../../types/utilities';
import { updateCourseStudentAssessmentDay } from '../../../../features/assessmentSlice';
type Inputs = {
	airport: string;
	airstrip: string;
	elevation: number;
	meteorology: string;
	temperature: number;
	qnh: string;
	wind: string;
	weight: number;
	flaps: number;
	power: string;
	seat: string;
	comments: string;
};
const CSAD_form = ({ day }: { day: number }) => {
	const { assessment } = useSelector((state: RootState) => {
		return {
			assessment: state.assessment,
		};
	});
	const dispatch = useDispatch<AppDispatch>();

	const {
		register,
		handleSubmit,

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
			comments:
				assessment.courseStudentAssessmentDaySelected?.comments,
		},
	});

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		console.log(data);
		const req: courseStudentAssessmentDay = {
			...data,
			id: assessment.courseStudentAssessmentDaySelected?.id
				? assessment.courseStudentAssessmentDaySelected.id
				: -1,
			course_id: assessment.courseStudentAssessmentDaySelected
				?.course_id
				? assessment.courseStudentAssessmentDaySelected.course_id
				: -1,
			student_id: assessment.courseStudentAssessmentDaySelected
				?.student_id
				? assessment.courseStudentAssessmentDaySelected.student_id
				: -1,
			course_student_id: assessment.courseStudentAssessmentDaySelected
				?.course_student_id
				? assessment.courseStudentAssessmentDaySelected
						.course_student_id
				: -1,
			course_student_assessment_id: assessment
				.courseStudentAssessmentDaySelected
				?.course_student_assessment_id
				? assessment.courseStudentAssessmentDaySelected
						.course_student_assessment_id
				: -1,
			day: assessment.courseStudentAssessmentDaySelected?.day
				? assessment.courseStudentAssessmentDaySelected.day
				: -1,
		};
		await dispatch(updateCourseStudentAssessmentDay(req));
	};
	return (
		<>
			{/* Form for CSAD */}
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="grid grid-cols-4 gap-4 py-3">
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
							pattern="^\d+(\.\d+)?$"
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
					<div>
						<Button
							variant="gradient"
							color="green"
							type="submit"
							title="Guardar"
							className="flex flex-row justify-center"
							fullWidth
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Save size={15} />
						</Button>
					</div>
				</div>
				<hr />
				{assessment.courseStudentAssessmentDaySelected?.airport && (
					<>
						<LessonDetails day={day} />
						<div className="flex flex-col col-span-4 py-2">
							<Textarea
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								label="Comentarios "
								maxLength={500}
								className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
								{...register('comments')}
								aria-invalid={errors.comments ? 'true' : 'false'}
							/>

							<div>
								<Button
									variant="gradient"
									color="green"
									type="submit"
									title="Guardar"
									className="flex flex-row justify-center"
									fullWidth
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<Save size={15} />
								</Button>
							</div>
						</div>
					</>
				)}
			</form>
		</>
	);
};

export default CSAD_form;
