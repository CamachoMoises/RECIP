import { courseStudentTestQuestion } from '../../../types/utilities';
import FstdTable from './exam/FstdTable';
import TextAnswerFields from './exam/TextAnswerFields';
import {
	answerCount,
	readTextAnswers,
	textSlots,
	writeTextAnswers,
} from './exam/answerUtils';

/**
 * Pregunta de completar. Controlada.
 *
 * El formulario FSTD de 44 casillas se dibuja solo cuando la pregunta tiene
 * exactamente 44 respuestas configuradas; cualquier otra cantidad usa campos
 * numerados (antes, una pregunta de completar con otra cantidad no mostraba
 * ningún campo y era imposible de responder).
 */
const QuestionTypeCompletion = ({
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
	const isFstd = answerCount(questionTest) === 44;
	const values = readTextAnswers(resp, textSlots(questionTest));

	const handleChange = (index: number, value: string) => {
		const next = [...values];
		next[index] = value;
		onChange(writeTextAnswers(next));
	};

	if (isFstd) {
		return (
			<FstdTable
				questionId={questionTest.id}
				values={values}
				onChange={handleChange}
				disabled={disabled}
			/>
		);
	}

	return (
		<TextAnswerFields
			questionTest={questionTest}
			values={values}
			onChange={handleChange}
			disabled={disabled}
		/>
	);
};

export default QuestionTypeCompletion;
