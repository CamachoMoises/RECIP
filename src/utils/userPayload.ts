import { user } from '../types/utilities';

/**
 * Campos que acepta `PUT /api/users` (`updateUserSchema` en el backend).
 *
 * El GET de usuarios devuelve el usuario con includes (`user_doc_type`,
 * `student`, `instructor`) y el hash de `password`; reenviarlos en el PUT hacía
 * que Joi rechazara el request y, tras el `stripUnknown`, que se rehasheara el
 * hash. Por eso el payload se arma explícitamente y la contraseña solo viaja
 * cuando el formulario trae una nueva.
 */
export type userUpdatePayload = {
	uuid: string | null;
	id: number | null;
	name: string;
	last_name: string;
	doc_number: number;
	email: string;
	phone: string;
	flag: string;
	rank: string | null;
	is_active: boolean;
	is_staff: boolean;
	is_superuser: boolean;
	country_name?: string;
	user_doc_type_id?: number;
	password?: string;
};

export const buildUserUpdatePayload = (
	userData: user,
	newPassword?: string,
): userUpdatePayload => {
	const payload: userUpdatePayload = {
		uuid: userData.uuid,
		id: userData.id,
		name: userData.name,
		last_name: userData.last_name,
		doc_number: userData.doc_number,
		email: userData.email,
		phone: userData.phone,
		// El schema no admite `null` en `flag`; `''` sí es válido.
		flag: userData.flag ?? '',
		rank: userData.rank ?? null,
		is_active: userData.is_active,
		is_staff: userData.is_staff,
		is_superuser: userData.is_superuser,
	};

	// Opcionales: se omiten si no vienen para no borrar el valor guardado.
	if (userData.country_name) {
		payload.country_name = userData.country_name;
	}
	if (userData.user_doc_type_id !== undefined) {
		payload.user_doc_type_id = userData.user_doc_type_id;
	}

	// Solo una contraseña nueva. El hash del GET y el `''` del formulario de
	// edición se descartan.
	if (newPassword) {
		payload.password = newPassword;
	}

	return payload;
};
