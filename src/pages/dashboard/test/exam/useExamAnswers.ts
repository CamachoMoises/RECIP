import { useCallback, useEffect, useRef, useState } from 'react';
import { courseStudentTestQuestion } from '../../../../types/utilities';
import { axiosPostDefault } from '../../../../services/axios';
import {
	AnswerMap,
	AnswerSyncState,
	buildAnswerPayload,
	buildInitialAnswers,
	describeError,
	removeDraft,
	saveDraft,
} from './answerUtils';

/**
 * Cola de guardado de respuestas del intento.
 *
 * Reglas que sostienen la fiabilidad:
 *  - Cada cambio se refleja de inmediato en el estado local y en el borrador
 *    de `localStorage`, así que una recarga o un cierre no pierde nada.
 *  - Los envíos se agrupan con un pequeño debounce: escribir rápido no dispara
 *    una petición por pulsación.
 *  - Solo hay **una** petición en vuelo a la vez. El backend hace
 *    `findOne` + `create` (no es un upsert atómico), por lo que dos POST
 *    simultáneos de la misma pregunta pueden duplicar la fila.
 *  - Si un envío falla, la respuesta sigue pendiente y se reintenta con
 *    backoff exponencial; el alumno también puede reintentar a mano.
 *  - Un borrador solo se borra cuando el `resp` que se envió sigue siendo el
 *    vigente: si el alumno siguió escribiendo, el nuevo valor se conserva.
 */

const DEBOUNCE_MS = 500;
const MAX_BACKOFF_MS = 15000;
const HEARTBEAT_MS = 20000;

const sleep = (ms: number) =>
	new Promise<void>((resolve) => {
		window.setTimeout(resolve, ms);
	});

export type UseExamAnswersResult = {
	answers: AnswerMap;
	setAnswer: (questionId: number, resp: string) => void;
	sync: AnswerSyncState;
	retry: () => void;
	flush: (retries?: number) => Promise<boolean>;
	getPendingAnswers: () => Array<{
		question: courseStudentTestQuestion;
		resp: string;
	}>;
};

