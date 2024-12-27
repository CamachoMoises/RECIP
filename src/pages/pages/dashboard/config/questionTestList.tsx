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
import { useEffect } from 'react';
import { Card, CardBody } from '@material-tailwind/react';
import TestRadio from './questionTypeTest/Radio';
import TestInput from './questionTypeTest/Input';
import TestCheck from './questionTypeTest/Check';
import TestCompletion from './questionTypeTest/Completion';

const QuestionTestList = () => {
	// const navigate = useNavigate();
	const { test } = useSelector((state: RootState) => {
		return { test: state.tests };
	});
	const { id, question_type_id } = useParams<{
		id: string;
		question_type_id: string;
	}>();
	const dispatch = useDispatch<AppDispatch>();
	useEffect(() => {
		dispatch(fetchTest(id ? parseInt(id) : -1));
		dispatch(
			fetchQuestions({
				test_id: id ? parseInt(id) : -1,
				question_type_id: question_type_id
					? parseInt(question_type_id)
					: -1,
			})
		);
		dispatch(fetchQuestionTypes());
	}, [dispatch, id, question_type_id]);
	const questionType = test.questionTypes.find(
		(QT) =>
			QT.id === parseInt(question_type_id ? question_type_id : '-1')
	);

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
			href: `/dashboard/config/test/${id}`,
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
				title={`Lista de preguntas de ${questionType.name}`}
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
					{test.questionList.map((QL, index) => {
						return (
							<div key={`QL-${index}`}>
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
							</div>
						);
					})}
				</CardBody>
			</Card>
		</div>
	);
};

export default QuestionTestList;
