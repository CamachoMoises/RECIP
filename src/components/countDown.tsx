import { Typography } from '@material-tailwind/react';
import moment from 'moment';
import { useEffect, useState } from 'react';

const Countdown = ({
	startTime,
	totalMinutes,
	setActive,
}: {
	startTime: string;
	totalMinutes: number;
	setActive: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const [timeLeft, setTimeLeft] = useState(0);

	useEffect(() => {
		const start = moment(startTime, 'HH:mm');
		const end = start.clone().add(totalMinutes, 'minutes');
		const now = moment();
		const initialTimeLeft = Math.max(end.diff(now, 'seconds'), 0);
		setTimeLeft(initialTimeLeft);

		// Actualiza cada segundo
		const interval = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev > 0) {
					setActive(true);
				} else {
					setActive(false);
					clearInterval(interval);
				}

				return prev > 0 ? prev - 1 : 0;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [setActive, startTime, totalMinutes]);

	const calculateTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${secs
			.toString()
			.padStart(2, '0')}`;
	};

	const progress = (timeLeft / (totalMinutes * 60)) * 100;

	return (
		<div className=" mx-auto p-6 bg-white shadow-lg rounded-lg">
			<Typography
				variant="h5"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Tiempo disponible
			</Typography>
			<div className="flex items-center justify-center mb-4">
				<div className="text-4xl font-bold text-blue-600">
					{calculateTime(timeLeft)}
				</div>
			</div>
			<div className="w-full bg-gray-200 rounded-full h-4">
				<div
					className="bg-blue-500 h-4 rounded-full transition-all"
					style={{ width: `${progress}%` }}
				></div>
			</div>
			<p className="text-center text-sm text-gray-600 mt-2">
				Hora de inicio:{' '}
				<span className="font-semibold">{startTime}</span>
			</p>
		</div>
	);
};

export default Countdown;
