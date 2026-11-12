import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { subjectLesson } from '../../../types/utilities';
import {
	Button,
	ListItemSuffix,
	Radio,
	Typography,
} from '@material-tailwind/react';
import { Trash2 } from 'lucide-react';

const ScoreDetail = ({
	SLE,
	SLD_id,
	disabled,
	handleChangeRadio,
	onRequestDeleteDetail,
}: {
	SLE: subjectLesson;
	SLD_id: number;
	disabled: boolean;
	handleChangeRadio: (
		id: number | undefined,
		value: number,
		subject_id: number,
		subject_lesson_id: number,
		subject_days_id: number,
		subject_lesson_days_id: number,
		value_2: number | undefined,
		value_3: number | undefined,
	) => Promise<void>;
	onRequestDeleteDetail: (detail: { id: number; name: string }) => void;
}) => {
	const lessonDay = SLE.subject_lesson_days?.[0];
	const detail =
		lessonDay?.course_student_assessment_lesson_days?.[0];
	const CSALD_id = detail?.id;
	const SLED_id = lessonDay?.id;

	const [score, setScore] = useState<number | undefined>(detail?.score);
	const [score_2, setScore_2] = useState<number | undefined>(
		detail?.score_2,
	);
	const [score_3, setScore_3] = useState<number | undefined>(
		detail?.score_3,
	);

	// Al borrar la calificación el detalle desaparece de `subjectList` y hay
	// que limpiar los radios. Solo se depende del id: así dos clics seguidos
	// no se pisan con la respuesta del servidor.
	useEffect(() => {
		setScore(detail?.score);
		setScore_2(detail?.score_2);
		setScore_3(detail?.score_3);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [CSALD_id]);

 	const changeMain = (value: number) => {
 		const prev = score;
 		setScore(value);
 		handleChangeRadio(
 			CSALD_id,
 			value,
 			SLE.subject_id,
 			SLE.id ? SLE.id : -1,
 			SLD_id,
 			SLED_id ? SLED_id : -1,
 			score_2,
 			score_3,
 		).catch(() => {
 			setScore(prev);
 			toast.error('Error al guardar');
 		});
 	};

 	const changeSecond = (value: number) => {
 		const prev = score_2;
 		setScore_2(value);
 		handleChangeRadio(
 			CSALD_id,
 			score!,
 			SLE.subject_id,
 			SLE.id ? SLE.id : -1,
 			SLD_id,
 			SLED_id ? SLED_id : -1,
 			value,
 			score_3,
 		).catch(() => {
 			setScore_2(prev);
 			toast.error('Error al guardar');
 		});
 	};

 	const changeThird = (value: number) => {
 		const prev = score_3;
 		setScore_3(value);
 		handleChangeRadio(
 			CSALD_id,
 			score!,
 			SLE.subject_id,
 			SLE.id ? SLE.id : -1,
 			SLD_id,
 			SLED_id ? SLED_id : -1,
 			score_2,
 			value,
 		).catch(() => {
 			setScore_3(prev);
 			toast.error('Error al guardar');
 		});
 	};

 	return (
 		<>
			<Typography
				variant="paragraph"
				placeholder={undefined}
				className="text-left"
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				{SLE.name}
			</Typography>
			<ListItemSuffix
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<div className="flex items-center gap-2">
					<div className="flex flex-col gap-2 px-3">
						<div
							className={`flex flex-row gap-2 px-3 ${
								!score ? 'bg-blue-100 rounded-sm' : ''
							}`}
						>
							<Radio
								name={`SLE-Radio-${SLE.id}`}
								label="1"
								value={1}
								onChange={() => changeMain(1)}
								checked={score === 1}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
							disabled={disabled}
						/>
							<Radio
								name={`SLE-Radio-${SLE.id}`}
								label="2"
								value={2}
								onChange={() => changeMain(2)}
								checked={score === 2}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
							disabled={disabled}
						/>
							<Radio
								name={`SLE-Radio-${SLE.id}`}
								label="3"
								value={3}
								onChange={() => changeMain(3)}
								checked={score === 3}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
							disabled={disabled}
						/>
							<Radio
								name={`SLE-Radio-${SLE.id}`}
								label="4"
								value={4}
								onChange={() => changeMain(4)}
								checked={score === 4}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
							disabled={disabled}
						/>
						</div>
						{score && score <= 2 && (
							<div className="flex flex-row gap-2 px-3 bg-red-100 rounded-sm">
								<Radio
									name={`SLE-Radio-2-${SLE.id}`}
									label="1"
									value={1}
								onChange={() => changeSecond(1)}
									checked={score_2 === 1}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
								disabled={disabled}
							/>
								<Radio
									name={`SLE-Radio-2-${SLE.id}`}
									label="2"
									value={2}
								onChange={() => changeSecond(2)}
									checked={score_2 === 2}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
								disabled={disabled}
							/>
								<Radio
									name={`SLE-Radio-2-${SLE.id}`}
									label="3"
									value={3}
								onChange={() => changeSecond(3)}
									checked={score_2 === 3}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
								disabled={disabled}
							/>
								<Radio
									name={`SLE-Radio-2-${SLE.id}`}
									label="4"
									value={4}
								onChange={() => changeSecond(4)}
									checked={score_2 === 4}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
								disabled={disabled}
							/>
							</div>
						)}
	
						{score && score_2 && score_2 <= 2 && (
							<div className="flex flex-row gap-2 px-3 bg-red-100 rounded-sm">
								<Radio
									name={`SLE-Radio-3-${SLE.id}`}
									label="1"
									value={1}
								onChange={() => changeThird(1)}
									checked={score_3 === 1}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
								disabled={disabled}
							/>
								<Radio
									name={`SLE-Radio-3-${SLE.id}`}
									label="2"
									value={2}
								onChange={() => changeThird(2)}
									checked={score_3 === 2}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
								disabled={disabled}
							/>
								<Radio
									name={`SLE-Radio-3-${SLE.id}`}
									label="3"
									value={3}
								onChange={() => changeThird(3)}
									checked={score_3 === 3}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
								disabled={disabled}
							/>
								<Radio
									name={`SLE-Radio-3-${SLE.id}`}
									label="4"
									value={4}
								onChange={() => changeThird(4)}
									checked={score_3 === 4}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
								disabled={disabled}
							/>
							</div>
						)}
					</div>
					{CSALD_id !== undefined && !disabled && (
						<Button
							variant="text"
							color="red"
							className="p-2 min-w-0"
							title="Eliminar calificación"
							onClick={() =>
								onRequestDeleteDetail({
									id: CSALD_id,
									name: SLE.name,
								})
							}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Trash2 size={16} />
						</Button>
					)}
				</div>
			</ListItemSuffix>
		</>
	);
};

export default ScoreDetail;
