import { HexColorPicker, HexColorInput } from 'react-colorful';

interface ColorPickerProps {
	value: string;
	onChange: (hex: string) => void;
	label?: string;
}

const ColorPicker = ({ value, onChange, label }: ColorPickerProps) => {
	return (
		<div className="flex flex-col gap-2">
			{label && <label className="text-sm font-medium">{label}</label>}
			<HexColorPicker color={value} onChange={onChange} />
			<HexColorInput
				color={value}
				onChange={onChange}
				prefixed
				className="bg-slate-400 rounded-md p-2 w-28 uppercase text-slate-900"
			/>
		</div>
	);
};

export default ColorPicker;
