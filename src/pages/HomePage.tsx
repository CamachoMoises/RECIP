import { Button } from '@material-tailwind/react';

import { useNavigate } from 'react-router-dom';

const HomePage = () => {
	const navigate = useNavigate();

	const handleContactClick = () => {
		navigate('/contact');
	};
	return (
		<>
			<Button
				onClick={handleContactClick}
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Ir a Contacto
			</Button>
		</>
	);
};

export default HomePage;
