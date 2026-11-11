import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { RootState } from '../../../store';
import LoadingPage from '../../../components/LoadingPage';
import ErrorPage from '../../../components/ErrorPage';
import PageTitle from '../../../components/PageTitle';
import { breadCrumbsItems } from '../../../types/utilities';
import ExamRunner from './exam/ExamRunner';
import { isAttemptFinishedHere } from './exam/answerUtils';

const breadCrumbs: breadCrumbsItems[] = [
	{
		name: 'Inicio',
		href: '/dashboard',
	},
	{
		name: 'Examenes',
		href: '/dashboard/test',
	},
];

// Parsea `date` y `hour` por separado con formatos explícitos. WebKit (iOS
// Safari/Chrome) es más estricto que Chrome desktop con formatos ambiguos, así
// que no se concatenan strings: se parsea cada parte y se combinan con `.set()`.
const parseScheduleMoment = (s: {
	date?: string | null;
	hour?: string | null;
}): moment.Moment | null => {
	if (!s.date) return null;
	const day = moment(s.date, ['YYYY-MM-DD', moment.ISO_8601], true);
	if (!day.isValid()) return null;
	const result = day.clone();
	if (s.hour) {
		const time = moment(s.hour, ['HH:mm:ss', 'HH:mm', moment.ISO_8601], true);
		if (time.isValid()) {
			result.set({
				hour: time.hour(),
				minute: time.minute(),
				second: time.second(),
			});
		}
	}
	return result;
};

/**
 * Pantalla de examen: solo resuelve el contexto (intento, examen, horario) y
 * aplica los guards. Todo el ciclo de vida del intento vive en `ExamRunner`.
 */
const NewTest = () => {
	const navigate = useNavigate();
	const location = useLocation();
	// `TestListItem` navega aquí con `{ resume: true }` cuando el alumno retoma
	// un intento reabierto por el administrador: ese intento ya está fuera de la
	// ventana de 2 h del horario, así que no se le expulsa.
	const isResume = Boolean(
		(location.state as { resume?: boolean } | null)?.resume,
	);

	const { course, test } = useSelector((state: RootState) => ({
		course: state.courses,
		test: state.tests,
	}));

	const courseStudentTest = test.courseStudentTestSelected;
	const testSelected = test.testSelected;

	const schedules = course.courseStudent?.schedules;

	// En cursos por días solo hay un schedule, pero en modo sesiones varias
	// sesiones pueden compartir fecha. Anclar en el primero haría que el examen
	// se cerrara al terminar la sesión 1: se toma el más reciente que ya empezó
	// y, si todos están por delante, el primero.
	const scheduleMoment = useMemo(() => {
		const moments = (schedules ?? [])
			.map((schedule) => parseScheduleMoment(schedule))
			.filter((m): m is moment.Moment => m !== null && m.isValid())
			.sort((a, b) => a.diff(b));

		if (moments.length === 0) return null;
		const started = moments.filter((m) => m.isSameOrBefore(moment()));
		return started.length ? started[started.length - 1] : moments[0];
	}, [schedules]);

	// Sin horario parseado no se puede validar la ventana de 2 h, pero el
	// examen debe seguir siendo rendible: se ancla en el momento actual.
	const startMoment = scheduleMoment ?? moment();
	const hoursFromStart = scheduleMoment
		? moment().diff(scheduleMoment, 'hours', true)
		: 0;
	const outsideWindow =
		scheduleMoment !== null &&
		!isResume &&
		(hoursFromStart < 0 || hoursFromStart > 2);

	const goToTestList = () => navigate('/dashboard/test', { replace: true });

	if (test.status === 'loading') return <LoadingPage />;
	if (test.status === 'failed') {
		return <ErrorPage error={test.error ? test.error : 'Indefinido'} />;
	}

	if (
		!course.courseStudent ||
		(schedules?.length ?? 0) === 0 ||
		!courseStudentTest ||
		!testSelected ||
		outsideWindow ||
		isAttemptFinishedHere(courseStudentTest.id)
	) {
		return <Navigate to="/dashboard/test" replace />;
	}

	const questions = courseStudentTest.course_student_test_questions ?? [];

	if (questions.length === 0) {
		return (
			<div className="container px-2 sm:px-4">
				<PageTitle
					title={`Examen de ${courseStudentTest.code} (${testSelected.code})`}
					breadCrumbs={breadCrumbs}
				/>
				<div className="mx-auto mt-8 max-w-lg rounded-xl bg-[#FAEEDA] p-6 text-center shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
					<div className="flex justify-center text-[#854F0B]">
						<AlertTriangle size={36} />
					</div>
					<p className="mt-3 text-base font-medium text-[#854F0B]">
						Este examen no tiene preguntas
					</p>
					<p className="mt-1 text-sm text-[#854F0B]/80">
						El intento se creó, pero el examen no tiene preguntas
						generadas. Avise al supervisor para que lo revise antes de
						volver a intentarlo.
					</p>
					<button
						onClick={goToTestList}
						className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/70 px-4 py-2 text-sm font-medium text-[#854F0B] transition hover:bg-white"
					>
						<ArrowLeft size={15} /> Volver al listado
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="container px-2 sm:px-4">
			<PageTitle
				title={`Examen de ${courseStudentTest.code} (${testSelected.code})`}
				breadCrumbs={breadCrumbs}
			/>
			<ExamRunner
				key={courseStudentTest.id}
				courseStudentTest={courseStudentTest}
				testSelected={testSelected}
				startMoment={startMoment}
				isResume={isResume}
				onExit={goToTestList}
			/>
		</div>
	);
};

export default NewTest;
