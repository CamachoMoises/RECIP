import { subject, subjectLesson } from '../types/utilities';

type Orderable = {
	order?: number | null;
	id?: number | null;
};

// `Number(null)` es 0: sin este guard, un `order`/`id` nulo se colaría al
// principio en vez de quedar al final.
const toOrderValue = (value?: number | null): number => {
	if (value === null || value === undefined) return Number.MAX_SAFE_INTEGER;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

const orderOf = (item: Orderable): number => toOrderValue(item.order);

const idOf = (item: Orderable): number => toOrderValue(item.id);

/**
 * Orden manual (`order` 1..N) y, a igual orden, por `id` para que el listado
 * sea estable entre llamadas. Nunca muta: devuelve una copia.
 */
export const compareByOrderThenId = (a: Orderable, b: Orderable): number =>
	orderOf(a) - orderOf(b) || idOf(a) - idOf(b);

export const sortSubjectLessons = (
	lessons?: subjectLesson[] | null,
): subjectLesson[] | undefined =>
	lessons ? [...lessons].sort(compareByOrderThenId) : undefined;

/**
 * Los endpoints de evaluación (`fetchSubjectAssessment`,
 * `fetchAssessmentData`) no ordenan en el backend: el `order` manual de
 * secciones y temas se aplica aquí, antes de guardar en Redux, para que la
 * grilla y el PDF compartan el mismo orden.
 */
export const sortAssessmentSubjects = (
	subjects?: subject[] | null,
): subject[] =>
	(subjects ?? [])
		.map((subjectItem) => ({
			...subjectItem,
			subject_lessons: sortSubjectLessons(subjectItem.subject_lessons),
		}))
		.sort(compareByOrderThenId);
