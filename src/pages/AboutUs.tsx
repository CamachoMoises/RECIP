import { Button } from '@material-tailwind/react';
import { axiosGetDefault, axiosPostDefault } from '../services/axios';
import SEO from '../components/SEO';

const AboutUs = () => {
	const callUser = async () => {
		await axiosGetDefault(
			`participant/3df50615-c33c-40c5-a435-6e99cc691f40`,
		);
		await axiosPostDefault('participant', {
			firstName: 'moises',
			lastName: 'stupid',
			docNumber: 22035536,
			email: 'moisescamacho26@gmail.com',
			phone: '04160894700',
			uuid: 'bbdfed6f-c953-4ff5-bd7b-e47197bfad04',
		});
	};

	return (
		<>
			<SEO title="Acerca de" description="Conoce más sobre R.E.C.I.P., el sistema de registro de evaluación, capacitación e instrucción del piloto." url="/about" />
			<Button
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				onClick={callUser}
			>
				OJO
			</Button>
		</>
	);
};

export default AboutUs;