export function useExamAnswers(
	courseStudentTestId: number,
	questions: courseStudentTestQuestion[],
	enabled: boolean,
): UseExamAnswersResult {
	const [answers, setAnswers] = useState<AnswerMap>(() =>
		buildInitialAnswers(courseStudentTestId, questions),
	);
	const [sync, setSync] = useState<AnswerSyncState>({
		pending: 0,
		status: 'idle',
		error: null,
		lastSavedAt: null,
	});

	const questionsRef = useRef(questions);
	questionsRef.current = questions;

	const cstIdRef = useRef(courseStudentTestId);
	cstIdRef.current = courseStudentTestId;

	const enabledRef = useRef(enabled);
	enabledRef.current = enabled;

	// questionId -> último resp aún no confirmado por el servidor
	const pendingRef = useRef<Map<number, string>>(new Map());
	const inflightRef = useRef<Promise<void> | null>(null);
	const attemptsRef = useRef(0);
	const debounceRef = useRef<number | null>(null);
	const retryRef = useRef<number | null>(null);
	const mountedRef = useRef(true);
	const drainRef = useRef<() => Promise<void>>(async () => {});

	const clearTimers = useCallback(() => {
		if (debounceRef.current !== null) {
			window.clearTimeout(debounceRef.current);
			debounceRef.current = null;
		}
		if (retryRef.current !== null) {
			window.clearTimeout(retryRef.current);
			retryRef.current = null;
		}
	}, []);

	const publishSync = useCallback(
		(patch: Partial<AnswerSyncState>) => {
			if (!mountedRef.current) return;
			setSync((current) => ({
				...current,
				pending: pendingRef.current.size,
				...patch,
			}));
		},
		[],
	);

	/** Reintento con backoff: 2s, 4s, 8s, 15s, 15s… */
	const scheduleRetry = useCallback(() => {
		if (retryRef.current !== null) window.clearTimeout(retryRef.current);
		attemptsRef.current += 1;
		const delay = Math.min(
			2000 * Math.pow(2, attemptsRef.current - 1),
			MAX_BACKOFF_MS,
		);
		retryRef.current = window.setTimeout(() => {
			retryRef.current = null;
			void drainRef.current();
		}, delay);
	}, []);

	/**
	 * Vacía la cola de pendientes, de a una petición. Devuelve una promesa que
	 * resuelve cuando esta pasada termina (no cuando la cola queda vacía: si
	 * falla, la respuesta sigue pendiente a propósito).
	 */
	const drain = useCallback((): Promise<void> => {
		if (inflightRef.current) return inflightRef.current;
		if (!enabledRef.current) return Promise.resolve();
		if (pendingRef.current.size === 0) return Promise.resolve();

		const run = async () => {
			let failure: unknown = null;
			publishSync({ status: 'saving', error: null });

			while (pendingRef.current.size > 0) {
				const next = pendingRef.current.entries().next();
				if (next.done) break;
				const [questionId, resp] = next.value;

				const question = questionsRef.current.find(
					(q) => q.id === questionId,
				);
				if (!question) {
					// La pregunta ya no forma parte del intento: no hay nada que
					// guardar y dejarla pendiente bloquearía la cola para siempre.
					pendingRef.current.delete(questionId);
					continue;
				}

				try {
					await axiosPostDefault(
						'api/test/courseStudentTestAnswer',
						{ courseStudentTestAnswer: buildAnswerPayload(question, resp) },
					);
				} catch (error) {
					failure = error;
					break;
				}

				// Solo se descarta el pendiente si nadie lo reemplazó mientras
				// viajaba la petición.
				if (pendingRef.current.get(questionId) === resp) {
					pendingRef.current.delete(questionId);
					removeDraft(cstIdRef.current, questionId);
				}
				attemptsRef.current = 0;
				publishSync({
					status: pendingRef.current.size > 0 ? 'saving' : 'saved',
					lastSavedAt: Date.now(),
					error: null,
				});
			}

			if (failure) {
				publishSync({ status: 'error', error: describeError(failure) });
				scheduleRetry();
				return;
			}

			// Llegaron respuestas nuevas mientras se guardaba: otra pasada.
			if (pendingRef.current.size > 0) {
				debounceRef.current = window.setTimeout(() => {
					debounceRef.current = null;
					void drainRef.current();
				}, 0);
			}
		};

		const promise = run().finally(() => {
			inflightRef.current = null;
		});
		inflightRef.current = promise;
		return promise;
	}, [publishSync, scheduleRetry]);

	drainRef.current = drain;

	const setAnswer = useCallback(
		(questionId: number, resp: string) => {
			if (!enabledRef.current) return;

			setAnswers((current) => ({ ...current, [questionId]: resp }));
			saveDraft(cstIdRef.current, questionId, resp);

			pendingRef.current.set(questionId, resp);
			publishSync({ status: 'saving', error: null });

			if (retryRef.current !== null) {
				window.clearTimeout(retryRef.current);
				retryRef.current = null;
			}
			if (debounceRef.current !== null) {
				window.clearTimeout(debounceRef.current);
			}
			debounceRef.current = window.setTimeout(() => {
				debounceRef.current = null;
				void drainRef.current();
			}, DEBOUNCE_MS);
		},
		[publishSync],
	);

	const retry = useCallback(() => {
		attemptsRef.current = 0;
		clearTimers();
		void drainRef.current();
	}, [clearTimers]);

	/**
	 * Fuerza el vaciado de la cola y espera el resultado. Se usa antes de
	 * finalizar el examen: no se puede calcular la nota con respuestas que aún
	 * no llegaron al servidor.
	 */
	const flush = useCallback(
		async (retries = 2): Promise<boolean> => {
			for (let attempt = 0; attempt < Math.max(retries, 1); attempt++) {
				clearTimers();
				await drainRef.current();
				if (pendingRef.current.size === 0) return true;
				if (attempt < retries - 1) await sleep(500 * (attempt + 1));
			}
			return pendingRef.current.size === 0;
		},
		[clearTimers],
	);

	const getPendingAnswers = useCallback(() => {
		const items: Array<{ question: courseStudentTestQuestion; resp: string }> =
			[];
		pendingRef.current.forEach((resp, questionId) => {
			const question = questionsRef.current.find((q) => q.id === questionId);
			if (question) items.push({ question, resp });
		});
		return items;
	}, []);

	// Reintento al recuperar conexión y latido periódico mientras haya
	// pendientes (una caída de wifi no emite `online` si el equipo nunca se
	// enteró de que estaba desconectado).
	useEffect(() => {
		const handleOnline = () => {
			if (pendingRef.current.size === 0) return;
			attemptsRef.current = 0;
			void drainRef.current();
		};
		const handleVisible = () => {
			if (document.visibilityState === 'visible') handleOnline();
		};

		window.addEventListener('online', handleOnline);
		document.addEventListener('visibilitychange', handleVisible);
		const heartbeat = window.setInterval(() => {
			if (pendingRef.current.size > 0) handleOnline();
		}, HEARTBEAT_MS);

		return () => {
			window.removeEventListener('online', handleOnline);
			document.removeEventListener('visibilitychange', handleVisible);
			window.clearInterval(heartbeat);
		};
	}, []);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			clearTimers();
		};
	}, [clearTimers]);

	return { answers, setAnswer, sync, retry, flush, getPendingAnswers };
}
