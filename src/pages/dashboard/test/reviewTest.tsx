import { useEffect, useState } from 'react';
import { AppDispatch, RootState } from '../../../store';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
	fetchCourseStudentTest,
	fetchTest,
	clearReviewTest,
} from '../../../features/testSlice';
import {
	fetchCourse,
	fetchCourseStudent,
} from '../../../features/courseSlice';
import { fetchUser } from '../../../features/userSlice';
import PageTitle from '../../../components/PageTitle';
import { breadCrumbsItems } from '../../../types/utilities';
import ReviewItemList from './reviewItemList';
import { User, BookOpen, FileText } from 'lucide-react';

const breadCrumbs: breadCrumbsItems[] = [
	{ name: 'Inicio', href: '/dashboard' },
	{ name: 'Examenes', href: '/dashboard/test' },
];

const type_trip = ['', 'PIC', 'SIC', 'SFI', 'SFE'];
const license = ['', 'ATP', 'Commercial', 'Privado', 'FANB'];
const regulation = ['', 'INAC', 'No-INAC'];

const ReviewTest = () => {
	const dispatch = useDispatch<AppDispatch>();
	const [editing, setEditing] = useState(false);

	const { course, test, user } = useSelector((state: RootState) => ({
		course: state.courses,
		test: state.tests,
		user: state.users,
	}));

	const { CST_id, test_id, course_id, CS_id, user_id } = useParams<{
		CST_id: string;
		test_id: string;
		course_id: string;
		CS_id: string;
		user_id: string;
	}>();

	const questions =
		test.courseStudentTestSelected?.course_student_test_questions;

	useEffect(() => {
		dispatch(fetchCourseStudentTest(CST_id ? parseInt(CST_id) : -1));
		dispatch(fetchCourseStudent(CS_id ? parseInt(CS_id) : -1));
		dispatch(fetchTest(test_id ? parseInt(test_id) : -1));
		dispatch(fetchCourse(course_id ? parseInt(course_id) : -1));
		dispatch(fetchUser(user_id ? parseInt(user_id) : -1));

		// Limpia al salir del componente
		return () => {
			dispatch(clearReviewTest());
		};
	}, [dispatch, CST_id, test_id, course_id, CS_id, user_id]);

	const cst = test.courseStudentTestSelected;
	const minScore = test.testSelected?.min_score ?? 0;
	const currentScore = cst?.score ?? 0;
	const scorePercent =
		minScore > 0 ? Math.min((currentScore / minScore) * 100, 100) : 0;
	const approved = currentScore >= minScore;

	return (
		<>
			<PageTitle
				title={`Revisión: ${cst?.code ?? '...'} (${test.testSelected?.code ?? '...'})`}
				breadCrumbs={breadCrumbs}
			/>

			<div className="flex flex-col gap-4">
				{/* Header card — info del estudiante */}
				<div className="border border-gray-100 rounded-xl p-5 flex flex-col gap-4">
					{/* Curso */}
					<div className="flex items-center gap-2">
						<BookOpen size={16} className="text-blue-500 shrink-0" />
						<p className="text-sm font-medium text-gray-800">
							{course.courseSelected?.course_level?.name}{' '}
							{course.courseSelected?.name}
						</p>
					</div>

					{/* Score badge */}
					{cst?.score !== null && cst?.score !== undefined && (
						<div className="flex flex-col gap-1">
							<div className="flex items-center justify-between text-xs">
								<span className="text-gray-500">
									Puntaje obtenido
								</span>
								<span
									className={`font-semibold ${approved ? 'text-green-600' : 'text-red-600'}`}
								>
									{currentScore} / {minScore} (min)
								</span>
							</div>
							<div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
								<div
									className={`h-full rounded-full transition-all ${approved ? 'bg-green-500' : 'bg-red-500'}`}
									style={{ width: `${scorePercent}%` }}
								/>
							</div>
							<span
								className={`text-xs font-medium ${approved ? 'text-green-600' : 'text-red-600'}`}
							>
								{approved ? 'Aprobado' : 'Reprobado'}
							</span>
						</div>
					)}

					{/* Datos del estudiante */}
					<div className="border-t border-gray-100 pt-3">
						<div className="flex items-center gap-2 mb-3">
							<User size={14} className="text-gray-400" />
							<p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
								Datos del estudiante
							</p>
						</div>
						<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
							{[
								{
									label: 'Nombre',
									value:
										`${user.userSelected?.name ?? ''} ${user.userSelected?.last_name ?? ''}`.trim() ||
										'—',
								},
								{
									label: 'Correo',
									value: user.userSelected?.email || '—',
								},
								{
									label: 'Tipo',
									value:
										type_trip[course.courseStudent?.type_trip ?? 0] ||
										'—',
								},
								{
									label: 'Normativa',
									value:
										regulation[
											course.courseStudent?.regulation ?? 0
										] || '—',
								},
								{
									label: 'Licencia',
									value:
										license[course.courseStudent?.license ?? 0] ||
										'—',
								},
								{
									label: 'Teléfono',
									value: user.userSelected?.phone || '—',
								},
								{
									label: 'Identificación',
									value: user.userSelected?.doc_number
										? `${user.userSelected.user_doc_type?.symbol}-${user.userSelected.doc_number}`
										: '—',
								},
							].map((item) => (
								<div
									key={item.label}
									className="flex flex-col gap-0.5"
								>
									<span className="text-xs text-gray-400">
										{item.label}
									</span>
									<span className="text-xs font-medium text-gray-800 break-all">
										{item.value}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Sección de respuestas */}
				<div className="flex flex-col gap-3">
					<div className="flex items-center gap-2">
						<FileText size={15} className="text-gray-400" />
						<p className="text-sm font-medium text-gray-700">
							Respuestas ({questions?.length ?? 0} preguntas)
						</p>
					</div>

					{questions?.length ? (
						<div className="flex flex-col gap-2">
							{questions.map((question, index) => (
								<ReviewItemList
									key={`TQ-${index}`}
									index={index}
									editing={editing}
									setEditing={setEditing}
									question={question}
								/>
							))}
						</div>
					) : (
						<div className="border border-gray-100 rounded-xl p-8 text-center">
							<p className="text-sm text-gray-400">
								Sin preguntas registradas
							</p>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default ReviewTest;
