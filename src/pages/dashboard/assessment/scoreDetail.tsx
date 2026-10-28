import { useState } from 'react';
import toast from 'react-hot-toast';
import { subjectLesson } from '../../../types/utilities';
import {
	ListItemSuffix,
	Radio,
	Typography,
} from '@material-tailwind/react';

const ScoreDetail = ({
	SLE,
	SLD_id,
	disabled,
	handleChangeRadio,
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
}) => {
	const [score, setScore] = useState<number | undefined>(
		SLE.subject_lesson_days &&
			SLE.subject_lesson_days[0] &&
			SLE.subject_lesson_days[0]
				.course_student_assessment_lesson_days &&
			SLE.subject_lesson_days[0]
				.course_student_assessment_lesson_days[0]
			? SLE.subject_lesson_days[0]
					.course_student_assessment_lesson_days[0].score
			: undefined,
	);
	const [score_2, setScore_2] = useState<number | undefined>(
		SLE.subject_lesson_days &&
			SLE.subject_lesson_days[0] &&
			SLE.subject_lesson_days[0]
				.course_student_assessment_lesson_days &&
			SLE.subject_lesson_days[0]
				.course_student_assessment_lesson_days[0]
			? SLE.subject_lesson_days[0]
					.course_student_assessment_lesson_days[0].score_2
			: undefined,
	);
	const [score_3, setScore_3] = useState<number | undefined>(
		SLE.subject_lesson_days &&
			SLE.subject_lesson_days[0] &&
			SLE.subject_lesson_days[0]
				.course_student_assessment_lesson_days &&
			SLE.subject_lesson_days[0]
				.course_student_assessment_lesson_days[0]
			? SLE.subject_lesson_days[0]
					.course_student_assessment_lesson_days[0].score_3
			: undefined,
	);
	let SLED_id: number | undefined = undefined;
	let CSALD_id: number | undefined = undefined;
	if (SLE.subject_lesson_days && SLE.subject_lesson_days[0]) {
		SLED_id = SLE.subject_lesson_days[0].id;
	}
	if (
		SLE.subject_lesson_days &&
		SLE.subject_lesson_days[0] &&
		SLE.subject_lesson_days[0]
			.course_student_assessment_lesson_days &&
		SLE.subject_lesson_days[0]
			.course_student_assessment_lesson_days[0]
	) {
		CSALD_id =
			SLE.subject_lesson_days[0]
				.course_student_assessment_lesson_days[0].id;
 	}

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
							defaultChecked={score === 1}
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
							defaultChecked={score === 2}
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
							defaultChecked={score === 3}
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
							defaultChecked={score === 4}
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
								defaultChecked={score_2 === 1}
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
								defaultChecked={score_2 === 2}
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
								defaultChecked={score_2 === 3}
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
								defaultChecked={score_2 === 4}
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
								defaultChecked={score_3 === 1}
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
								defaultChecked={score_3 === 2}
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
								defaultChecked={score_3 === 3}
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
								defaultChecked={score_3 === 4}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
							disabled={disabled}
						/>
						</div>
					)}
				</div>
			</ListItemSuffix>
		</>
	);
};

export default ScoreDetail;
