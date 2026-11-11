import {
	courseStudentTestAnswer,
	courseStudentTestQuestion,
} from '../../../../types/utilities';
import { store } from '../../../../store';

/**
 * Utilidades de respuesta del intento de examen.
 *
 * El formato que viaja al backend (`course_student_test_answer.resp`) es un
 * string y depende del tipo de pregunta:
 *  - 1 / 3 (única, V/F): id de la respuesta, p. ej. "12"
 *  - 2 (múltiple):       JSON `[{ id, check }]`
 *  - 4 / 5 (completar):  JSON `["valor1", "valor2", ...]`
 *
 * Todo el parseo es defensivo: un `resp` corrupto en la base no debe romper la
 * pantalla del examen (antes un JSON inválido lanzaba y dejaba la página en
 * blanco, perdiendo el intento).
 */

export type AnswerMap = Record<number, string>;

export type AnswerSyncStatus = 'idle' | 'saving' | 'saved' | 'error';

export type AnswerSyncState = {
	pending: number;
	status: AnswerSyncStatus;
	error: string | null;
	lastSavedAt: number | null;
};

const DRAFT_PREFIX = 'recip:exam-draft:v1';

export const questionTypeId = (
	q: courseStudentTestQuestion,
): number | undefined =>
	q.question?.question_type?.id ?? q.question?.question_type_id;

export const answerCount = (q: courseStudentTestQuestion): number =>
	q.question?.answers?.length ?? 0;

/**
 * Cantidad de campos de texto a renderizar. Una pregunta de completar sin
 * respuestas configuradas igual debe mostrar un campo: si no, no habría forma
 * de responderla.
 */
export const textSlots = (q: courseStudentTestQuestion): number =>
	Math.max(answerCount(q), 1);

export function safeParseJson<T>(raw: string | null | undefined, fallback: T): T {
	if (raw === null || raw === undefined || raw === '') return fallback;
	try {
		const parsed = JSON.parse(raw);
		return (parsed === null || parsed === undefined
			? fallback
			: parsed) as T;
	} catch {
		return fallback;
	}
}

/* ------------------------------------------------------------------ */
/* Lectura / escritura por tipo de pregunta                            */
/* ------------------------------------------------------------------ */

/** Id de respuesta seleccionada para única / V-F, o null si no hay. */
export function readSingleAnswer(
	resp: string | undefined,
	answerIds: number[],
): number | null {
	const raw = safeParseJson<unknown>(resp, null);
	const id =
		typeof raw === 'number'
			? raw
			: typeof raw === 'string'
				? Number.parseInt(raw, 10)
				: Number.NaN;
	if (!Number.isFinite(id)) return null;
	return answerIds.includes(id) ? id : null;
}

/** Estado de cada checkbox, indexado por id de respuesta. */
export function readCheckAnswers(
	resp: string | undefined,
	answerIds: number[],
): Record<number, boolean> {
	const result: Record<number, boolean> = {};
	for (const id of answerIds) result[id] = false;

	const parsed = safeParseJson<unknown>(resp, []);
	if (!Array.isArray(parsed)) return result;

	for (const item of parsed) {
		if (!item || typeof item !== 'object') continue;
		const id = Number((item as { id?: unknown }).id);
		if (!Number.isFinite(id) || !(id in result)) continue;
		result[id] = Boolean((item as { check?: unknown }).check);
	}
	return result;
}

export function writeCheckAnswers(
	answerIds: number[],
	checked: Record<number, boolean>,
): string {
	return JSON.stringify(
		answerIds.map((id) => ({ id, check: Boolean(checked[id]) })),
	);
}

/** Valores de texto (completar / desarrollo), alineados a la cantidad de slots. */
export function readTextAnswers(
	resp: string | undefined,
	count: number,
): string[] {
	const parsed = safeParseJson<unknown>(resp, []);
	const values: unknown[] = Array.isArray(parsed) ? parsed : [];
	return Array.from({ length: count }, (_, index) => {
		const value = values[index];
		if (typeof value === 'string') return value;
		if (typeof value === 'number' || typeof value === 'boolean') {
			return String(value);
		}
		return '';
	});
}

export function writeTextAnswers(values: string[]): string {
	return JSON.stringify(values);
}

/** ¿La pregunta tiene una respuesta registrada? */
export function isQuestionAnswered(
	type: number | undefined,
	resp: string | undefined,
	q: courseStudentTestQuestion,
): boolean {
	const ids = (q.question?.answers ?? []).map((a) => a.id);
	switch (type) {
		case 1:
		case 3:
			return readSingleAnswer(resp, ids) !== null;
		case 2:
			return Object.values(readCheckAnswers(resp, ids)).some(Boolean);
		case 4:
		case 5:
			return readTextAnswers(resp, Math.max(ids.length, 1)).some(
				(value) => value.trim() !== '',
			);
		default:
			return false;
	}
}

export function countAnswered(
	questions: courseStudentTestQuestion[],
	answers: AnswerMap,
): number {
	return questions.reduce((total, q) => {
		return (
			total +
			(isQuestionAnswered(questionTypeId(q), answers[q.id], q) ? 1 : 0)
		);
	}, 0);
}

export function buildAnswerPayload(
	q: courseStudentTestQuestion,
	resp: string,
): courseStudentTestAnswer {
	return {
		course_student_test_id: q.course_student_test_id,
		course_student_test_question_id: q.id,
		course_student_id: q.course_student_id,
		student_id: q.student_id,
		question_id: q.question_id,
		resp,
		test_id: q.test_id,
		course_id: q.course_id,
	};
}

