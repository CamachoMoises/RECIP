export const TYPE_LABELS: Record<number, string> = {
	1: 'Opción única',
	2: 'Opción múltiple',
	3: 'Verdadero / Falso',
	4: 'Completar',
	5: 'Desarrollo',
};

export const TYPE_BADGE_COLORS: Record<
	number,
	{ bg: string; text: string }
> = {
	1: { bg: '#E6F1FB', text: '#0C447C' },
	2: { bg: '#E6F1FB', text: '#0C447C' },
	3: { bg: '#EEEDFE', text: '#3C3489' },
	4: { bg: '#FAEEDA', text: '#633806' },
	5: { bg: '#FAEEDA', text: '#633806' },
};

export const RESULT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
	CORRECTA: { bg: '#EAF3DE', text: '#3B6D11', border: '#C0DD97' },
	PARCIAL: { bg: '#FAEEDA', text: '#854F0B', border: '#E5C08A' },
	INCORRECTA: { bg: '#FCEBEB', text: '#A32D2D', border: '#F7C1C1' },
	SIN_RESPUESTA: {
		bg: 'var(--color-background-secondary)',
		text: 'var(--color-text-secondary)',
		border: 'var(--color-border-tertiary)',
	},
};

export const typeLabel = (question_type_id?: number | null): string =>
	TYPE_LABELS[question_type_id ?? -1] ?? 'Desconocido';

export const typeBadgeColor = (
	question_type_id?: number | null,
): { bg: string; text: string } =>
	TYPE_BADGE_COLORS[question_type_id ?? -1] ?? TYPE_BADGE_COLORS[1];

export const resultColor = (result?: string | null) =>
	RESULT_COLORS[result ?? ''] ?? RESULT_COLORS.SIN_RESPUESTA;
