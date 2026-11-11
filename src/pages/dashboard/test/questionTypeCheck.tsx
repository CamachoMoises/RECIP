import { courseStudentTestQuestion } from '../../../types/utilities';
import { readCheckAnswers, writeCheckAnswers } from './exam/answerUtils';

/**
 * Selección múltiple. Controlado: los checks se derivan de `resp` y cada
 * cambio reescribe el arreglo `[{ id, check }]` completo.
 */
const QuestionTypeCheck = ({
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
	const checked = readCheckAnswers(resp, answerIds);

	return (
		<div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
			{answers.map((answer) => {
				const isChecked = checked[answer.id] ?? false;
				return (
					<label
						key={answer.id}
						className={`flex min-w-[140px] flex-1 cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
							isChecked
								? 'bg-sky-100 text-slate-900'
								: 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
						} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
					>
						<input
							type="checkbox"
							value={answer.id}
							checked={isChecked}
							disabled={disabled}
							onChange={(event) =>
								onChange(
									writeCheckAnswers(answerIds, {
										...checked,
										[answer.id]: event.target.checked,
									}),
								)
							}
							className="h-4 w-4 shrink-0 accent-sky-600"
						/>
						<span className="leading-snug">{answer.value}</span>
					</label>
				);
			})}
		</div>
	);
};

export default QuestionTypeCheck;