/* ------------------------------------------------------------------ */
/* Borradores locales (respaldo ante caídas de red / recargas)         */
/* ------------------------------------------------------------------ */

type DraftRecord = Record<string, { resp: string; at: number }>;

const draftKey = (cstId: number) => `${DRAFT_PREFIX}:${cstId}`;

function readDraftRecord(cstId: number): DraftRecord {
	if (!Number.isFinite(cstId) || cstId <= 0) return {};
	try {
		const raw = window.localStorage.getItem(draftKey(cstId));
		const parsed = raw ? JSON.parse(raw) : null;
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch {
		return {};
	}
}

function writeDraftRecord(cstId: number, record: DraftRecord): void {
	if (!Number.isFinite(cstId) || cstId <= 0) return;
	try {
		window.localStorage.setItem(draftKey(cstId), JSON.stringify(record));
	} catch {
		// localStorage lleno o bloqueado (modo privado): el guardado en
		// servidor sigue funcionando, solo se pierde el respaldo local.
	}
}

export function saveDraft(cstId: number, questionId: number, resp: string): void {
	const record = readDraftRecord(cstId);
	record[String(questionId)] = { resp, at: Date.now() };
	writeDraftRecord(cstId, record);
}

export function removeDraft(cstId: number, questionId: number): void {
	const record = readDraftRecord(cstId);
	if (!(String(questionId) in record)) return;
	delete record[String(questionId)];
	writeDraftRecord(cstId, record);
}

export function clearDrafts(cstId: number): void {
	if (!Number.isFinite(cstId) || cstId <= 0) return;
	try {
		window.localStorage.removeItem(draftKey(cstId));
	} catch {
		// ignorar
	}
}

/**
 * Respuestas iniciales del intento: lo que ya está en el servidor y, encima,
 * los borradores locales (son la última intención del alumno). Si el borrador
 * coincide con el servidor, no cambia nada.
 */
export function buildInitialAnswers(
	cstId: number,
	questions: courseStudentTestQuestion[],
): AnswerMap {
	const answers: AnswerMap = {};
	for (const q of questions) {
		const saved = q.course_student_test_answer?.resp;
		if (typeof saved === 'string' && saved !== '') {
			answers[q.id] = saved;
		}
	}

	const drafts = readDraftRecord(cstId);
	for (const q of questions) {
		const draft = drafts[String(q.id)];
		if (draft && typeof draft.resp === 'string' && draft.resp !== '') {
			answers[q.id] = draft.resp;
		}
	}
	return answers;
}

/* ------------------------------------------------------------------ */
/* Sesión de la pestaña                                                */
/* ------------------------------------------------------------------ */

/**
 * Intentos finalizados en esta pestaña. Sirve para que el botón "atrás" del
 * navegador no vuelva a abrir un examen ya cerrado (la lista de intentos de
 * Redux no se refresca sola y seguiría diciendo `finished = false`).
 */
const finishedAttempts = new Set<number>();

export function markAttemptFinished(courseStudentTestId: number): void {
	finishedAttempts.add(courseStudentTestId);
}

export function isAttemptFinishedHere(courseStudentTestId: number): boolean {
	return finishedAttempts.has(courseStudentTestId);
}

/* ------------------------------------------------------------------ */
/* Guardado síncrono al abandonar la página                            */
/* ------------------------------------------------------------------ */

/**
 * Envía las respuestas pendientes con XHR síncrono. Se usa solo en `unload`,
 * donde las peticiones asíncronas se cancelan y el alumno perdería lo último
 * que escribió. Es idempotente en el backend (upsert por pregunta).
 */
export function flushAnswersSync(
	items: Array<{ question: courseStudentTestQuestion; resp: string }>,
): void {
	if (items.length === 0) return;
	const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
	const token = store.getState().auth.token;

	for (const item of items) {
		try {
			const xhr = new XMLHttpRequest();
			xhr.open('POST', `${apiUrl}/api/test/courseStudentTestAnswer`, false);
			xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
			if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
			xhr.send(
				JSON.stringify({
					courseStudentTestAnswer: buildAnswerPayload(
						item.question,
						item.resp,
					),
				}),
			);
		} catch {
			// Sin red no hay nada más que hacer aquí; el borrador local
			// permanece para la próxima carga.
		}
	}
}

/**
 * Finaliza el intento con XHR síncrono, para el caso de abandono de la página.
 * El backend ignora una finalización repetida, así que es seguro llamarlo
 * aunque el alumno ya haya finalizado.
 */
export function endCourseStudentTestSync(courseStudentTestId: number): void {
	if (!Number.isFinite(courseStudentTestId) || courseStudentTestId <= 0) return;
	const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
	const token = store.getState().auth.token;
	try {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', `${apiUrl}/api/test/courseStudentTestEnd`, false);
		xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
		if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
		xhr.send(
			JSON.stringify({
				course_student_test_id: courseStudentTestId,
			}),
		);
	} catch {
		// Sin red no hay nada que hacer aquí.
	}
}

export function describeError(error: unknown): string {
	const err = error as {
		response?: { data?: unknown; status?: number };
		message?: string;
	};
	const data = err?.response?.data;
	if (typeof data === 'string' && data.trim()) return data.trim();
	if (data && typeof data === 'object') {
		const body = data as { error?: unknown; message?: unknown };
		if (typeof body.error === 'string') return body.error;
		if (typeof body.message === 'string') return body.message;
	}
	if (err?.message) return err.message;
	return 'Error de conexión';
}
