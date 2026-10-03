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

/**
 * El ordinal tiene que caber en el programa del curso (`days`, o `sessions`
 * cuando el curso es por sesiones).
 */
export const isWithinProgram = (
	course: ProgramCourse | null | undefined,
	n: number,
): boolean => {
	const size = programSize(course);
	// Sin programa conocido no se descarta nada: el filtro no debe ocultar todo.
	if (size <= 0) return true;
	return n >= 1 && n <= size;
};

export const programOrdinals = (course: ProgramCourse | null | undefined) =>
	Array.from({ length: programSize(course) }, (_, i) => ({
		id: i,
		name: ordinalLabel(course, i + 1),
	}));
