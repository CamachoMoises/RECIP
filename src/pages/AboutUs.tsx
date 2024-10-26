import { Button } from '@material-tailwind/react';
import { axiosGetDefault, axiosPostDefault } from '../services/axios';

const AboutUs = () => {
	const callUser = async () => {
		const req = await axiosGetDefault(
			`participant/3df50615-c33c-40c5-a435-6e99cc691f40`
		);
		console.log(req);
		const req2 = await axiosPostDefault('participant', {
			firstName: 'moises',
			lastName: 'stupid',
			docNumber: 22035536,
			email: 'moisescamacho26@gmail.com',
			phone: '04160894700',
			uuid: 'bbdfed6f-c953-4ff5-bd7b-e47197bfad04',
		});
		console.log(req2);
	};

	return (
		<>
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
