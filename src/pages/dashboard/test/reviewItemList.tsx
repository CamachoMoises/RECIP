import { useState } from 'react';
import {
	answer,
	courseStudentTestQuestion,
} from '../../../types/utilities';
import { Input } from '@material-tailwind/react';
import { Save, X, CheckCircle, User, Minus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { updateCourseStudentTestScore } from '../../../features/testSlice';

const TYPE_LABELS: Record<number, string> = {
	1: 'Opción única',
	2: 'Opción múltiple',
	3: 'Verdadero / Falso',
	4: 'Completar',
	5: 'Desarrollo',
};

const TYPE_BADGE_COLORS: Record<
	number,
	{ bg: string; text: string }
> = {
	1: { bg: '#E6F1FB', text: '#0C447C' },
	2: { bg: '#E6F1FB', text: '#0C447C' },
	3: { bg: '#EEEDFE', text: '#3C3489' },
	4: { bg: '#FAEEDA', text: '#633806' },
	5: { bg: '#FAEEDA', text: '#633806' },
};

const ReviewItemList = ({
	question,
	index,
	editing,
	setEditing,
}: {
	question: courseStudentTestQuestion;
	index: number;
	editing: boolean;
	setEditing: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const dispatch = useDispatch<AppDispatch>();

	let respData: string[] = [];
	let answered = false;
	let findAnswerMulti: answer | undefined;
	let multiResp = 0;
	let findAnswer = null;

	const correctAnswers = question.question?.answers?.filter(
		(qa) => qa.is_correct,
	);
	const type = question.question?.question_type_id;

	switch (type) {
		case 1:
		case 3:
			findAnswer = question.question?.answers?.find(
				(ans) =>
					ans.id ===
					parseInt(question.course_student_test_answer?.resp ?? '-1'),
			);
			if (findAnswer) {
				respData.push(findAnswer.value);
				answered = true;
			}
			break;

		case 2:
			findAnswer = JSON.parse(
				question.course_student_test_answer?.resp ?? '[]',
			);
			for (const ans of findAnswer) {
				if (ans.check) {
					findAnswerMulti = question.question?.answers?.find(
						(a) => a.id === ans.id,
					);
					if (findAnswerMulti) multiResp++;
					respData.push(findAnswerMulti?.value ?? '');
				}
			}
			answered = multiResp > 0;
			break;

		case 4:
		case 5:
			findAnswer = JSON.parse(
				question.course_student_test_answer?.resp ?? '[]',
			);
			if (findAnswer.length > 0) {
				respData = findAnswer;
				answered = true;
			}
			break;
	}

	const maxScore = question.question?.question_type?.value ?? 0;
	const initialScore = `${question.course_student_test_answer?.score ?? 0}`;
	const [localEditing, setLocalEditing] = useState(false);
	const [score, setScore] = useState(initialScore);
	const [errorInput, setErrorInput] = useState(false);

	const parsedScore = parseFloat(score);
	const isCorrect = answered && parsedScore >= maxScore;
	const isPartial =
		answered && parsedScore > 0 && parsedScore < maxScore;
	const isWrong = !answered || parsedScore === 0;

	const scoreColor = isCorrect
		? '#3B6D11'
		: isPartial
			? '#854F0B'
			: '#A32D2D';

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditing(true);
		setLocalEditing(true);
		const val = e.target.value;
		const valid = /^0$|^[1-9]\d*(\.\d{1,2})?$|^0\.\d{1,2}$/.test(val);
		setErrorInput(
			!valid || parseFloat(val) < 0 || parseFloat(val) > maxScore,
		);
		setScore(val);
	};

	const handleSave = async () => {
		const resp = await dispatch(
			updateCourseStudentTestScore({
				course_student_test_id: question.course_student_test_id,
				course_student_test_answer_id:
					question.course_student_test_answer?.id ?? -1,
				score: parsedScore,
			}),
		).unwrap();
		if (resp) {
			setEditing(false);
			setLocalEditing(false);
		}
	};

	const badgeColor =
		TYPE_BADGE_COLORS[type ?? 1] ?? TYPE_BADGE_COLORS[1];
	const respIsCorrect =
		answered &&
		JSON.stringify(respData) ===
			JSON.stringify(correctAnswers?.map((c) => c.value));

	return (
		<div
			style={{
				background: 'var(--color-background-primary)',
				border: '0.5px solid var(--color-border-tertiary)',
				borderRadius: 'var(--border-radius-lg)',
				overflow: 'hidden',
				opacity: editing && !localEditing ? 0.5 : 1,
				pointerEvents: editing && !localEditing ? 'none' : 'auto',
				transition: 'opacity 0.2s',
			}}
		>
			{/* Header */}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '10px 14px',
					borderBottom: '0.5px solid var(--color-border-tertiary)',
					background: 'var(--color-background-secondary)',
				}}
			>
				<div
					style={{ display: 'flex', alignItems: 'center', gap: 8 }}
				>
					<span
						style={{
							fontSize: 12,
							fontWeight: 500,
							color: 'var(--color-text-secondary)',
						}}
					>
						#{index + 1}
					</span>
					<span
						style={{
							fontSize: 11,
							padding: '2px 8px',
							borderRadius: 999,
							background: badgeColor.bg,
							color: badgeColor.text,
						}}
					>
						{TYPE_LABELS[type ?? 1] ?? 'Desconocido'}
					</span>
				</div>
				<span
					style={{ fontSize: 12, fontWeight: 500, color: scoreColor }}
				>
					{score} / {maxScore} pts
				</span>
			</div>

			{/* Body */}
			<div
				style={{
					padding: 14,
					display: 'flex',
					flexDirection: 'column',
					gap: 12,
				}}
			>
				<p
					style={{
						fontSize: 13,
						color: 'var(--color-text-primary)',
						margin: 0,
					}}
				>
					{question.question?.header}
				</p>

				{/* Correcta vs Respuesta */}
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: 10,
					}}
				>
					{/* Correcta */}
					<div
						style={{
							borderRadius: 'var(--border-radius-md)',
							padding: '10px 12px',
							background: '#EAF3DE',
							border: '0.5px solid #C0DD97',
						}}
					>
						<p
							style={{
								fontSize: 11,
								fontWeight: 500,
								color: '#3B6D11',
								margin: '0 0 6px',
								display: 'flex',
								alignItems: 'center',
								gap: 4,
							}}
						>
							<CheckCircle size={12} /> Correcta
						</p>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
							}}
						>
							{correctAnswers?.length ? (
								correctAnswers.map((ca, i) => (
									<p
										key={ca.id}
										style={{
											fontSize: 12,
											color: '#27500A',
											margin: 0,
										}}
									>
										{correctAnswers.length > 1 ? `(${i + 1}): ` : ''}
										{ca.value}
									</p>
								))
							) : (
								<p
									style={{
										fontSize: 12,
										color: '#27500A',
										margin: 0,
									}}
								>
									—
								</p>
							)}
						</div>
					</div>

					{/* Respuesta del estudiante */}
					<div
						style={{
							borderRadius: 'var(--border-radius-md)',
							padding: '10px 12px',
							background: answered
								? respIsCorrect
									? '#EAF3DE'
									: '#FCEBEB'
								: 'var(--color-background-secondary)',
							border: `0.5px solid ${answered ? (respIsCorrect ? '#C0DD97' : '#F7C1C1') : 'var(--color-border-tertiary)'}`,
						}}
					>
						<p
							style={{
								fontSize: 11,
								fontWeight: 500,
								color: answered
									? respIsCorrect
										? '#3B6D11'
										: '#A32D2D'
									: 'var(--color-text-secondary)',
								margin: '0 0 6px',
								display: 'flex',
								alignItems: 'center',
								gap: 4,
							}}
						>
							{answered ? <User size={12} /> : <Minus size={12} />}
							{answered ? 'Respuesta' : 'Sin respuesta'}
						</p>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: 2,
							}}
						>
							{answered ? (
								respData.map((rd, i) => (
									<p
										key={i}
										style={{
											fontSize: 12,
											color: respIsCorrect ? '#27500A' : '#791F1F',
											margin: 0,
										}}
									>
										{respData.length > 1 ? `(${i + 1}): ` : ''}
										{rd}
									</p>
								))
							) : (
								<p
									style={{
										fontSize: 12,
										color: 'var(--color-text-secondary)',
										margin: 0,
									}}
								>
									—
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Score input + acciones */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'flex-center',
						gap: 1,
					}}
				>
					<div style={{ width: 80 }}>
						<Input
							label="Pts"
							error={errorInput}
							value={score}
							onChange={handleChange}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							crossOrigin={undefined}
						/>
					</div>
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'flex-center',
						gap: 1,
					}}
				>
					<button
						onClick={handleSave}
						disabled={errorInput || !localEditing || !answered}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 4,
							fontSize: 12,
							padding: '6px 12px',
							border: '0.5px solid var(--color-border-success)',
							borderRadius: 'var(--border-radius-md)',
							color: 'var(--color-text-success)',
							background: 'none',
							cursor: 'pointer',
							opacity:
								errorInput || !localEditing || !answered ? 0.4 : 1,
						}}
					>
						<Save size={13} /> Guardar
					</button>
					{localEditing && (
						<button
							onClick={() => {
								setScore(initialScore);
								setLocalEditing(false);
								setEditing(false);
							}}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 4,
								fontSize: 12,
								padding: '6px 10px',
								border: '0.5px solid #F7C1C1',
								borderRadius: 'var(--border-radius-md)',
								color: '#A32D2D',
								background: 'none',
								cursor: 'pointer',
							}}
						>
							<X size={13} /> Cancelar
						</button>
					)}
				</div>
			</div>
		</div>
	);
};

export default ReviewItemList;
