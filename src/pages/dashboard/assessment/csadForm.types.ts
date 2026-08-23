import {
	Control,
	FieldErrors,
	UseFormRegister,
} from 'react-hook-form';

export type CsadInputs = {
	airport: string;
	airstrip: string;
	elevation: number;
	meteorology: string;
	temperature: number;
	qnh: string;
	wind: string;
	weight: number;
	flaps: string;
	power: string;
	takeoff: number;
	landing: number;
	takeoff_day: number;
	takeoff_night: number;
	landing_day: number;
	landing_night: number;
	training_time: number;
	check_time: number;
	type: string;
	seat: string;
	comments: string;
	consent: boolean;
};

export type CsadFieldConfig = {
	name: Extract<keyof CsadInputs, string>;
	label: string;
	requiredMessage?: string;
	numericPattern?: boolean;
	valueAsNumber?: boolean;
	min?: number;
	step?: string;
	placeholder?: string;
};

export type CsadFormFieldProps = {
	register: UseFormRegister<CsadInputs>;
	errors: FieldErrors<CsadInputs>;
	control?: Control<CsadInputs>;
	isFormDisabled: boolean;
	lockedClass: string;
	lockedLabelClass: string;
};
