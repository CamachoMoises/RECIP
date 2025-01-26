import {
	// useDispatch,
	useSelector,
} from 'react-redux';
import {
	// AppDispatch,
	RootState,
} from '../../../../store';
import {
	List,
	ListItem,
	ListItemSuffix,
	Radio,
	Typography,
} from '@material-tailwind/react';
import { courseStudentAssessmentLessonDay } from '../../../../types/utilities';
import { axiosPutDefault } from '../../../../services/axios';

const LessonDetails = ({ day }: { day: number }) => {
	// const dispatch = useDispatch<AppDispatch>();

	const { assessment } = useSelector((state: RootState) => {
		return {
			assessment: state.assessment,
		};
	});
	const handleChangeRadio = async (
		id: number | undefined,
		value: number,
		subject_id: number,
		subject_lesson_id: number,
		subject_days_id: number,
		subject_lesson_days_id: number
	) => {
		const req: courseStudentAssessmentLessonDay = {
			id: id,
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
			course_student_assessment_day_id: assessment
				.courseStudentAssessmentDaySelected?.id
				? assessment.courseStudentAssessmentDaySelected.id
				: -1,
			subject_id,
			subject_lesson_id,
			subject_days_id,
			subject_lesson_days_id,
			item: `${value}`,
			score: value,
			day: assessment.courseStudentAssessmentDaySelected?.day,
		};
		console.log(req);

		const resp = await axiosPutDefault(
			`api/assessment/changeCourseStudentAssessmentLessonDay`,
			req
		);
		console.log(resp);
	};
	console.log(assessment.subjectList);

	return (
		<div>
			<Typography
				variant="h4"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Session del dia {day}
			</Typography>
			<div className="flex flex-col gap-2 py-2">
				{assessment.subjectList?.map((SL, index) => {
					let SLD_id: number = -1;
					if (SL.subject_days && SL.subject_days[0].id) {
						SLD_id = SL.subject_days[0].id;
					}
					return (
						<div key={`SL-list${index}`}>
							<Typography
								variant="h6"
								className="text-left"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{SL.name}
							</Typography>
							<List
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{SL.subject_lessons?.map((SLE, index2) => {
									let score: number | null = null;
									let SLED_id: number | undefined = undefined;
									let CSALD_id: number | undefined = undefined;
									if (
										SLE.subject_lesson_days &&
										SLE.subject_lesson_days[0]
									) {
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
										score =
											SLE.subject_lesson_days[0]
												.course_student_assessment_lesson_days[0]
												.score;
										CSALD_id =
											SLE.subject_lesson_days[0]
												.course_student_assessment_lesson_days[0].id;
									}
									return (
										<ListItem
											key={`SLE-list${index2}`}
											placeholder={undefined}
											className={`${!score ? 'bg-blue-100' : ''}`}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
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
												<div className="flex flex-row gap-2 px-3">
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
																SLED_id ? SLED_id : -1
															);
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
																SLED_id ? SLED_id : -1
															);
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
																SLED_id ? SLED_id : -1
															);
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
																SLED_id ? SLED_id : -1
															);
														}}
														defaultChecked={score === 4}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
														crossOrigin={undefined}
													/>
												</div>
											</ListItemSuffix>
										</ListItem>
									);
								})}
							</List>
							<hr />
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default LessonDetails;
