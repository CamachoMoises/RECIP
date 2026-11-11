import { memo } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { courseStudentTestQuestion } from '../../../../types/utilities';
import QuestionTypeRadio from '../questionTypeRadio';
import QuestionTypeCheck from '../questionTypeCheck';
import QuestionTypeInput from '../questionTypeInput';
import QuestionTypeCompletion from '../questionTypeCompletion';
import {
	isQuestionAnswered,
	questionTypeId,
} from './answerUtils';
import { typeBadgeColor, typeLabel } from '../components/questionTypeMeta';

/**
 * Tarjeta de una pregunta: cabecera común (número, tipo, estado) + control.
 *
 * Está memoizada porque el examen puede tener decenas de preguntas y cada
 * pulsación re-renderiza al padre: así solo se repinta la pregunta tocada.
 * `onChange` recibe el id para poder ser una función estable.
 */
const ExamQuestionCard = memo(function ExamQuestionCard({
	questionTest,
	index,
	resp,
	onChange,
	disabled,
}: {
	questionTest: courseStudentTestQuestion;
	index: number;
	resp?: string;
	onChange: (questionId: number, resp: string) => void;
	disabled?: boolean;
}) {
	const type = questionTypeId(questionTest);
	const answered = isQuestionAnswered(type, resp, questionTest);
	const badge = typeBadgeColor(type);

	const handleChange = (next: string) => onChange(questionTest.id, next);

	return (
		<section
			id={`exam-question-${questionTest.id}`}
			className="rounded-xl bg-white shadow-[0_2px_16px_rgba(15,23,42,0.07)] transition"
			style={{
				// Lo publica `ExamStatusBar` con la altura real de la barra
				// sticky, así el navegador de preguntas no deja la cabecera
				// tapada en ningún ancho.
				scrollMarginTop: 'var(--exam-bar-offset, 11rem)',
			}}
		>
			<header className="flex flex-wrap items-center justify-between gap-2 rounded-t-xl bg-slate-50 px-4 py-2.5">
				<div className="flex items-center gap-2">
					<span className="text-sm font-semibold text-slate-700">
						Pregunta #{index + 1}
					</span>
					<span
						className="rounded-full px-2 py-0.5 text-[11px] font-medium"
						style={{ background: badge.bg, color: badge.text }}
					>
						{typeLabel(type)}
					</span>
				</div>
				<span
					className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
						answered
							? 'bg-[#EAF3DE] text-[#3B6D11]'
							: 'bg-slate-100 text-slate-500'
					}`}
				>
					{answered ? (
						<>
							<Check size={12} /> Respondida
						</>
					) : (
						'Sin responder'
					)}
				</span>
			</header>

			<div className="px-4 py-3">
				<p className="text-sm leading-relaxed text-slate-900 sm:text-[15px]">
					{questionTest.question?.header}
				</p>

				{(type === 1 || type === 3) && (
					<QuestionTypeRadio
						questionTest={questionTest}
						resp={resp}
						onChange={handleChange}
						disabled={disabled}
					/>
				)}
				{type === 2 && (
					<QuestionTypeCheck
						questionTest={questionTest}
						resp={resp}
						onChange={handleChange}
						disabled={disabled}
					/>
				)}
				{type === 4 && (
					<QuestionTypeCompletion
						questionTest={questionTest}
						resp={resp}
						onChange={handleChange}
						disabled={disabled}
					/>
				)}
				{type === 5 && (
					<QuestionTypeInput
						questionTest={questionTest}
						resp={resp}
						onChange={handleChange}
						disabled={disabled}
					/>
				)}
				{type !== 1 &&
					type !== 2 &&
					type !== 3 &&
					type !== 4 &&
					type !== 5 && (
						<div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
							<AlertTriangle size={14} className="mt-0.5 shrink-0" />
							<span>
								Esta pregunta es de un tipo no soportado por la
								pantalla de examen. Avise al supervisor antes de
								finalizar.
							</span>
						</div>
					)}
			</div>
		</section>
	);
});

export default ExamQuestionCard;
