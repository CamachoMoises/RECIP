export type ProgramCourse = {
	uses_sessions?: boolean;
	days?: number;
	sessions?: number;
};

export const usesSessions = (course?: ProgramCourse | null): boolean =>
	Boolean(course?.uses_sessions);

export const programSize = (course?: ProgramCourse | null): number => {
	if (!course) return 0;
	return usesSessions(course)
		? (course.sessions ?? course.days ?? 0)
		: (course.days ?? 0);
};

export const ordinalField = (
	course?: ProgramCourse | null,
): 'session_number' | 'day' => (usesSessions(course) ? 'session_number' : 'day');

export const ordinalNoun = (course?: ProgramCourse | null): string =>
	usesSessions(course) ? 'Sesión' : 'Día';

/**
 * El artículo varía con el género ("de la sesión" / "del día"), así que no se
 * puede componer con `ordinalNoun()` + `.toLowerCase()`.
 */
export const ordinalNounArticle = (course?: ProgramCourse | null): string =>
	usesSessions(course) ? 'de la sesión' : 'del día';

export const ordinalNounPlural = (course?: ProgramCourse | null): string =>
	usesSessions(course) ? 'Sesiones' : 'Días';

export const ordinalLabel = (
	course: ProgramCourse | null | undefined,
	n: number,
): string => `${ordinalNoun(course)} ${n}`;

export const programOrdinals = (course: ProgramCourse | null | undefined) =>
	Array.from({ length: programSize(course) }, (_, i) => ({
		id: i,
		name: ordinalLabel(course, i + 1),
	}));
