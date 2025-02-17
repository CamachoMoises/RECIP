import { useSelector } from "react-redux";
import { RootState } from "../store";

// type SpecificWordsTuple = ['super_user', 'staff', 'student', 'instructor'];
type SpecificWordsArray = ('super_user' | 'staff' | 'student' | 'instructor')[];


export const PermissionsValidate = (permissions: SpecificWordsArray, type: 'and' | 'or' = 'or') => {
    let validate = false;
    const auth = useSelector((state: RootState) => {
        return state.auth;
    });
    if (!auth.user) return false;
    if (!auth.user.is_active) return false;
    if (auth.user.is_superuser) return true;
    if (!permissions || permissions.length === 0) return true;
    permissions.forEach((permission) => {
        if (type === 'and' || validate === false) {
            switch (permission) {
                case 'super_user':
                    if (!auth.user?.is_superuser) {
                        return false
                    }
                    break;
                case 'staff':
                    validate = auth.user?.is_staff ? true : false;
                    break;
                case 'student':
                    validate = auth.user?.student ? true : false
                    break;
                case 'instructor':
                    validate = auth.user?.instructor ? true : false
                    break;
                default:
                    validate = false;
                    break;
            }
        }
    })

    return validate
}