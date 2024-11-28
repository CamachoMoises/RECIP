import { useState } from 'react';
import Countdown from '../../../../components/countDown';

const NewTest = () => {
	const [testActive, setTestActive] = useState<boolean>(false);
	return (
		<>
			<Countdown
				startTime="13:00"
				totalMinutes={120}
				setActive={setTestActive}
			/>
		</>
	);
};

export default NewTest;
