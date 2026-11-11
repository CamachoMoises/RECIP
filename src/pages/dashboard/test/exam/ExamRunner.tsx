import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import toast from 'react-hot-toast';
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
} from '@material-tailwind/react';
import {
	AlertTriangle,
	CheckCircle,
	Clock,
	FileText,
	Loader2,
	RefreshCw,
	XCircle,
} from 'lucide-react';
import {
	courseStudentTest,
	test as testModel,
} from '../../../../types/utilities';
import { axiosPostDefault } from '../../../../services/axios';
import { useTheme } from '../../../../hooks/useTheme';
import ExamQuestionCard from './ExamQuestionCard';
import ExamStatusBar from './ExamStatusBar';
import { useExamAnswers } from './useExamAnswers';
import {
	clearDrafts,
	countAnswered,
	describeError,
	endCourseStudentTestSync,
	flushAnswersSync,
	markAttemptFinished,
} from './answerUtils';

type FinishReason = 'manual' | 'timeout' | 'abandon';

type ExamResult = {
	score: number;
	reason: FinishReason;
};

/**
 * Intento de examen en curso.
 *
 * Es el único dueño de las respuestas: los componentes de pregunta son
 * controlados y `useExamAnswers` se encarga de guardarlas en el servidor.
 * Aquí viven el temporizador, el cierre del intento y el diálogo de resultado.
 */
