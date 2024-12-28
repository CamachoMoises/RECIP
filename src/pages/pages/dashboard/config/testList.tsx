import { useNavigate, useParams } from 'react-router-dom';
import {
	breadCrumbsItems,
	test,
	testQuestionType,
} from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { useEffect, useState } from 'react';
import { fetchCourse } from '../../../../features/courseSlice';
import {
	fetchQuestionTypes,
	fetchTests,
	updateTest,
	updateTestQuestionTypes,
} from '../../../../features/testSlice';
import {
	Button,
	Card,
	CardBody,
	List,
	ListItem,
	Typography,
} from '@material-tailwind/react';
import QuestionTest from './questionTest';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import TestParams from './testParams';
import { Plus } from 'lucide-react';
import NewTestModal from './newTestModal';
const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Dashboard',
		href: '/dashboard',
	},
	{
		name: 'Configuracion',
		href: '/dashboard/config',
	},
];
const TestList = () => {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const [open, setOpen] = useState(false);
	const { id } = useParams<{ id: string }>();
	const { course, test } = useSelector((state: RootState) => {
		return { course: state.courses, test: state.tests };
	});

	useEffect(() => {
		dispatch(fetchCourse(parseInt(id ? id : '-1')));
		dispatch(fetchTests(id ? parseInt(id) : -1));
		dispatch(fetchQuestionTypes());
	}, [dispatch, id]);
	useEffect(() => {
		if (course.courseSelected?.course_type.id) {
			if (course.courseSelected.course_type.id != 1) {
				// navigate('../');
			}
		}
	}, [course, navigate]);
	const testActive = test.testList.find((TF) => TF.status);

	const updateTestQuestion = async (
		testQuestion: testQuestionType,
		amount: number
	) => {
		const newTestQuestionType: testQuestionType = {
			...testQuestion,
			amount: amount,
		};

		await dispatch(updateTestQuestionTypes(newTestQuestionType));
	};

	const updateTestFunc = async (
		test: test,
		data: { duration: number; min_score: number; status: boolean }
	) => {
		if (data.status && testActive) {
			const oldTestActive: test = { ...testActive, status: false };
			await dispatch(updateTest(oldTestActive));
		}
		const newTest: test = {
			...test,
			duration: data.duration,
			min_score: data.min_score,
			status: data.status,
		};
		await dispatch(updateTest(newTest));
	};

	if (test.status === 'loading') {
		return (
			<>
				<LoadingPage />
			</>
		);
	}
	if (test.status === 'failed') {
		return (
			<>
				<ErrorPage error={test.error ? test.error : 'Indefinido'} />
			</>
		);
	}

	return (
		<>
			<PageTitle
				title={`Editar Evaluaciones del curso ${course.courseSelected?.name}`}
				breadCrumbs={breadCrumbs}
			/>
			<div className="flex flex-col gap-3">
				<Card
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<CardBody
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="flex flex-col gap-2">
							<Typography
								variant="h4"
								className="text-left"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Cantidad de examenes {test.testList.length}
							</Typography>
							<div className="flex flex-col">
								<Button
									size="sm"
									title="Agregar examen"
									variant="filled"
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									onClick={() => {
										setOpen(!open);
									}}
									placeholder={undefined}
								>
									<Plus size={15} className="mx-auto text-lg" />
								</Button>
							</div>
						</div>
					</CardBody>
				</Card>
				<div className="flex flex-col gap-3">
					{test.testList.map((TL, indexTL) => {
						return (
							<div key={`test-${indexTL}`}>
								<Card
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									<CardBody
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<Typography
											variant="h4"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Evaluacion del {course.courseSelected?.name}
										</Typography>

										<Typography
											variant="h4"
											color={TL.status ? 'green' : 'red'}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{TL.status ? <>Activo</> : <>Inactivo</>}
										</Typography>

										<Typography
											variant="lead"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{course.courseSelected?.course_level.name}{' '}
											{TL.code}
										</Typography>
										<div className="flex flex-col ">
											<div className="grid grid-cols-2 gap-2">
												<div>
													<Typography
														variant="lead"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														Preguntas por examen
													</Typography>
													<List
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{test.questionTypes.map((QT, indexQT) => {
															const TQT = TL.test_question_types.find(
																(QTT) =>
																	QTT.question_type_id === QT.id
															);
															const TQT_2: testQuestionType = {
																id: -1,
																course_id: TL.course_id,
																amount: 0,
																question_type_id: QT.id,
																status: true,
																test_id: TL.id,
															};
															return (
																<ListItem
																	key={`question-${indexQT}`}
																	className=" flex flex-row justify-between"
																	placeholder={undefined}
																	onPointerEnterCapture={undefined}
																	onPointerLeaveCapture={undefined}
																>
																	<QuestionTest
																		QT={QT}
																		TQT={TQT ? TQT : TQT_2}
																		updateTestQuestion={
																			updateTestQuestion
																		}
																	/>
																</ListItem>
															);
														})}
													</List>
												</div>
												<div>
													<Typography
														variant="lead"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														Parametros del examen
													</Typography>

													<TestParams
														test={TL}
														updateTestFunc={updateTestFunc}
													/>
												</div>
											</div>
										</div>
									</CardBody>
								</Card>
							</div>
						);
					})}
				</div>
			</div>
			{open && course.courseSelected && (
				<>
					<NewTestModal
						open={open}
						setOpen={setOpen}
						courseId={course.courseSelected.id}
					/>
				</>
			)}
		</>
	);
};

export default TestList;
