import { ListItem, Typography } from '@material-tailwind/react';
import moment from 'moment';
import {
	courseStudent,
	courseStudentTest,
	instructor,
} from '../../../../types/utilities';
import TestListItemActions from './TestListItemActions';

interface TestListItemProps {
	CL: courseStudent;
	byPassMaxTries: boolean;
	now: Date;
	isGeneratingTest: boolean;
	isSuperuser: boolean;
	authUserId: number;
	onNavigateCourseStudentTest: (
		CS: courseStudent,
		date: string,
	) => void;
	onSeeResults: (
		CST_id: number,
		course_id: number,
		user_id: number,
	) => void;
	onOpenExamsList: (
		studentId: number,
		courseStudentId: number,
		userId: number,
	) => void;
	onNavigateReviewTest: (
		CST_id: number,
		test_id: number,
		course_id: number,
		CS_id: number,
		user_id: number,
	) => void;
}

const TestListItem = ({
	CL,
	byPassMaxTries,
	now,
	isGeneratingTest,
	isSuperuser,
	authUserId,
	onNavigateCourseStudentTest,
	onSeeResults,
	onOpenExamsList,
	onNavigateReviewTest,
}: TestListItemProps) => {
	const maxTries = CL.max_attempts || 5;
	let instructor: instructor | undefined = undefined;
	let lastTest: courseStudentTest | undefined = undefined;
	const user_id = CL.student?.user?.id ? CL.student.user.id : -1;
	let active = true;
	let dateTest = null;
	let horas = null;
	const exams_submitted = CL.course_student_tests?.length || 0;

	if (exams_submitted > 0) {
		active = byPassMaxTries ? true : exams_submitted < maxTries;
		lastTest = CL.course_student_tests?.slice(-1)[0];
	}

	if (CL.schedules?.length === 0) {
		active = false;
	} else {
		dateTest = CL.schedules
			? moment(`${CL.schedules[0].date} ${CL.schedules[0].hour}`)
			: null;
	}

	const selfUser = authUserId === CL.student?.user?.id;
	let selfInstructor = false;

	if (!selfUser) {
		active = false;
	}

	if (CL.schedules && CL.schedules[0]) {
		instructor = CL.schedules[0].instructor;
		selfInstructor = instructor?.user?.id === authUserId;
	}

	if (dateTest) {
		const currentDate = moment(now);
		horas = currentDate.diff(dateTest, 'hours', true);
	}

	if (!horas || horas < 0 || horas > 2) {
		active = false;
	}

	return (
		<ListItem
			key={`${CL.id}.courseList`}
			className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4 sm:py-3"
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<div className="flex flex-col sm:flex-row w-full gap-3">
				<div className="flex flex-col w-full">
					<div className="flex items-center justify-between">
						<Typography
							variant="h6"
							className="text-sm sm:text-base font-semibold text-blue-gray-800"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{CL.code}
						</Typography>

						{((selfUser && exams_submitted > 0) || isSuperuser) && (
							<Typography
								variant="small"
								className="text-xs sm:text-sm text-red-600 bg-red-50 px-2 py-1 rounded"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Intentos {exams_submitted} / {maxTries}
							</Typography>
						)}
					</div>

					<div className="mt-2">
						<Typography
							variant="small"
							className="text-xs sm:text-sm font-semibold text-gray-700"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Participante:
						</Typography>
						<Typography
							variant="small"
							className="text-xs sm:text-sm text-gray-800"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{CL.student?.user?.name
								? `${CL.student.user.name} ${CL.student.user.last_name}`
								: 'Sin Piloto'}
						</Typography>

						<div className="mt-1 flex flex-wrap gap-x-4">
							<Typography
								variant="small"
								className="text-xs sm:text-sm text-gray-700"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<span className="font-semibold">Curso:</span>{' '}
								{CL.course?.name}
							</Typography>

							{dateTest && (
								<Typography
									variant="small"
									className="text-xs sm:text-sm text-gray-700"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<span className="font-semibold">Fecha:</span>{' '}
									{dateTest.format('DD-MM-YYYY')}
								</Typography>
							)}

							{dateTest && (
								<Typography
									variant="small"
									className="text-xs sm:text-sm text-gray-700"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<span className="font-semibold">Hora:</span>{' '}
									{dateTest.format('HH:mm')}
								</Typography>
							)}
						</div>

						{instructor && (
							<Typography
								variant="small"
								className="text-xs sm:text-sm text-gray-700 mt-1"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<span className="font-semibold">Instructor:</span>{' '}
								{instructor.user?.name} {instructor.user?.last_name}
							</Typography>
						)}

						{(isSuperuser ||
							(CL.highest_score !== undefined && selfUser)) && (
							<Typography
								variant="small"
								className="text-xs sm:text-sm font-semibold text-red-600 mt-1"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Calificación: {CL.highest_score} Puntos
							</Typography>
						)}
					</div>
				</div>

				<TestListItemActions
					active={active}
					isGeneratingTest={isGeneratingTest}
					selfUser={selfUser}
					CL={CL}
					dateTest={dateTest}
					user_id={user_id}
					lastTest={lastTest}
					exams_submitted={exams_submitted}
					selfInstructor={selfInstructor}
					isSuperuser={isSuperuser}
					onNavigateCourseStudentTest={onNavigateCourseStudentTest}
					onSeeResults={onSeeResults}
					onOpenExamsList={onOpenExamsList}
					onNavigateReviewTest={onNavigateReviewTest}
				/>
			</div>
		</ListItem>
	);
};

export default TestListItem;
