import { useState } from 'react';
import { subjectLesson } from '../../../../types/utilities';
import {
	ListItemSuffix,
	Radio,
	Typography,
} from '@material-tailwind/react';

const ScoreDetail = ({
	SLE,
	SLD_id,
	handleChangeRadio,
}: {
	SLE: subjectLesson;
	SLD_id: number;
	handleChangeRadio: (
		id: number | undefined,
		value: number,
		subject_id: number,
		subject_lesson_id: number,
		subject_days_id: number,
		subject_lesson_days_id: number,
		value_2: number | undefined,
		value_3: number | undefined
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
			: undefined
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
			: undefined
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
			: undefined
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
							!score ? 'bg-blue-100 rounded' : ''
						}`}
					>
						<Radio
							name={`SLE-Radio-${SLE.id}`}
							label="1"
							value={1}
							onChange={() => {
								handleChangeRadio(
									CSALD_id,
									1,
									SLE.subject_id,
									SLE.id ? SLE.id : -1,
									SLD_id,
									SLED_id ? SLED_id : -1,
									score_2,
									score_3
								);
								setScore(1);
							}}
							defaultChecked={score === 1}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
						/>
						<Radio
							name={`SLE-Radio-${SLE.id}`}
							label="2"
							value={2}
							onChange={() => {
								handleChangeRadio(
									CSALD_id,
									2,
									SLE.subject_id,
									SLE.id ? SLE.id : -1,
									SLD_id,
									SLED_id ? SLED_id : -1,
									score_2,
									score_3
								);
								setScore(2);
							}}
							defaultChecked={score === 2}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
						/>
						<Radio
							name={`SLE-Radio-${SLE.id}`}
							label="3"
							value={3}
							onChange={() => {
								handleChangeRadio(
									CSALD_id,
									3,
									SLE.subject_id,
									SLE.id ? SLE.id : -1,
									SLD_id,
									SLED_id ? SLED_id : -1,
									score_2,
									score_3
								);
								setScore(3);
							}}
							defaultChecked={score === 3}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
						/>
						<Radio
							name={`SLE-Radio-${SLE.id}`}
							label="4"
							value={4}
							onChange={() => {
								handleChangeRadio(
									CSALD_id,
									4,
									SLE.subject_id,
									SLE.id ? SLE.id : -1,
									SLD_id,
									SLED_id ? SLED_id : -1,
									score_2,
									score_3
								);
								setScore(4);
							}}
							defaultChecked={score === 4}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
						/>
					</div>
					{score && score <= 2 && (
						<div className="flex flex-row gap-2 px-3 bg-red-100 rounded">
							<Radio
								name={`SLE-Radio-2-${SLE.id}`}
								label="1"
								value={1}
								onChange={() => {
									handleChangeRadio(
										CSALD_id,
										score,
										SLE.subject_id,
										SLE.id ? SLE.id : -1,
										SLD_id,
										SLED_id ? SLED_id : -1,
										1,
										score_3
									);
									setScore_2(1);
								}}
								defaultChecked={score_2 === 1}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
							/>
							<Radio
								name={`SLE-Radio-2-${SLE.id}`}
								label="2"
								value={2}
								onChange={() => {
									handleChangeRadio(
										CSALD_id,
										score,
										SLE.subject_id,
										SLE.id ? SLE.id : -1,
										SLD_id,
										SLED_id ? SLED_id : -1,
										2,
										score_3
									);
									setScore_2(2);
								}}
								defaultChecked={score_2 === 2}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
							/>
							<Radio
								name={`SLE-Radio-2-${SLE.id}`}
								label="3"
								value={3}
								onChange={() => {
									handleChangeRadio(
										CSALD_id,
										score,
										SLE.subject_id,
										SLE.id ? SLE.id : -1,
										SLD_id,
										SLED_id ? SLED_id : -1,
										3,
										score_3
									);
									setScore_2(3);
								}}
								defaultChecked={score_2 === 3}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
							/>
							<Radio
								name={`SLE-Radio-2-${SLE.id}`}
								label="4"
								value={4}
								onChange={() => {
									handleChangeRadio(
										CSALD_id,
										score,
										SLE.subject_id,
										SLE.id ? SLE.id : -1,
										SLD_id,
										SLED_id ? SLED_id : -1,
										4,
										score_3
									);
									setScore_2(4);
								}}
								defaultChecked={score_2 === 4}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
							/>
						</div>
					)}

					{score && score_2 && score_2 <= 2 && (
						<div className="flex flex-row gap-2 px-3 bg-red-100 rounded">
							<Radio
								name={`SLE-Radio-3-${SLE.id}`}
								label="1"
								value={1}
								onChange={() => {
									handleChangeRadio(
										CSALD_id,
										score,
										SLE.subject_id,
										SLE.id ? SLE.id : -1,
										SLD_id,
										SLED_id ? SLED_id : -1,
										score_2,
										1
									);
									setScore_3(1);
								}}
								defaultChecked={score_3 === 1}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
							/>
							<Radio
								name={`SLE-Radio-3-${SLE.id}`}
								label="2"
								value={2}
								onChange={() => {
									handleChangeRadio(
										CSALD_id,
										score,
										SLE.subject_id,
										SLE.id ? SLE.id : -1,
										SLD_id,
										SLED_id ? SLED_id : -1,
										score_2,
										2
									);
									setScore_3(2);
								}}
								defaultChecked={score_3 === 2}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
							/>
							<Radio
								name={`SLE-Radio-3-${SLE.id}`}
								label="3"
								value={3}
								onChange={() => {
									handleChangeRadio(
										CSALD_id,
										score,
										SLE.subject_id,
										SLE.id ? SLE.id : -1,
										SLD_id,
										SLED_id ? SLED_id : -1,
										score_2,
										3
									);
									setScore_3(3);
								}}
								defaultChecked={score_3 === 3}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
							/>
							<Radio
								name={`SLE-Radio-3-${SLE.id}`}
								label="4"
								value={4}
								onChange={() => {
									handleChangeRadio(
										CSALD_id,
										score,
										SLE.subject_id,
										SLE.id ? SLE.id : -1,
										SLD_id,
										SLED_id ? SLED_id : -1,
										score_2,
										4
									);
									setScore_3(4);
								}}
								defaultChecked={score_3 === 4}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								crossOrigin={undefined}
							/>
						</div>
					)}
				</div>
			</ListItemSuffix>
		</>
	);
};

export default ScoreDetail;
