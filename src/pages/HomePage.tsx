import { Button } from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const HomePage = () => {
	const navigate = useNavigate();

	const handleContactClick = () => {
		navigate('/dashboard');
	};
	return (
		<>
			<SEO title="Inicio" url="/" />
			<div className="py-14">
			<Button
				onClick={handleContactClick}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Ir a Dashboard
			</Button>
		</div>
		</>);
};

export default HomePage;
