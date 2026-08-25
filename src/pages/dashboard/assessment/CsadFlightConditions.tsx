import { Button, Input } from '@material-tailwind/react';
import { Save } from 'lucide-react';
import { CsadFieldConfig, CsadFormFieldProps } from './csadForm.types';

const FIELD_CONFIG: CsadFieldConfig[] = [
	{
		name: 'airport',
		label: 'Aeropuerto',
		requiredMessage: 'El aeropuerto es requerido',
	},
	{
		name: 'airstrip',
		label: 'Pista',
		requiredMessage: 'La pista es requerida',
	},
	{
		name: 'elevation',
		label: 'Elevación',
		requiredMessage: 'La elevación es requerida',
		numericPattern: true,
	},
	{
		name: 'meteorology',
		label: 'Meteorología',
		requiredMessage: 'La meteorología es requerida',
	},
	{
		name: 'temperature',
		label: 'Temperatura',
		requiredMessage: 'La temperatura es requerida',
		numericPattern: true,
	},
	{
		name: 'qnh',
		label: 'QNH',
		requiredMessage: 'El QNH es requerido',
	},
	{
		name: 'wind',
		label: 'Viento',
		requiredMessage: 'El viento es requerido',
	},
	{
		name: 'weight',
		label: 'Peso',
		requiredMessage: 'El peso es requerido',
		numericPattern: true,
	},
	{
		name: 'flaps',
		label: 'Flaps',
		requiredMessage: 'Las flaps son requeridas',
	},
	{
		name: 'power',
		label: 'Potencia',
		requiredMessage: 'La potencia es requerida',
	},
	{
		name: 'seat',
		label: 'Puesto',
		requiredMessage: 'El puesto es requerido',
	},
];

const NUMERIC_PATTERN = '^\\d+(\\.\\d+)?$';

type Props = CsadFormFieldProps & {
	dayStarted: boolean;
	onSaveTopClick: () => void;
};

const CsadFlightConditions = ({
	register,
	errors,
	isFormDisabled,
	lockedClass,
	lockedLabelClass,
	dayStarted,
	onSaveTopClick,
}: Props) => {
	return (
		<>
			<div
				className={`grid grid-cols-4 gap-4 py-3 rounded-md ${
					dayStarted ? '' : 'bg-orange-100 p-2'
				}`}
			>
				{FIELD_CONFIG.map((field) => (
					<div key={field.name}>
						<Input
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							type="text"
							label={field.label}
							placeholder={field.label}
							maxLength={20}
							pattern={
								field.numericPattern ? NUMERIC_PATTERN : undefined
							}
							className={`${lockedClass} rounded-md p-2 w-full mb-2 block text-slate-900`}
							crossOrigin={undefined}
							shrink={isFormDisabled}
							labelProps={{ className: lockedLabelClass }}
							{...register(field.name, {
								required: {
									value: true,
									message: field.requiredMessage ?? '',
								},
							})}
							aria-invalid={
								errors[field.name] ? 'true' : 'false'
							}
						/>
						{errors[field.name] && (
							<span className="text-red-500">
								{errors[field.name]?.message}
							</span>
						)}
					</div>
				))}
			</div>
			{!dayStarted && (
				<div className="flex flex-row gap-2 mt-2">
					<Button
						variant="gradient"
						color="green"
						type="button"
						onClick={onSaveTopClick}
						title="Guardar datos del formulario superior"
						className="flex flex-row justify-center"
						placeholder={undefined}
					>
						<Save size={15} /> Guardar
					</Button>
				</div>
			)}
		</>
	);
};

export default CsadFlightConditions;
