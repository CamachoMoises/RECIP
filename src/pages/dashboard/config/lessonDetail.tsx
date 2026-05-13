import {
	Button,
	// ButtonGroup,
	Input,
	Switch,
	Typography,
} from '@material-tailwind/react';
import {
	subjectLesson,
	subjectLessonDays,
} from '../../../../types/utilities';
import {
	// ArrowDown,
	// ArrowUp,
	Pencil,
	Save,
	X,
} from 'lucide-react';
import { useState } from 'react';

const LessonDetail = ({
	SL,
	days,
	subjectLessonDays,
	// maxOrderLessonSelected,
	handleChangeStatusDay,
	handleEditLesson,
}: {
	SL: subjectLesson;
	subjectLessonDays: subjectLessonDays[];
	maxOrderLessonSelected: number | null;
	days: {
		id: number;
		name: string;
	}[];
	handleChangeStatusDay: (
		event: React.ChangeEvent<HTMLInputElement>,
		day: {
			id: number;
			name: string;
		},
		subject_lesson_id: number | undefined,
		subject_lesson_days_id: number
	) => Promise<void>;
	handleEditLesson: (
		id: number,
		lesson: string,
		order: number,
		status: boolean
	) => Promise<void>;
}) => {
	// const maxOrderLesson = maxOrderLessonSelected
	// 	? maxOrderLessonSelected
	// 	: -1;
	const [editLesson, setEditLesson] = useState(false);
	const [lessonName, setLessonName] = useState(SL.name);
	const [isActive, setIsActive] = useState(SL.status);
	return (
		<>
			<div className="flex flex-row justify-between w-80">
				{editLesson ? (
					<>
						<Input
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							value={lessonName}
							required
							maxLength={500}
							onChange={(e) => {
								setLessonName(e.target.value);
							}}
							type="text"
							label="Nombre del tema"
							placeholder="Nombre "
							className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
							crossOrigin={undefined}
						/>
					</>
				) : (
					<>
						<Typography
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							{SL.name}
						</Typography>
						{!SL.status && (
							<Typography
								placeholder={undefined}
								color="red"
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Inactivo
							</Typography>
						)}
					</>
				)}
			</div>

			<div className="flex w-max gap-3">
				{editLesson ? (
					<div className="flex flex-col gap-1">
						<label>Activo</label>
						<Switch
							className="h-full w-full checked:bg-[#134475]"
							containerProps={{
								className: 'w-11 h-6',
							}}
							circleProps={{
								className: 'before:hidden left-0.5 border-none',
							}}
							defaultChecked={isActive}
							onChange={() => {
								setIsActive(!isActive);
							}}
							crossOrigin={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						/>
					</div>
				) : (
					<>
						{days.map((day) => {
							let SLD: subjectLessonDays | undefined = undefined;
							SLD = subjectLessonDays.find(
								(sld) => sld.day === day.id + 1
							);
							return (
								<div
									className="flex flex-col gap-1"
									key={`day-${day.id}`}
								>
									<label>{day.name}</label>
									<Switch
										className="h-full w-full checked:bg-[#134475]"
										containerProps={{
											className: 'w-11 h-6',
										}}
										circleProps={{
											className: 'before:hidden left-0.5 border-none',
										}}
										defaultChecked={SLD?.status ? true : false}
										onChange={(event) => {
											handleChangeStatusDay(
												event,
												day,
												SL.id,
												SLD?.id ? SLD.id : -1
											);
										}}
										crossOrigin={undefined}
										disabled={!SL.status || editLesson}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									/>
								</div>
							);
						})}
					</>
				)}
			</div>
			<div className="flex flex-row gap-2 ">
				{/* <ButtonGroup
				size="sm"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			> */}
				{/* <Button
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					disabled={SL.order <= 1 || editLesson}
					onClick={() =>
						handleSwitchSubject(
							subject,
							index,
							'up'
						)
					}
				>
					<ArrowUp size={12} />
				</Button> */}

				<Button
					placeholder={undefined}
					variant={editLesson ? 'outlined' : 'filled'}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					onClick={() => setEditLesson(!editLesson)}
				>
					{editLesson ? <X size={12} /> : <Pencil size={12} />}
				</Button>
				{editLesson && (
					<Button
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						disabled={!lessonName}
						onClick={() => {
							handleEditLesson(
								SL.id ? SL.id : -1,
								lessonName,
								SL.order,
								isActive
							);
						}}
					>
						<Save size={12} />
					</Button>
				)}
				{/* <Button
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					disabled={maxOrderLesson <= SL.order || editLesson}
					onClick={() =>
						handleSwitchSubject(
							subject,
							index,
							'down'
						)
					}
				>
					<ArrowDown size={12} />
				</Button> */}
				{/* </ButtonGroup> */}
			</div>
		</>
	);
};

export default LessonDetail;
