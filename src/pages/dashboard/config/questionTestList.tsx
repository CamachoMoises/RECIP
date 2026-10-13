import {
	// useNavigate,
	useParams,
} from 'react-router-dom';
import {
	deleteQuestionTest,
	deleteQuestionsByTest,
	fetchQuestionTypes,
	fetchQuestions,
	fetchTest,
} from '../../../features/testSlice';
import { breadCrumbsItems, question } from '../../../types/utilities';
import PageTitle from '../../../components/PageTitle';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import { useEffect, useState } from 'react';
import {
	Button,
	Card,
	CardBody,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Typography,
} from '@material-tailwind/react';
import TestRadio from './questionTypeTest/Radio';
import TestInput from './questionTypeTest/Input';
import TestCheck from './questionTypeTest/Check';
import TestCompletion from './questionTypeTest/Completion';
import { Plus, Trash2 } from 'lucide-react';
import NewQuestionTest from './newQuestionTest';
import toast from 'react-hot-toast';

const QuestionTestList = () => {
	// const navigate = useNavigate();
	const { test } = useSelector((state: RootState) => {
		return { test: state.tests };
	});
	const {
		course_id,
		test_id,
		question_type_id,
		test_question_type_id,
	} = useParams<{
		course_id: string;
		test_id: string;
		question_type_id: string;
		test_question_type_id: string;
	}>();
	const dispatch = useDispatch<AppDispatch>();
	const [open, setOpen] = useState(false);
	const [questionToDelete, setQuestionToDelete] = useState<question | null>(null);
	const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
	useEffect(() => {
		dispatch(fetchTest(test_id ? parseInt(test_id) : -1));
		dispatch(
			fetchQuestions({
				test_id: test_id ? parseInt(test_id) : -1,
				question_type_id: question_type_id
					? parseInt(question_type_id)
					: -1,
				test_question_type_id: test_question_type_id
					? parseInt(test_question_type_id)
					: -1,
			}),
		);
		dispatch(fetchQuestionTypes());
	}, [dispatch, test_id, question_type_id, test_question_type_id]);
	const questionType = test.questionTypes.find(
		(QT) =>
			QT.id === parseInt(question_type_id ? question_type_id : '-1'),
	);
	const questionTypeTest =
		test.testSelected?.test_question_types.find(
			(TQT) =>
				TQT.question_type_id ===
				(questionType ? questionType.id : -1),
		);
	const questionForTest = questionTypeTest?.amount
		? questionTypeTest.amount
		: 0;
	const breadCrumbs: breadCrumbsItems[] = [
		{
			name: 'Inicio',
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
	const handleDeleteQuestion = async () => {
		if (!questionToDelete) return;
		try {
			await dispatch(deleteQuestionTest(questionToDelete.id)).unwrap();
			toast.success('Pregunta eliminada correctamente');
		} catch (error: any) {
			toast.error(error || 'Error al eliminar la pregunta');
		} finally {
			setQuestionToDelete(null);
		}
	};

	const handleDeleteAllQuestions = async () => {
		const id = test_id ? parseInt(test_id) : -1;
		if (id < 0) return;
		try {
			const result = await dispatch(deleteQuestionsByTest(id)).unwrap();
			toast.success(
				`${result.deleted_count} pregunta(s) y ${result.deleted_answers_count} respuesta(s) eliminada(s).`,
			);
		} catch (error: any) {
			toast.error(error || 'Error al eliminar las preguntas');
		} finally {
			setConfirmDeleteAll(false);
		}
	};

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
					<div className="flex flex-row gap-2">
						{questionType.id != 4 && (
							<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
								size="sm"
								title="Agregar pregunta"
								variant="filled"
								placeholder={undefined}
								onClick={() => {
									setOpen(!open);
								}}
							>
								<Plus size={15} className="mx-auto text-lg" />
							</Button>
						)}
						<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
							size="sm"
							title="Eliminar todas las preguntas del examen"
							variant="filled"
							color="red"
							disabled={test.questionList.length === 0}
							placeholder={undefined}
							onClick={() => {
								setConfirmDeleteAll(true);
							}}
						>
							<Trash2 size={15} className="mx-auto text-lg" />
						</Button>
					</div>
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
								<div className="flex justify-end mb-2">
									<Button onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}
										size="sm"
										title="Eliminar pregunta"
										variant="text"
										color="red"
										placeholder={undefined}
										onClick={() => {
											setQuestionToDelete(QL);
										}}
									>
										<Trash2 size={16} />
									</Button>
								</div>
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

			{open &&
				course_id &&
				test_id &&
				question_type_id &&
				test_question_type_id && (
					<NewQuestionTest
						open={open}
						testId={parseInt(test_id)}
						courseId={parseInt(course_id)}
						questionTypeId={parseInt(question_type_id)}
						testQuestionTypeId={parseInt(test_question_type_id)}
						setOpen={setOpen}
					/>
				)}
			<Dialog
				open={questionToDelete !== null}
				handler={() => setQuestionToDelete(null)}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Confirmar eliminación
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Se eliminará la pregunta{' '}
					<strong className="break-all">
						{questionToDelete?.header}
					</strong>{' '}
					y todas sus respuestas asociadas. Esta acción no se puede deshacer.
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Button
						variant="text"
						color="gray"
						onClick={() => setQuestionToDelete(null)}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						className="mr-2"
					>
						Cancelar
					</Button>
					<Button
						color="red"
						onClick={handleDeleteQuestion}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Eliminar
					</Button>
				</DialogFooter>
			</Dialog>
			<Dialog
				open={confirmDeleteAll}
				handler={() => setConfirmDeleteAll(false)}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Confirmar eliminación
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Se eliminarán <strong>todas</strong> las preguntas del examen{' '}
					<strong>{test.testSelected?.code}</strong> y sus respuestas
					asociadas. Esta acción no se puede deshacer.
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Button
						variant="text"
						color="gray"
						onClick={() => setConfirmDeleteAll(false)}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						className="mr-2"
					>
						Cancelar
					</Button>
					<Button
						color="red"
						onClick={handleDeleteAllQuestions}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Eliminar
					</Button>
				</DialogFooter>
			</Dialog>
		</div>
	);
};

export default QuestionTestList;
