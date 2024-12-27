import { useNavigate, useParams } from 'react-router-dom';
import {
	breadCrumbsItems,
	testQuestionType,
} from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { useEffect } from 'react';
import { fetchCourse } from '../../../../features/courseSlice';
import {
	fetchQuestionTypes,
	fetchTests,
	updateTestQuestionTypes,
} from '../../../../features/testSlice';
import {
	Card,
	CardBody,
	List,
	ListItem,
	Typography,
} from '@material-tailwind/react';
import QuestionTest from './questionTest';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
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
const Test = () => {
	const dispatch = useDispatch<AppDispatch>();

	const navigate = useNavigate();
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
				navigate('../');
			}
		}
	}, [course, navigate]);

	const updateTestQuestion = async (
		testQuestion: testQuestionType,
		amount: number
	) => {
		console.log(testQuestion, amount);
		const newTestQuestionType: testQuestionType = {
			...testQuestion,
			amount: amount,
		};

		dispatch(updateTestQuestionTypes(newTestQuestionType));
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
					{test.testList.map((TL, indexTL) => {
						return (
							<div key={`test-${indexTL}`}>
								<Typography
									variant="h4"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Evaluacion del {course.courseSelected?.name}
								</Typography>
								<Typography
									variant="lead"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{course.courseSelected?.course_level.name} {TL.code}
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
														(QTT) => QTT.question_type_id === QT.id
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
									</div>
								</div>
							</div>
						);
					})}
					{/* <code>{JSON.stringify(test.testList, null, 4)}</code> */}
				</CardBody>
			</Card>
		</>
	);
};

export default Test;
