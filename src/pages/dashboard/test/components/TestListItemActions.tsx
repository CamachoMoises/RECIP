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
	PlayCircle,
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
	canContinue: boolean;
	openTest?: courseStudentTest;
	onNavigateCourseStudentTest: (
		CS: courseStudent,
		date: string,
	) => void;
	onContinueCourseStudentTest: (
		CS: courseStudent,
		cst: courseStudentTest,
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
	canContinue,
	openTest,
	onNavigateCourseStudentTest,
	onContinueCourseStudentTest,
	onSeeResults,
	onOpenExamsList,
	onNavigateReviewTest,
}: TestListItemActionsProps) => {
	// Si hay un intento reabierto se retoma ese mismo; iniciar de nuevo crearía
	// otro intento con preguntas distintas y perdería lo ya respondido.
	const canResume = canContinue && !!openTest && !isGeneratingTest;
	const canStart = active && !isGeneratingTest;

	const startOrResumeTest = () => {
		if (canResume && openTest) {
			onContinueCourseStudentTest(CL, openTest);
			return;
		}
		onNavigateCourseStudentTest(
			CL,
			dateTest ? dateTest.format('YYYY-MM-DD') : '-1',
		);
	};

	return (
		<div className="flex justify-end w-full sm:w-auto mt-2 sm:mt-0">
			<div className="hidden sm:flex">
				<div className="flex flex-row items-center gap-2">
					<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
						title={canResume ? 'Continuar examen' : 'Iniciar examen'}
						className="flex items-center gap-1 px-2 sm:px-3"
						placeholder={undefined}
						disabled={(!canStart && !canResume) || isGeneratingTest}
						onClick={startOrResumeTest}
					>
						{canResume ? <PlayCircle size={15} /> : <Pencil size={15} />}
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
						<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
							title="Ver examenes"
							className="flex items-center gap-1 px-2 sm:px-3"
							disabled={!CL.student?.user?.id || !CL.id}
							placeholder={undefined}
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
							<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
								title="Revisión del ultimo examen"
								className="flex items-center gap-1 px-2 sm:px-3"
								disabled={!selfInstructor || exams_submitted === 0}
								placeholder={undefined}
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
							disabled={(!canStart && !canResume) || isGeneratingTest}
							onClick={startOrResumeTest}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{canResume ? (
								<PlayCircle size={15} />
							) : (
								<Pencil size={15} />
							)}
							<span>
								{canResume ? 'Continuar examen' : 'Iniciar examen'}
							</span>
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
