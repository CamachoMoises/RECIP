import { Textarea, Typography } from '@material-tailwind/react';
import { question } from '../../../../types/utilities';

const QuestionTypeInput = ({
	question,
	countKey,
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
				Pregunta de desarrollo {countKey + 1}
			</Typography>
			{question.answers?.map((answer) => (
				<div
					key={answer.id}
					className="flex flex-row justify-start p-5"
				>
					<Textarea
						variant="standard"
						label={answer.value}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					/>
				</div>
			))}
		</>
	);
};

export default QuestionTypeInput;
