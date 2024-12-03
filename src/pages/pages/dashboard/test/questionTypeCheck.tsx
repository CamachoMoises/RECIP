import { Checkbox, Typography } from '@material-tailwind/react';
import { question } from '../../../../types/utilities';

const QuestionTypeCheck = ({
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
				Seleccion Multiple {countKey + 1}
			</Typography>
			{question.answers?.map((answer) => (
				<div key={answer.id} className="flex flex-row justify-start">
					<Checkbox
						color="red"
						id={`check-${answer.id}`}
						value={answer.id}
						label={answer.value}
						name={`check-${question.id}`}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						crossOrigin={undefined}
					/>
				</div>
			))}
		</>
	);
};

export default QuestionTypeCheck;
