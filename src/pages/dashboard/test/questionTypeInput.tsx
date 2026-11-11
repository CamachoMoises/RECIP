import { courseStudentTestQuestion } from '../../../types/utilities';
import TextAnswerFields from './exam/TextAnswerFields';
import {
	readTextAnswers,
	textSlots,
	writeTextAnswers,
} from './exam/answerUtils';

/**
 * Pregunta de desarrollo. Controlada: los valores salen de `resp` y cada
 * cambio reescribe el arreglo completo de respuestas.
 */
const QuestionTypeInput = ({
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
	const values = readTextAnswers(resp, textSlots(questionTest));

	const handleChange = (index: number, value: string) => {
		const next = [...values];
		next[index] = value;
		onChange(writeTextAnswers(next));
	};

	return (
		<TextAnswerFields
			questionTest={questionTest}
			values={values}
			onChange={handleChange}
			disabled={disabled}
			multiline
		/>
	);
};

export default QuestionTypeInput;
