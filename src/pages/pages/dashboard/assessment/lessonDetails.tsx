import {
	// useDispatch,
	useSelector,
} from 'react-redux';
import {
	// AppDispatch,
	RootState,
} from '../../../../store';
import { List, ListItem, Typography } from '@material-tailwind/react';
import { courseStudentAssessmentLessonDay } from '../../../../types/utilities';
import { axiosPutDefault } from '../../../../services/axios';
import ScoreDetail from './scoreDetail';

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
		subject_lesson_days_id: number,
		value_2: number | undefined,
		value_3: number | undefined
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
			score_2: value_2,
			score_3: value_3,
			day: assessment.courseStudentAssessmentDaySelected?.day,
		};
		console.log(req);

		const resp = await axiosPutDefault(
			`api/assessment/changeCourseStudentAssessmentLessonDay`,
			req
		);
		console.log(resp);
	};
	// console.log(assessment.subjectList);

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
									return (
										<ListItem
											key={`SLE-list${index2}`}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											<ScoreDetail
												SLE={SLE}
												SLD_id={SLD_id}
												handleChangeRadio={handleChangeRadio}
											/>
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