const ExamRunner = ({
	courseStudentTest,
	testSelected,
	startMoment,
	isResume,
	onExit,
}: {
	courseStudentTest: courseStudentTest;
	testSelected: testModel;
	startMoment: moment.Moment;
	isResume: boolean;
	onExit: () => void;
}) => {
	const { theme } = useTheme();

	const questions = useMemo(
		() => courseStudentTest.course_student_test_questions ?? [],
		[courseStudentTest.course_student_test_questions],
	);

	const [ended, setEnded] = useState(false);
	const [active, setActive] = useState(true);
	const [isEnding, setIsEnding] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [blockedOpen, setBlockedOpen] = useState(false);
	// Motivo del intento de cierre que quedó bloqueado por respuestas sin
	// guardar: si el tiempo ya se agotó no tiene sentido ofrecer "seguir
	// respondiendo".
	const [blockedReason, setBlockedReason] = useState<FinishReason>('manual');
	const [result, setResult] = useState<ExamResult | null>(null);
	const [endError, setEndError] = useState<string | null>(null);

	const endedRef = useRef(false);
	const isEndingRef = useRef(false);

	const { answers, setAnswer, sync, retry, flush, getPendingAnswers } =
		useExamAnswers(courseStudentTest.id, questions, !ended);

	const answered = useMemo(
		() => countAnswered(questions, answers),
		[questions, answers],
	);

	const totalPoints = useMemo(
		() =>
			(testSelected.test_question_types ?? []).reduce(
				(total, item) => total + (item.amount ?? 0) * (item.value ?? 0),
				0,
			),
		[testSelected.test_question_types],
	);

	const duration = testSelected.duration ?? 0;
	const minScore = testSelected.min_score ?? 0;
	const endMoment = useMemo(
		() => startMoment.clone().add(duration, 'minutes'),
		[startMoment, duration],
	);

	// El temporizador marca `active = false` cuando se agota el tiempo; a partir
	// de ahí el intento ya no se puede seguir respondiendo.
	const timeUp = !active || blockedReason === 'timeout';

	// El examen siempre se rinde en tema claro: es una pantalla de evaluación,
	// no de navegación, y así se evita el contraste bajo del tema oscuro.
	const themeRef = useRef(theme);
	themeRef.current = theme;

	useEffect(() => {
		if (theme !== 'light') {
			document.documentElement.setAttribute('data-theme', 'light');
		}
	}, [theme]);

	// Al salir se devuelve el tema que el alumno tenga configurado.
	useEffect(
		() => () => {
			document.documentElement.setAttribute('data-theme', themeRef.current);
		},
		[],
	);

	/**
	 * Cierra el intento. Antes de pedir la nota se vacía la cola de guardado:
	 * el backend evalúa lo que hay en la base, así que finalizar con respuestas
	 * en vuelo calificaría un examen incompleto.
	 */
	const finish = useCallback(
		async (options?: { force?: boolean; reason?: FinishReason }) => {
			const { force = false, reason = 'manual' } = options ?? {};
			if (isEndingRef.current || endedRef.current) return;

			isEndingRef.current = true;
			setIsEnding(true);
			setConfirmOpen(false);

			try {
				if (!force) {
					const saved = await flush(3);
					if (!saved) {
						// Mejor no finalizar que calificar sin las últimas
						// respuestas: se ofrece reintentar o forzar.
						setBlockedReason(reason);
						setBlockedOpen(true);
						return;
					}
				}

				const response = await axiosPostDefault(
					'api/test/courseStudentTestEnd',
					{ course_student_test_id: courseStudentTest.id },
				);
				const rawScore = Number(
					(response as { score?: unknown } | null)?.score,
				);

				// Un borrador solo se descarta cuando todo llegó al servidor. Si
				// el alumno forzó el cierre con respuestas pendientes, se
				// conservan: si el intento se reabre, vuelven a cargarse.
				if (getPendingAnswers().length === 0) {
					clearDrafts(courseStudentTest.id);
				}
				markAttemptFinished(courseStudentTest.id);
				endedRef.current = true;
				setEndError(null);
				setResult({
					score: Number.isFinite(rawScore) ? rawScore : 0,
					reason,
				});
				setEnded(true);
			} catch (error) {
				const message = describeError(error);
				setEndError(message);
				toast.error(message);
			} finally {
				isEndingRef.current = false;
				setIsEnding(false);
			}
		},
		[flush, courseStudentTest.id, getPendingAnswers],
	);

	const finishRef = useRef(finish);
	useEffect(() => {
		finishRef.current = finish;
	}, [finish]);

	// Se acabó el tiempo: se cierra el intento sin preguntar.
	useEffect(() => {
		if (active) return;
		toast('Se terminó el tiempo del examen. Finalizando…', {
			icon: '⏰',
			id: 'timeout',
		});
		void finishRef.current({ reason: 'timeout' });
	}, [active]);

	// Salida de la página: se avisa, se guardan las respuestas pendientes y se
	// finaliza el intento. Es el comportamiento histórico del módulo.
	useEffect(() => {
		const cstId = courseStudentTest.id;

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (endedRef.current) return;
			event.preventDefault();
			event.returnValue = '¿Desea finalizar el examen?';
			return event.returnValue;
		};

		const handleUnload = () => {
			if (endedRef.current) return;
			const pending = getPendingAnswers();
			if (pending.length > 0) flushAnswersSync(pending);
			endCourseStudentTestSync(cstId);
		};

		const handlePopState = () => {
			if (endedRef.current) return;
			const confirmLeave = window.confirm(
				'¿Desea finalizar el examen? Al confirmar, su examen se finalizará.',
			);
			if (!confirmLeave) {
				window.history.pushState(null, '', window.location.href);
				return;
			}
			void finishRef.current({ reason: 'abandon' });
		};

		window.history.pushState(null, '', window.location.href);
		window.addEventListener('beforeunload', handleBeforeUnload);
		window.addEventListener('unload', handleUnload);
		window.addEventListener('popstate', handlePopState);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			window.removeEventListener('unload', handleUnload);
			window.removeEventListener('popstate', handlePopState);
		};
	}, [courseStudentTest.id, getPendingAnswers]);

	/* ------------------------------ Resultado ----------------------------- */

	if (ended) {
		const score = result?.score ?? 0;
		const approved = score >= minScore;
		const scorePercent =
			totalPoints > 0
				? Math.min((score / totalPoints) * 100, 100)
				: 0;

		return (
			<>
				<div className="mx-auto my-10 max-w-md rounded-xl bg-white p-6 text-center shadow-[0_2px_16px_rgba(15,23,42,0.08)]">
					<p className="text-base font-medium text-slate-900">
						Examen finalizado
					</p>
					<p className="mt-1 text-sm text-slate-500">
						Su intento quedó registrado. Ya puede cerrar esta pantalla.
					</p>
					<button
						onClick={onExit}
						className="mt-4 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
					>
						Volver al listado de exámenes
					</button>
				</div>

				<Dialog
					open={true}
					handler={() => undefined}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					size="sm"
				>
					<DialogHeader
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						className="p-0"
					>
						<div
							style={{
								width: '100%',
								padding: '28px 24px',
								background: approved ? '#EAF3DE' : '#FCEBEB',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: 8,
								borderRadius: '12px 12px 0 0',
							}}
						>
							{approved ? (
								<CheckCircle size={52} color="#3B6D11" />
							) : (
								<XCircle size={52} color="#A32D2D" />
							)}
							<p
								style={{
									fontSize: 22,
									fontWeight: 500,
									margin: 0,
									color: approved ? '#27500A' : '#791F1F',
								}}
							>
								{approved ? '¡Aprobado!' : 'Reprobado'}
							</p>
							<p
								style={{
									fontSize: 13,
									margin: 0,
									color: approved ? '#3B6D11' : '#A32D2D',
								}}
							>
								{approved
									? 'Examen finalizado exitosamente'
									: 'No alcanzaste el puntaje mínimo'}
							</p>
						</div>
					</DialogHeader>

					<DialogBody
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: 16,
							}}
						>
							<div className="flex items-stretch justify-center gap-2 text-center sm:gap-7">
								<div className="min-w-0">
									<p
										className="m-0 text-lg font-medium tabular-nums sm:text-3xl"
										style={{
											color: approved ? '#3B6D11' : '#A32D2D',
										}}
									>
										{Number(score.toFixed(2))}
									</p>
									<p className="m-0 text-[11px] text-slate-500">
										Puntaje
									</p>
								</div>
								<div className="w-px self-stretch bg-slate-200" />
								<div className="min-w-0">
									<p className="m-0 text-lg font-medium tabular-nums text-slate-600 sm:text-3xl">
										{minScore}
									</p>
									<p className="m-0 text-[11px] text-slate-500">
										Mínimo
									</p>
								</div>
								<div className="w-px self-stretch bg-slate-200" />
								<div className="min-w-0">
									<p className="m-0 text-lg font-medium tabular-nums text-slate-900 sm:text-3xl">
										{Number(totalPoints.toFixed(2))}
									</p>
									<p className="m-0 text-[11px] text-slate-500">
										Total
									</p>
								</div>
							</div>

							<div
								style={{
									width: '100%',
									background: '#E2E8F0',
									borderRadius: 999,
									height: 6,
									overflow: 'hidden',
								}}
							>
								<div
									style={{
										width: `${scorePercent}%`,
										height: '100%',
										background: approved ? '#639922' : '#E24B4A',
										borderRadius: 999,
									}}
								/>
							</div>
						</div>
					</DialogBody>

					<DialogFooter
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div
							style={{
								display: 'flex',
								gap: 8,
								width: '100%',
							}}
						>
							<button
								onClick={onExit}
								style={{
									flex: 1,
									padding: '8px 0',
									fontSize: 13,
									cursor: 'pointer',
									border: 'none',
									borderRadius: 8,
									background: '#F1F5F9',
									color: '#0F172A',
								}}
							>
								Volver al listado
							</button>
							{!approved && (
								<Button
									size="sm"
									variant="filled"
									color="cyan"
									onClick={onExit}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Repetir examen
								</Button>
							)}
						</div>
					</DialogFooter>
				</Dialog>
			</>
		);
	}

	/* ------------------------------- En curso ----------------------------- */

	return (
		<>
			{isResume && (
				<div className="mb-3 flex items-start gap-2 rounded-lg bg-[#FAEEDA] px-3 py-2 text-xs text-[#854F0B]">
					<RefreshCw size={14} className="mt-0.5 shrink-0" />
					<span>
						Este intento fue reabierto: sus respuestas anteriores están
						cargadas y el temporizador sigue el horario original del
						examen.
					</span>
				</div>
			)}

			{timeUp && (
				<div className="mb-3 flex items-start gap-2 rounded-lg bg-[#FCEBEB] px-3 py-2 text-xs text-[#A32D2D]">
					<Clock size={14} className="mt-0.5 shrink-0" />
					<span>
						El tiempo del examen terminó y las respuestas quedaron
						bloqueadas. El intento se está cerrando automáticamente; si
						no se cierra, use «Finalizar examen» para reintentarlo.
					</span>
				</div>
			)}

			{endError && (
				<div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#FCEBEB] px-3 py-2 text-xs text-[#A32D2D]">
					<div className="flex items-start gap-2">
						<AlertTriangle size={14} className="mt-0.5 shrink-0" />
						<span>
							No se pudo finalizar el examen: {endError}. Sus respuestas
							están guardadas; reintente el cierre.
						</span>
					</div>
					<button
						onClick={() => void finishRef.current({ reason: 'manual' })}
						disabled={isEnding}
						className="flex items-center gap-1 rounded-md bg-white/70 px-2 py-1 font-medium transition hover:bg-white disabled:opacity-50"
					>
						<RefreshCw size={12} /> Reintentar
					</button>
				</div>
			)}

			{/* Desktop: panel vertical fijo a la derecha + preguntas a la
			    izquierda. Móvil/tablet: barra horizontal sobre las preguntas. */}
			<div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
				<ExamStatusBar
					startTime={startMoment.format('HH:mm')}
					totalMinutes={duration}
					setActive={setActive}
					answered={answered}
					total={questions.length}
					sync={sync}
					onRetry={retry}
					onFinish={() => setConfirmOpen(true)}
					ending={isEnding}
					questions={questions}
					answers={answers}
					className="lg:order-2 lg:w-[272px] lg:shrink-0"
				/>

				<div className="min-w-0 lg:order-1 lg:flex-1">
					<div className="mb-3 grid grid-cols-2 gap-2 rounded-xl bg-white px-3 py-2.5 text-xs text-slate-600 shadow-[0_2px_16px_rgba(15,23,42,0.06)] sm:grid-cols-4">
						<span className="flex items-center gap-1.5">
							<Clock size={13} className="text-slate-400" />
							Inicio: <strong>{startMoment.format('hh:mm a')}</strong>
						</span>
						<span className="flex items-center gap-1.5">
							<Clock size={13} className="text-slate-400" />
							Fin: <strong>{endMoment.format('hh:mm a')}</strong>
						</span>
						<span className="flex items-center gap-1.5">
							<FileText size={13} className="text-slate-400" />
							Duración: <strong>{duration} min</strong>
						</span>
						<span className="flex items-center gap-1.5">
							<CheckCircle size={13} className="text-slate-400" />
							Mínimo: <strong>{minScore} pts</strong>
						</span>
					</div>

					<details className="mb-3 rounded-xl bg-white px-3 py-2 text-xs text-slate-600 shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
						<summary className="cursor-pointer font-medium text-slate-700">
							Instrucciones
						</summary>
						<ul className="mt-2 list-disc space-y-1 pl-5">
							<li>Lea cuidadosamente cada pregunta.</li>
							<li>
								Las respuestas se guardan automáticamente; el indicador de
								la barra superior muestra el estado del guardado.
							</li>
							<li>Consulte con el supervisor cualquier duda.</li>
							<li>El examen se realiza a libro cerrado.</li>
							<li>
								Al finalizar, verifique sus respuestas: ya no podrá
								modificarlas.
							</li>
							<li>
								El examen tiene una duración de {duration} minutos y la
								nota mínima aprobatoria es {minScore} puntos.
							</li>
						</ul>
					</details>

					<div className="flex flex-col gap-3">
						{questions.map((questionTest, index) => (
							<ExamQuestionCard
								key={questionTest.id}
								questionTest={questionTest}
								index={index}
								resp={answers[questionTest.id]}
								onChange={setAnswer}
								disabled={isEnding || !active}
							/>
						))}
					</div>

					<div className="mt-4 flex justify-end">
						<button
							onClick={() => setConfirmOpen(true)}
							disabled={isEnding}
							className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
								isEnding
									? 'cursor-not-allowed bg-slate-400'
									: 'bg-[#A32D2D] hover:bg-[#8c2626]'
							}`}
						>
							{isEnding ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								<FileText size={16} />
							)}
							{isEnding ? 'Finalizando…' : 'Finalizar examen'}
						</button>
					</div>
				</div>
			</div>

			{/* Confirmación previa a finalizar */}
			<Dialog
				open={confirmOpen}
				handler={() => setConfirmOpen(false)}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				size="sm"
			>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					¿Finalizar el examen?
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="flex flex-col gap-3 text-sm text-slate-600"
				>
					<p>
						Ha respondido <strong>{answered}</strong> de{' '}
						<strong>{questions.length}</strong> preguntas.
					</p>
					{answered < questions.length && (
						<div className="flex items-start gap-2 rounded-lg bg-[#FAEEDA] px-3 py-2 text-xs text-[#854F0B]">
							<AlertTriangle size={14} className="mt-0.5 shrink-0" />
							<span>
								Quedan {questions.length - answered} pregunta(s) sin
								responder y contarán como incorrectas.
							</span>
						</div>
					)}
					{sync.pending > 0 && (
						<div className="flex items-start gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600">
							<Loader2 size={14} className="mt-0.5 shrink-0 animate-spin" />
							<span>
								Hay {sync.pending} respuesta(s) pendientes de guardar; se
								guardarán antes de calcular la nota.
							</span>
						</div>
					)}
					<p className="text-xs text-slate-500">
						Una vez finalizado no podrá modificar sus respuestas.
					</p>
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="flex w-full justify-end gap-2">
						<button
							onClick={() => setConfirmOpen(false)}
							className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
						>
							Seguir respondiendo
						</button>
						<Button
							size="sm"
							color="red"
							onClick={() => void finish({ reason: 'manual' })}
							disabled={isEnding}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{isEnding ? 'Finalizando…' : 'Finalizar'}
						</Button>
					</div>
				</DialogFooter>
			</Dialog>

			{/* No se pudieron guardar todas las respuestas */}
			<Dialog
				open={blockedOpen}
				handler={() => setBlockedOpen(false)}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				size="sm"
			>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					No se pudieron guardar sus respuestas
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="flex flex-col gap-3 text-sm text-slate-600"
				>
					<div className="flex items-start gap-2 rounded-lg bg-[#FCEBEB] px-3 py-2 text-xs text-[#A32D2D]">
						<AlertTriangle size={14} className="mt-0.5 shrink-0" />
						<span>
							{sync.pending} respuesta(s) siguen sin guardar
							{sync.error ? `: ${sync.error}` : '.'} Se reintenta
							automáticamente, pero si finaliza ahora esas respuestas no
							contarán para la nota.
						</span>
					</div>
					<p className="text-xs text-slate-500">
						{timeUp
							? 'El tiempo del examen ya terminó. Reintente el guardado para cerrar el intento con todas sus respuestas.'
							: 'Revise su conexión y reintente. Si el problema persiste, avise al supervisor.'}
					</p>
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="flex w-full flex-wrap justify-end gap-2">
						{!timeUp && (
							<button
								onClick={() => setBlockedOpen(false)}
								className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
							>
								Seguir respondiendo
							</button>
						)}
						<button
							onClick={() => {
								setBlockedOpen(false);
								retry();
								void finish({ reason: 'manual' });
							}}
							disabled={isEnding}
							className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
						>
							<RefreshCw size={14} /> Reintentar
						</button>
						<button
							onClick={() => {
								setBlockedOpen(false);
								void finish({ force: true, reason: 'manual' });
							}}
							disabled={isEnding}
							className="rounded-lg bg-[#A32D2D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8c2626] disabled:opacity-50"
						>
							Finalizar de todos modos
						</button>
					</div>
				</DialogFooter>
			</Dialog>
		</>
	);
};

export default ExamRunner;
