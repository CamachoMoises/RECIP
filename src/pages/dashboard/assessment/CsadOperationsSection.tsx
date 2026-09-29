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
import { CsadFieldConfig, CsadInputs, course } from '../../../types/utilities';
import { ordinalNounArticle } from '../../../utils/programSize';
import { proficiencyLabel } from '../../../lib/utils';

/**
 * Rótulos de los contadores por sesión/día, alineados con la tabla RESUMEN del
 * PDF de evaluación. Los nombres de campo NO cambian (`takeoff*` / `landing*` en la
 * BD): solo se renombran las etiquetas visibles.
 */
const COUNT_LABELS: Record<
	'takeoff' | 'landing',
	{ total: string; day: string; night: string }
> = {
	takeoff: { total: 'Total', day: 'Diurnos', night: 'Nocturnos' },
	landing: { total: 'Total', day: 'Diurnos', night: 'Nocturnos' },
};

const countFields = (prefix: 'takeoff' | 'landing'): CsadFieldConfig[] => {
	const labels = COUNT_LABELS[prefix];
	return [
		{ name: prefix, label: labels.total },
		{
			name: `${prefix}_day`,
			label: labels.day,
			valueAsNumber: true,
			min: 0,
		},
		{
			name: `${prefix}_night`,
			label: labels.night,
			valueAsNumber: true,
			min: 0,
		},
	];
};

/**
 * Contadores de aterrizajes por tipo. Los nombres de campo (`landing_*`) son los
 * de la BD; solo cambia la etiqueta visible.
 */
const LANDING_TYPE_FIELDS: CsadFieldConfig[] = [
	{
		name: 'landing_precision',
		label: 'Precisión',
		valueAsNumber: true,
		min: 0,
	},
	{
		name: 'landing_non_precision',
		label: 'No precisión',
		valueAsNumber: true,
		min: 0,
	},
	{ name: 'landing_gps', label: 'GPS', valueAsNumber: true, min: 0 },
	{
		name: 'landing_circuit',
		label: 'Circuito',
		valueAsNumber: true,
		min: 0,
	},
	{ name: 'landing_visual', label: 'Visual', valueAsNumber: true, min: 0 },
];

const TIME_FIELDS: CsadFieldConfig[] = [
	{
		name: 'ifr_time',
		label: 'IFR (horas)',
		valueAsNumber: true,
		min: 0,
		step: '0.01',
	},
	{
		name: 'vfr_time',
		label: 'VFR (horas)',
		valueAsNumber: true,
		min: 0,
		step: '0.01',
	},
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
	programCourse?: course;
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
	programCourse,
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
						Promedio {ordinalNounArticle(programCourse)}
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
				<CardSection title="Aterrizajes por tipo">
					<div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
						{LANDING_TYPE_FIELDS.map((field) => (
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
