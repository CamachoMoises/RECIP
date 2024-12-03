import { Radio, Typography } from '@material-tailwind/react';
import { question } from '../../../../types/utilities';

const QuestionTypeRadio = ({
	question,
	countKey,
	type,
}: {
	question: question;
	countKey: number;
	type: number;
}) => {
	return (
		<>
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				variant="lead"
			>
				{question.header}
			</Typography>
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				{type === 1 && <>Seleccion Simple</>}
				{type === 3 && <>Verdadero o falso</>} {countKey + 1}
			</Typography>
			{question.answers?.map((answer) => (
				<div key={answer.id} className="flex flex-row justify-start">
					<Radio
						name={`radio-${question.id}`}
						id={`radio-${answer.id}`}
						label={answer.value}
						color="red"
						value={answer.id}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						crossOrigin={undefined}
					/>
				</div>
			))}
		</>
	);
};

export default QuestionTypeRadio;
