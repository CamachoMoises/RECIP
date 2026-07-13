import { useSelector } from "react-redux";
import { RootState } from "../store";
import { user } from "../types/utilities";

type SpecificWordsArray = ('super_user' | 'staff' | 'student' | 'instructor')[];

function checkSinglePermission(user: user, permission: string): boolean {
	switch (permission) {
		case 'super_user':
			return user.is_superuser ?? false;
		case 'staff':
			return user.is_staff ?? false;
		case 'student':
			return user.student !== null && user.student !== undefined;
		case 'instructor':
			return user.instructor !== null && user.instructor !== undefined;
		default:
			return false;
	}
}

export const checkPermissions = (
	user: user | null | undefined,
	permissions: SpecificWordsArray,
	type: 'and' | 'or' = 'or'
): boolean => {
	if (!user) return false;
	if (!user.is_active) return false;
	if (user.is_superuser) return true;
	if (!permissions || permissions.length === 0) return true;

	if (type === 'and') {
		return permissions.every((p) => checkSinglePermission(user, p));
	}
	return permissions.some((p) => checkSinglePermission(user, p));
};

export const PermissionsValidate = (permissions: SpecificWordsArray, type: 'and' | 'or' = 'or') => {
	const auth = useSelector((state: RootState) => state.auth);
	return checkPermissions(auth.user ?? null, permissions, type);
}
