import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../store';
import { checkPermissions } from '../services/permissionsValidate';
import LoadingPage from './LoadingPage';

type SpecificWordsArray = ('super_user' | 'staff' | 'student' | 'instructor')[];

interface RouteGuardProps {
	children: React.ReactNode;
	roles?: SpecificWordsArray;
	type?: 'and' | 'or';
}

const RouteGuard = ({ children, roles, type = 'or' }: RouteGuardProps) => {
	const auth = useSelector((state: RootState) => state.auth);
	const location = useLocation();

	if (auth.status === 'loading') {
		return <LoadingPage />;
	}

	if (!auth.token || !auth.user) {
		return <Navigate to="/login" state={{ from: location }} replace />;
	}

	if (roles && roles.length > 0) {
		const hasPermission = checkPermissions(auth.user, roles, type);
		if (!hasPermission) {
			return <Navigate to="/dashboard" replace />;
		}
	}

	return <>{children}</>;
};

export default RouteGuard;
