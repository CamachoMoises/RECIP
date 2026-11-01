import { course } from '../types/utilities';

/**
 * Eliminado ⇔ `status === false` (o 0).
 *
 * `deleted_at` / `deleted_by` son solo auditoría (quién y cuándo), no el
 * predicado, y se limpian al reactivar. Sequelize puede devolver el tinyint
 * como `0`, de ahí el `Number()`.
 */
export const isCourseDeleted = (course: course): boolean =>
	Number(course.status) === 0;
