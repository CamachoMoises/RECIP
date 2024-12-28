import {
	// useNavigate,
	useParams,
} from 'react-router-dom';
import {
	fetchQuestionTypes,
	fetchQuestions,
	fetchTest,
} from '../../../../features/testSlice';
import { breadCrumbsItems } from '../../../../types/utilities';
import PageTitle from '../../../../components/PageTitle';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import LoadingPage from '../../../../components/LoadingPage';
import ErrorPage from '../../../../components/ErrorPage';
import { useEffect, useState } from 'react';
import {
	Button,
	Card,
	CardBody,
	Typography,
} from '@material-tailwind/react';
import TestRadio from './questionTypeTest/Radio';
import TestInput from './questionTypeTest/Input';
import TestCheck from './questionTypeTest/Check';
import TestCompletion from './questionTypeTest/Completion';
import { Plus } from 'lucide-react';
import NewQuestionTest from './newQuestionTest';

const QuestionTestList = () => {
	// const navigate = useNavigate();
	const { test } = useSelector((state: RootState) => {
		return { test: state.tests };
	});
	const { course_id, test_id, question_type_id } = useParams<{
		course_id: string;
		test_id: string;
		question_type_id: string;
	}>();
	const dispatch = useDispatch<AppDispatch>();
	const [open, setOpen] = useState(false);
	useEffect(() => {
		dispatch(fetchTest(test_id ? parseInt(test_id) : -1));
		dispatch(
			fetchQuestions({
				test_id: test_id ? parseInt(test_id) : -1,
				question_type_id: question_type_id
					? parseInt(question_type_id)
					: -1,
			})
		);
		dispatch(fetchQuestionTypes());
	}, [dispatch, test_id, question_type_id]);
	const questionType = test.questionTypes.find(
		(QT) =>
			QT.id === parseInt(question_type_id ? question_type_id : '-1')
	);
	const questionTypeTest =
		test.testSelected?.test_question_types.find(
			(TQT) =>
				TQT.question_type_id === (questionType ? questionType.id : -1)
		);
	const questionForTest = questionTypeTest?.amount
		? questionTypeTest.amount
		: 0;
	const breadCrumbs: breadCrumbsItems[] = [
		{
			name: 'Dashboard',
			href: '/dashboard',
		},
		{
			name: 'Configuracion',
			href: '/dashboard/config',
		},
		{
			name: 'Lista de Examenes',
			href: `/dashboard/config/test/${course_id}`,
		},
	];
	if (test.status === 'loading') {
		return (
			<>
				<LoadingPage />
			</>
		);
	}
	if (test.status === 'failed' || !questionType) {
		return (
			<>
				<ErrorPage error={test.error ? test.error : 'Indefinido'} />
			</>
		);
	}

	return (
		<div className="container">
			<PageTitle
				title={`Lista de ${questionType.name} del ${test.testSelected?.code}`}
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
					<Typography
						variant="h4"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Cantidad de preguntas {test.questionList.length}
					</Typography>

					{questionForTest > test.questionList.length && (
						<Typography
							variant="h4"
							color="red"
							className="text-center"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							La cantidad de preguntas no corresponde con la necesaria
							para el examen ({questionForTest})
						</Typography>
					)}
					{questionType.id != 4 && (
						<div className="flex flex-col">
							<Button
								size="sm"
								title="Agregar examen"
								variant="filled"
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								placeholder={undefined}
								onClick={() => {
									setOpen(!open);
								}}
							>
								<Plus size={15} className="mx-auto text-lg" />
							</Button>
						</div>
					)}
				</CardBody>
			</Card>
			<br />
			<div className="flex flex-col gap-4">
				{test.questionList.map((QL, index) => {
					return (
						<Card
							key={`QL-${index}`}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<CardBody
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								{QL.question_type?.id === 1 && (
									<TestRadio
										question={QL}
										type={QL?.question_type?.id}
									/>
								)}

								{QL.question_type?.id === 2 && (
									<TestCheck
										question={QL}
										type={QL.question_type?.id}
									/>
								)}
								{QL.question_type?.id === 3 && (
									<TestRadio
										question={QL}
										type={QL?.question_type?.id}
									/>
								)}
								{QL.question_type?.id === 4 && (
									<TestCompletion
										question={QL}
										type={QL?.question_type?.id}
									/>
								)}
								{QL.question_type?.id === 5 && (
									<TestInput
										question={QL}
										type={QL?.question_type?.id}
									/>
								)}
							</CardBody>
						</Card>
					);
				})}
			</div>
			{open && course_id && test_id && question_type_id && (
				<NewQuestionTest
					open={open}
					testId={parseInt(test_id)}
					courseId={parseInt(course_id)}
					questionTypeId={parseInt(question_type_id)}
					setOpen={setOpen}
				/>
			)}
		</div>
	);
};

export default QuestionTestList;
