import {
	Input,
	Option,
	Select,
	Typography,
} from '@material-tailwind/react';
import {
	Control,
	Controller,
	UseFormRegister,
} from 'react-hook-form';
import { CsadFieldConfig, CsadInputs } from './csadForm.types';
import { proficiencyLabel } from './csadForm.utils';

const countFields = (prefix: 'takeoff' | 'landing'): CsadFieldConfig[] => [
	{ name: prefix, label: 'Total' },
	{
		name: `${prefix}_day`,
		label: 'Diurnos',
		valueAsNumber: true,
		min: 0,
	},
	{
		name: `${prefix}_night`,
		label: 'Nocturnos',
		valueAsNumber: true,
		min: 0,
	},
];

const TIME_FIELDS: CsadFieldConfig[] = [
	{
		name: 'training_time',
		label: 'Entrenamiento (horas)',
		valueAsNumber: true,
		min: 0,
		step: '0.01',
	},
	{
		name: 'check_time',
		label: 'Chequeo (horas)',
		valueAsNumber: true,
		min: 0,
		step: '0.01',
	},
];

type Props = {
	register: UseFormRegister<CsadInputs>;
	control: Control<CsadInputs>;
	isFormDisabled: boolean;
	lockedClass: string;
	lockedLabelClass: string;
	courseScoreAverage: number | null | undefined;
};

const CardSection = ({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) => (
	<div className="rounded-lg border border-blue-gray-200 bg-white p-4">
		<Typography
			variant="small"
			className="font-bold text-blue-gray-600 mb-3"
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			{title}
		</Typography>
		{children}
	</div>
);

const CsadOperationsSection = ({
	register,
	control,
	isFormDisabled,
	lockedClass,
	lockedLabelClass,
	courseScoreAverage,
}: Props) => {
	return (
		<>
			<div className="flex flex-col sm:flex-row gap-4 my-4">
				<div className="flex-1 rounded-lg border border-blue-gray-200 bg-white p-4">
					<Typography
						variant="small"
						className="font-bold text-blue-gray-600 mb-1"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Promedio del curso
					</Typography>
					<Typography
						variant="h6"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						{courseScoreAverage != null
							? `${courseScoreAverage} (${proficiencyLabel(
									courseScoreAverage,
								)})`
							: '—'}
					</Typography>
				</div>
			</div>
			<div className="grid grid-cols-1 gap-6 my-6">
				<CardSection title="Despegues">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						{countFields('takeoff').map((field) => (
							<Input
								key={field.name}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="number"
								label={field.label}
								placeholder={field.label}
								min={field.min}
								maxLength={20}
								className={`${lockedClass} rounded-md p-2 w-full block text-slate-900`}
								crossOrigin={undefined}
								shrink={isFormDisabled}
								labelProps={{ className: lockedLabelClass }}
								{...register(
									field.name,
									field.valueAsNumber
										? { valueAsNumber: true }
										: {},
								)}
							/>
						))}
					</div>
				</CardSection>
				<CardSection title="Aterrizajes">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
						{countFields('landing').map((field) => (
							<Input
								key={field.name}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="number"
								label={field.label}
								placeholder={field.label}
								min={field.min}
								maxLength={20}
								className={`${lockedClass} rounded-md p-2 w-full block text-slate-900`}
								crossOrigin={undefined}
								shrink={isFormDisabled}
								labelProps={{ className: lockedLabelClass }}
								{...register(
									field.name,
									field.valueAsNumber
										? { valueAsNumber: true }
										: {},
								)}
							/>
						))}
					</div>
				</CardSection>
				<CardSection title="Tipo">
					<Controller
						name="type"
						control={control}
						render={({ field }) => (
							<Select
								label={
									isFormDisabled ? undefined : 'Tipo'
								}
								placeholder="Tipo"
								value={field.value ?? ''}
								onChange={(value) => field.onChange(value)}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<Option value="entrenamiento">
									Entrenamiento
								</Option>
								<Option value="reentrenamiento">
									Reentrenamiento
								</Option>
								<Option value="chequeo">Chequeo</Option>
								<Option value="re-chequeo">Re-chequeo</Option>
								<Option value="experiencia_reciente">
									Experiencia reciente
								</Option>
							</Select>
						)}
					/>
					{isFormDisabled && (
						<Typography
							variant="small"
							className="text-blue-gray-600"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Tipo
						</Typography>
					)}
				</CardSection>
				<CardSection title="Tiempos de vuelo">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{TIME_FIELDS.map((field) => (
							<Input
								key={field.name}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								type="number"
								label={field.label}
								min={field.min}
								step={field.step}
								className={`${lockedClass} rounded-md p-2 w-full block text-slate-900`}
								crossOrigin={undefined}
								shrink={isFormDisabled}
								labelProps={{ className: lockedLabelClass }}
								{...register(field.name, {
									valueAsNumber: true,
								})}
							/>
						))}
					</div>
				</CardSection>
			</div>
		</>
	);
};

export default CsadOperationsSection;
