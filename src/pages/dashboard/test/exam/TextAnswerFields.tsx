import { courseStudentTestQuestion } from '../../../../types/utilities';
import { textSlots } from './answerUtils';

/**
 * Campos de texto numerados para preguntas de completar / desarrollo.
 *
 * Es un componente controlado: el valor vive en el estado del intento
 * (`ExamRunner`), no aquí. Así una sola cola guarda todo y no hay dos copias
 * de la misma respuesta que puedan desincronizarse.
 */
const TextAnswerFields = ({
	questionTest,
	values,
	onChange,
	disabled,
	multiline,
}: {
	questionTest: courseStudentTestQuestion;
	values: string[];
	onChange: (index: number, value: string) => void;
	disabled?: boolean;
	multiline?: boolean;
}) => {
	const slots = textSlots(questionTest);

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 10,
				marginTop: 4,
			}}
		>
			{Array.from({ length: slots }, (_, index) => (
				<label
					key={`slot-${questionTest.id}-${index}`}
					style={{
						display: 'flex',
						alignItems: multiline ? 'flex-start' : 'center',
						gap: 10,
					}}
				>
					<span
						style={{
							fontSize: 12,
							fontWeight: 500,
							color: '#475569',
							minWidth: 22,
							paddingTop: multiline ? 8 : 0,
							textAlign: 'right',
						}}
					>
						{index + 1}.
					</span>
					{multiline ? (
						<textarea
							rows={2}
							value={values[index] ?? ''}
							disabled={disabled}
							onChange={(event) => onChange(index, event.target.value)}
							placeholder="Escriba su respuesta"
							className="w-full rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:text-slate-500"
						/>
					) : (
						<input
							type="text"
							value={values[index] ?? ''}
							disabled={disabled}
							onChange={(event) => onChange(index, event.target.value)}
							placeholder="Respuesta"
							className="w-full rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:text-slate-500"
						/>
					)}
				</label>
			))}
		</div>
	);
};

export default TextAnswerFields;
