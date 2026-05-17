import { Switch, Typography } from '@material-tailwind/react';

interface BypassMaxTriesSwitchProps {
	checked: boolean;
	onChange: () => void;
}

const BypassMaxTriesSwitch = ({ checked, onChange }: BypassMaxTriesSwitchProps) => {
	return (
		<div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
			<div className="flex flex-col gap-1">
				<label htmlFor="Nombre" className="text-sx text-black">
					Bypass intentos maximos
				</label>
				<Switch
					className="h-full w-full checked:bg-[#134475]"
					containerProps={{
						className: 'w-11 h-6',
					}}
					circleProps={{
						className: 'before:hidden left-6 border-none',
					}}
					checked={checked}
					onChange={onChange}
					crossOrigin={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				/>
			</div>
			<Typography
				variant="small"
				className="text-xs text-gray-500"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Visible solo para superadmin
			</Typography>
		</div>
	);
};

export default BypassMaxTriesSwitch;