import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	Card,
	CardBody,
	Collapse,
	IconButton,
	Typography,
} from '@material-tailwind/react';
import { ChevronDown, ChevronRight, Eye } from 'lucide-react';
import {
	ScheduleGroupedItem,
	TestParticipationItem,
} from '../../../../features/instructorSlice';
import { course } from '../../../../types/utilities';
import { courseTitle, pilotName } from './instructorShared';

type Props = {
	instructor_id: number;
	tests: TestParticipationItem[];
	schedules: ScheduleGroupedItem[];
	courses: course[];
};

const courseIdOfItem = (item: TestParticipationItem) =>
	item.course_student?.course_id ?? item.test?.course_id ?? null;

const InstructorTestsParticipationTab = ({
	tests,
	schedules,
	courses,
}: Props) => {
	const navigate = useNavigate();
	const [expandedId, setExpandedId] = useState<string | null>(null);

	const courseIdByStudent = useMemo(() => {
		const map: Record<number, number> = {};
		(schedules ?? []).forEach((item) => {
			if (item.course?.id != null) {
				map[item.course_student_id] = item.course.id;
			}
		});
		return map;
	}, [schedules]);

	const catalog = useMemo(
		() =>
			courses.reduce((acc, item) => {
				if (item?.id != null) acc.set(item.id, item);
				return acc;
			}, new Map<number, course>()),
		[courses],
	);

	const filtered = useMemo(() => {
		const list = tests.filter((item) => item.course_student != null);
		return list;
	}, [tests]);

	const summaryOf = (item: TestParticipationItem) => {
		const questions = item.course_student_test_questions ?? [];
		const total = questions.length;
		const answered = questions.filter((q) => q.Answered).length;
		const correct = questions.filter(
			(q) => (q.course_student_test_answer?.score ?? 0) > 0,
		).length;
		return { total, answered, correct };
	};

	if (!filtered.length) {
		return (
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="py-8 text-center text-blue-gray-500"
			>
				No hay tests
			</Typography>
		);
	}

	return (
		<Card
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<CardBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="flex flex-col gap-2"
			>
				<Typography
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="text-sm text-blue-gray-500"
				>
					{filtered.length} intentos
				</Typography>

				{filtered.map((item, index) => {
					const key = item.course_student_test_id ?? item.id ?? index;
					const open = expandedId === String(key);
					const courseOfItem =
						catalog.get(courseIdOfItem(item) ?? -1) ??
						catalog.get(
							courseIdByStudent[item.course_student?.id ?? -1],
						);
					const { total, answered, correct } = summaryOf(item);

					const canReview =
						item.id != null &&
						item.test?.id != null &&
						courseIdOfItem(item) != null &&
						item.course_student?.id != null &&
						item.course_student?.student?.user?.id != null;

					return (
						<div
							key={key}
							className="rounded-lg border border-blue-gray-100"
						>
							<div className="flex flex-wrap items-center justify-between gap-2 bg-blue-gray-50 px-4 py-2">
								<div className="flex flex-wrap items-center gap-3">
									<IconButton
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										variant="text"
										size="sm"
										onClick={() =>
											setExpandedId(open ? null : String(key))
										}
									>
										{open ? (
											<ChevronDown className="h-4 w-4" />
										) : (
											<ChevronRight className="h-4 w-4" />
										)}
									</IconButton>

									<span className="font-semibold text-blue-gray-900">
										{pilotName(item) || 'Piloto'}
									</span>
									<span className="text-sm text-blue-gray-500">
										{item.test?.code ?? ''}
										{canReview && courseOfItem
											? ` · ${courseTitle(courseOfItem.id!, catalog, courseOfItem)}`
											: ''}
									</span>
								</div>

								<div className="flex items-center gap-3 text-xs text-blue-gray-500">
									<span>
										{answered}/{total} respondidas
									</span>
									<span>{correct} correctas</span>
									{item.score != null ? (
										<span>Puntaje: {item.score}</span>
									) : null}
									{item.finished ? (
										<span className="text-green-600">Finalizado</span>
									) : null}
									{canReview ? (
										<IconButton
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											variant="text"
											size="sm"
											onClick={() =>
												navigate(
													`../review_test/${item.id}/${item.test!.id}/${courseIdOfItem(item)}/${item.course_student!.id}/${item.course_student!.student!.user!.id}`,
												)
											}
										>
											<Eye className="h-4 w-4" />
										</IconButton>
									) : null}
								</div>
							</div>

							<Collapse open={open}>
								<ul className="divide-y divide-blue-gray-50">
									{(item.course_student_test_questions ?? []).map(
										(question, qIndex) => {
											const answer =
												question.course_student_test_answer;
											const isCorrect = (answer?.score ?? 0) > 0;

											return (
												<li
													key={question.id ?? qIndex}
													className="flex flex-wrap items-start justify-between gap-2 px-4 py-2 text-sm"
												>
													<span className="text-blue-gray-700">
														<span className="text-blue-gray-500">
															{question.question?.question_type
																?.name ?? ''}
															{question.question?.question_type?.name
																? ' · '
																: ''}
														</span>
														{question.question?.header ?? ''}
														{answer?.resp ? (
															<span className="ml-2 text-blue-gray-500">
																→ {answer.resp}
															</span>
														) : null}
													</span>
													<span
														className={
															isCorrect
																? 'text-xs text-green-600'
																: 'text-xs text-red-500'
														}
													>
														{answer == null
															? 'Sin responder'
															: isCorrect
																? 'Correcta'
																: 'Incorrecta'}
													</span>
												</li>
											);
										},
									)}
								</ul>
							</Collapse>
						</div>
					);
				})}
			</CardBody>
		</Card>
	);
};

export default InstructorTestsParticipationTab;
