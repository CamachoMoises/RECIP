import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import {
	AlertCircle,
	CheckCircle2,
	Loader2,
	RefreshCw,
	SaveAll,
} from 'lucide-react';
import Countdown from '../../../../components/countDown';
import { courseStudentTestQuestion } from '../../../../types/utilities';
import {
	AnswerMap,
	AnswerSyncState,
	isQuestionAnswered,
	questionTypeId,
} from './answerUtils';

/**
 * Distancia desde el borde superior hasta la barra. El navbar es `fixed` y
 * cambia de alto al hacer scroll (`scrolled` a partir de 80 px):
 *  - expandido: top 8px + logo 48px + padding 24px + borde ≈ 82px
 *  - compacto: top 4px + logo 32px + padding 16px + borde ≈ 54px
 * Se dejan 2-6px de aire para que la barra nunca quede tapada por el navbar.
 */
const BAR_TOP_EXPANDED = 84;
const BAR_TOP_COMPACT = 60;
const NAVBAR_SCROLL_THRESHOLD = 80;
const DESKTOP_QUERY = '(min-width: 1024px)';

const isDesktop = () =>
	typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches;

/**
 * Panel del examen: tiempo, progreso, estado de guardado, navegación entre
 * preguntas y el botón de finalizar.
 *
 * Responsive:
 *  - móvil/tablet (`< lg`): barra horizontal `sticky` sobre las preguntas, solo
 *    con tiempo, progreso, estado de guardado y Finalizar. La numeración de
 *    preguntas se oculta porque en pantallas estrechas no queda espacio.
 *  - desktop (`>= lg`): **columna vertical** fija a la derecha, junto a las
 *    preguntas, con la numeración siempre visible.
 *
 * Publica su alto real en `--exam-bar-offset` para que las tarjetas de
 * pregunta usen ese valor como `scroll-margin-top`. En desktop la barra está
 * al costado y no tapa la pregunta, así que solo se reserva el navbar.
 */
