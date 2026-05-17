import {
	Button,
	IconButton,
	Menu,
	MenuHandler,
	MenuList,
	MenuItem,
} from '@material-tailwind/react';
import {
	Pencil,
	ListTodo,
	FileText,
	NotebookText,
	MoreVertical,
} from 'lucide-react';
import {
	courseStudent,
	courseStudentTest,
} from '../../../../types/utilities';
import moment from 'moment';

interface TestListItemActionsProps {
	active: boolean;
	isGeneratingTest: boolean;
	selfUser: boolean;
	CL: courseStudent;
	dateTest: moment.Moment | null;
	user_id: number;
	lastTest: courseStudentTest | undefined;
	exams_submitted: number;
	selfInstructor: boolean;
	isSuperuser: boolean;
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

const TestListItemActions = ({
	active,
	isGeneratingTest,
	selfUser,
	CL,
	dateTest,
	user_id,
	lastTest,
	exams_submitted,
	selfInstructor,
	isSuperuser,
	onNavigateCourseStudentTest,
	onSeeResults,
	onOpenExamsList,
	onNavigateReviewTest,
}: TestListItemActionsProps) => {
	return (
		<div className="flex justify-end w-full sm:w-auto mt-2 sm:mt-0">
			<div className="hidden sm:flex">
				<div className="flex flex-row items-center gap-2">
					<Button
						title="Iniciar examen"
						className="flex items-center gap-1 px-2 sm:px-3"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						disabled={!active || isGeneratingTest}
						onClick={() => {
							onNavigateCourseStudentTest(
								CL,
								dateTest ? dateTest.format('YYYY-MM-DD') : '-1',
							);
						}}
					>
						<Pencil size={15} />
					</Button>

					{CL.score && lastTest && CL.student?.user?.id && (
						<Button
							title="Respuestas del ultimo examen"
							className="flex items-center gap-1 px-2 sm:px-3"
							disabled={active || !selfUser}
							onClick={() => {
								onSeeResults(lastTest.id, CL.course_id, user_id);
							}}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<ListTodo size={15} />
						</Button>
					)}

					{(selfUser || isSuperuser) && (
						<Button
							title="Ver examenes"
							className="flex items-center gap-1 px-2 sm:px-3"
							disabled={!CL.student?.user?.id || !CL.id}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							onClick={() => {
								onOpenExamsList(
									CL.student?.id || -1,
									CL.id || -1,
									user_id,
								);
							}}
						>
							<FileText size={15} />
						</Button>
					)}

					{CL.score &&
						lastTest &&
						CL.student?.user?.id &&
						isSuperuser && (
							<Button
								title="Revisión del ultimo examen"
								className="flex items-center gap-1 px-2 sm:px-3"
								disabled={!selfInstructor || exams_submitted === 0}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								onClick={() => {
									onNavigateReviewTest(
										lastTest.id,
										lastTest.test_id,
										CL.course_id,
										lastTest?.course_student_id,
										user_id,
									);
								}}
							>
								<NotebookText size={15} />
							</Button>
						)}
				</div>
			</div>

			{/* Menú para móviles */}
			<div className="sm:hidden">
				<Menu>
					<MenuHandler>
						<IconButton
							variant="text"
							className="rounded-full"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<MoreVertical size={20} />
						</IconButton>
					</MenuHandler>
					<MenuList
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<MenuItem
							className="flex items-center gap-2"
							disabled={!active || isGeneratingTest}
							onClick={() => {
								onNavigateCourseStudentTest(
									CL,
									dateTest ? dateTest.format('YYYY-MM-DD') : '-1',
								);
							}}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<Pencil size={15} />
							<span>Iniciar examen</span>
						</MenuItem>

						{CL.score && lastTest && CL.student?.user?.id && (
							<MenuItem
								className="flex items-center gap-2"
								disabled={active || !selfUser}
								onClick={() => {
									onSeeResults(lastTest.id, CL.course_id, user_id);
								}}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<ListTodo size={15} />
								<span>Ver respuestas</span>
							</MenuItem>
						)}
						{(selfUser || isSuperuser) && (
							<MenuItem
								className="flex items-center gap-2"
								disabled={!CL.student?.user?.id || !CL.id}
								onClick={() => {
									onOpenExamsList(
										CL.student?.id || -1,
										CL.id || -1,
										user_id,
									);
								}}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<FileText size={15} />
								<span>Ver examenes</span>
							</MenuItem>
						)}

						{CL.score &&
							lastTest &&
							CL.student?.user?.id &&
							isSuperuser && (
								<MenuItem
									className="flex items-center gap-2"
									disabled={!selfInstructor || exams_submitted === 0}
									onClick={() => {
										onNavigateReviewTest(
											lastTest.id,
											lastTest.test_id,
											CL.course_id,
											lastTest?.course_student_id,
											user_id,
										);
									}}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<NotebookText size={15} />
									<span>Revisión</span>
								</MenuItem>
							)}
					</MenuList>
				</Menu>
			</div>
		</div>
	);
};

export default TestListItemActions;
