import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const ThemeInitializer = () => {
	const theme = useSelector((state: RootState) => state.theme);

	useEffect(() => {
		document.documentElement.setAttribute('data-theme', theme.mode);
	}, [theme.mode]);

	return null;
};

export default ThemeInitializer;