const ExamStatusBar = ({
	startTime,
	totalMinutes,
	setActive,
	answered,
	total,
	sync,
	onRetry,
	onFinish,
	ending,
	questions,
	answers,
	className = '',
}: {
	startTime: string;
	totalMinutes: number;
	setActive: React.Dispatch<React.SetStateAction<boolean>>;
	answered: number;
	total: number;
	sync: AnswerSyncState;
	onRetry: () => void;
	onFinish: () => void;
	ending: boolean;
	questions: courseStudentTestQuestion[];
	answers: AnswerMap;
	className?: string;
}) => {
	const [scrolled, setScrolled] = useState(
		() => typeof window !== 'undefined' && window.scrollY >= NAVBAR_SCROLL_THRESHOLD,
	);

	const rootRef = useRef<HTMLDivElement>(null);
	const top = scrolled ? BAR_TOP_COMPACT : BAR_TOP_EXPANDED;
	const topRef = useRef(top);
	topRef.current = top;

	useEffect(() => {
		const onScroll = () =>
			setScrolled(window.scrollY >= NAVBAR_SCROLL_THRESHOLD);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	const publishOffset = useCallback(() => {
		const node = rootRef.current;
		if (!node) return;
		const barHeight = isDesktop() ? 0 : node.offsetHeight;
		document.documentElement.style.setProperty(
			'--exam-bar-offset',
			`${topRef.current + barHeight + 12}px`,
		);
	}, []);

	useEffect(() => {
		publishOffset();
	}, [publishOffset, top]);

	useEffect(() => {
		const node = rootRef.current;
		if (!node || typeof ResizeObserver === 'undefined') return;
		const observer = new ResizeObserver(() => publishOffset());
		observer.observe(node);
		return () => observer.disconnect();
	}, [publishOffset]);

	useEffect(
		() => () => {
			document.documentElement.style.removeProperty('--exam-bar-offset');
		},
		[],
	);

	const percent = total > 0 ? Math.round((answered / total) * 100) : 0;

	const savedAt = useMemo(
		() => (sync.lastSavedAt ? moment(sync.lastSavedAt).format('hh:mm:ss') : null),
		[sync.lastSavedAt],
	);

	const scrollToQuestion = (questionId: number) => {
		document
			.getElementById(`exam-question-${questionId}`)
			?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	const renderSaveState = () => {
		if (sync.status === 'error') {
			return (
				<div className="flex items-center justify-center gap-2 rounded-lg bg-[#FCEBEB] px-2.5 py-1.5 text-xs text-[#A32D2D]">
					<AlertCircle size={14} className="shrink-0" />
					<span className="font-medium">
						{sync.pending > 0 ? (
							<>
								{sync.pending}
								<span className="hidden sm:inline">
									{' '}
									respuesta(s) sin guardar
								</span>
								<span className="sm:hidden"> sin guardar</span>
							</>
						) : (
							'No se pudo guardar'
						)}
					</span>
					<button
						onClick={onRetry}
						className="flex items-center gap-1 rounded-md bg-white/70 px-2 py-0.5 font-medium text-[#A32D2D] transition hover:bg-white"
					>
						<RefreshCw size={12} /> Reintentar
					</button>
				</div>
			);
		}

		if (sync.pending > 0) {
			return (
				<div className="flex items-center justify-center gap-2 rounded-lg bg-[#FAEEDA] px-2.5 py-1.5 text-xs text-[#854F0B]">
					<Loader2 size={14} className="shrink-0 animate-spin" />
					<span className="font-medium">
						Guardando {sync.pending}
						<span className="hidden sm:inline"> respuesta(s)</span>…
					</span>
				</div>
			);
		}

		if (sync.status === 'saved') {
			return (
				<div className="flex items-center justify-center gap-2 rounded-lg bg-[#EAF3DE] px-2.5 py-1.5 text-xs text-[#3B6D11]">
					<CheckCircle2 size={14} className="shrink-0" />
					<span className="font-medium">
						<span className="hidden sm:inline">
							Respuestas guardadas
						</span>
						<span className="sm:hidden">Guardadas</span>
						{savedAt ? ` · ${savedAt}` : ''}
					</span>
				</div>
			);
		}

		return (
			<div className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-500">
				<SaveAll size={14} className="shrink-0" />
				<span className="font-medium">Sin cambios</span>
			</div>
		);
	};

	return (
		<div
			ref={rootRef}
			className={`sticky z-30 rounded-2xl bg-white/95 shadow-[0_2px_16px_rgba(15,23,42,0.08)] backdrop-blur transition-[top] duration-300 lg:flex lg:flex-col lg:p-3 ${className}`}
			style={{ top }}
		>
			<div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 lg:flex-col lg:items-stretch lg:gap-3 lg:px-1 lg:py-1">
				<div className="flex items-center gap-3 sm:gap-4 lg:w-full lg:flex-col lg:gap-2">
					<Countdown
						startTime={startTime}
						totalMinutes={totalMinutes}
						setActive={setActive}
					/>
					<div className="hidden h-10 w-px bg-slate-200 sm:block lg:hidden" />
					<div className="flex min-w-[88px] flex-col gap-1 sm:min-w-[150px] lg:w-full lg:min-w-0">
						<span className="text-[11px] text-slate-500 lg:text-center">
							<span className="hidden sm:inline">
								{answered} de {total} respondidas
							</span>
							<span className="sm:hidden">
								{answered}/{total} respondidas
							</span>
						</span>
						<div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
							<div
								className="h-full rounded-full transition-all"
								style={{
									width: `${percent}%`,
									background:
										percent === 100 ? '#639922' : '#378ADD',
								}}
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2 lg:w-full lg:flex-col lg:items-stretch">
					{renderSaveState()}
					<button
						onClick={onFinish}
						disabled={ending}
						className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white transition sm:px-3.5 lg:w-full ${
							ending
								? 'cursor-not-allowed bg-slate-400'
								: 'bg-[#A32D2D] hover:bg-[#8c2626]'
						}`}
					>
						{ending ? (
							<Loader2 size={16} className="animate-spin" />
						) : (
							<SaveAll size={16} />
						)}
						<span className="hidden sm:inline">
							{ending ? 'Finalizando…' : 'Finalizar examen'}
						</span>
						<span className="sm:hidden">
							{ending ? 'Finalizando…' : 'Finalizar'}
						</span>
					</button>
				</div>
			</div>

			{/* Numeración de preguntas: solo en desktop, dentro del panel
			    vertical. En móvil se oculta para dejar espacio al examen. */}
			<div className="hidden px-3 py-1.5 lg:mt-2 lg:block lg:px-1 lg:pb-0 lg:pt-0">
				<p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
					Preguntas
				</p>

				<div className="flex max-h-[45vh] flex-wrap gap-1.5 overflow-y-auto pb-1">
					{questions.map((questionTest, index) => {
						const isAnswered = isQuestionAnswered(
							questionTypeId(questionTest),
							answers[questionTest.id],
							questionTest,
						);
						return (
							<button
								key={`nav-${questionTest.id}`}
								onClick={() => scrollToQuestion(questionTest.id)}
								title={`Ir a la pregunta ${index + 1}`}
								className={`h-7 w-7 rounded-md text-[11px] font-medium transition ${
									isAnswered
										? 'bg-[#EAF3DE] text-[#3B6D11] hover:bg-[#dcecc5]'
										: 'bg-slate-100 text-slate-500 hover:bg-slate-200'
								}`}
							>
								{index + 1}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default ExamStatusBar;
