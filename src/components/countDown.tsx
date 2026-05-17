import { useEffect, useState } from 'react';
import moment from 'moment';

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
		const now = moment();
		let start = moment(
			now.format('YYYY-MM-DD') + ' ' + startTime,
			'YYYY-MM-DD HH:mm',
		);
		if (start.isBefore(now)) start = start.add(1, 'days');
		const end = start.clone().add(totalMinutes, 'minutes');
		setTimeLeft(Math.max(end.diff(now, 'seconds'), 0));

		const interval = setInterval(() => {
			const remaining = Math.max(end.diff(moment(), 'seconds'), 0);
			setTimeLeft(remaining);
			if (remaining <= 0) {
				setActive(false);
				clearInterval(interval);
			} else {
				setActive(true);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [setActive, startTime, totalMinutes]);

	const formatTime = (seconds: number) => {
		const h = Math.floor(seconds / 3600) % 24;
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;
		return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
	};

	const adjustedLeft = timeLeft > 86400 ? timeLeft - 86400 : timeLeft;
	const adjustedTotal =
		totalMinutes * 60 > 86400
			? totalMinutes * 60 - 86400
			: totalMinutes * 60;
	const progress = Math.min(
		(adjustedLeft / adjustedTotal) * 100,
		100,
	);
	const isWarning = progress < 25;

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 6,
			}}
		>
			<span
				style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}
			>
				Tiempo restante
			</span>
			<span
				style={{
					fontSize: 30,
					fontWeight: 500,
					fontVariantNumeric: 'tabular-nums',
					color: isWarning ? '#A32D2D' : '#0C447C',
					transition: 'color 0.3s',
				}}
			>
				{formatTime(timeLeft)}
			</span>
			<div
				style={{
					width: 130,
					height: 4,
					background: 'var(--color-background-secondary)',
					borderRadius: 999,
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						width: `${progress}%`,
						height: '100%',
						background: isWarning ? '#E24B4A' : '#378ADD',
						borderRadius: 999,
						transition: 'width 1s linear, background 0.3s',
					}}
				/>
			</div>
		</div>
	);
};

export default Countdown;
