import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { toggleTheme } from '../features/themeSlice';

export const useTheme = () => {
	const dispatch = useDispatch();
	const theme = useSelector((state: RootState) => state.theme);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme.mode);
	}, [theme.mode]);

	const toggle = () => dispatch(toggleTheme());

	return { theme: theme.mode, toggle, isDark: theme.mode === 'dark' };
};