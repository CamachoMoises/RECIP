import { courseStudentTestQuestion } from '../../../types/utilities';
import { readSingleAnswer } from './exam/answerUtils';

/**
 * Opción única / Verdadero-Falso. Componente controlado: el valor viene de
 * `resp` y cada cambio sube como el `resp` serializado completo.
 */
const QuestionTypeRadio = ({
	questionTest,
	resp,
	onChange,
	disabled,
}: {
	questionTest: courseStudentTestQuestion;
	resp?: string;
	onChange: (resp: string) => void;
	disabled?: boolean;
}) => {
	const answers = questionTest.question?.answers ?? [];
	const answerIds = answers.map((answer) => answer.id);
	const selected = readSingleAnswer(resp, answerIds);

	return (
		<div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
			{answers.map((answer) => {
				const checked = selected === answer.id;
				return (
					<label
						key={answer.id}
						className={`flex min-w-[140px] flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
							checked
								? 'bg-sky-100 text-slate-900'
								: 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
						} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
					>
						<input
							type="radio"
							name={`exam-question-${questionTest.id}`}
							value={answer.id}
							checked={checked}
							disabled={disabled}
							onChange={() => onChange(String(answer.id))}
							className="h-4 w-4 shrink-0 accent-sky-600"
						/>
						<span className="leading-snug">{answer.value}</span>
					</label>
				);
			})}
		</div>
	);
};

export default QuestionTypeRadio;
