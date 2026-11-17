import {
	Button,
	ButtonGroup,
	Input,
	Switch,
	Typography,
} from '@material-tailwind/react';
import {
	subjectLesson,
	subjectLessonDays,
} from '../../../types/utilities';
import {
	ArrowDown,
	ArrowUp,
	Pencil,
	Save,
	X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const LessonDetail = ({
	SL,
	ordinals,
	subjectLessonDays,
	handleChangeStatusDay,
	handleEditLesson,
	handleMoveLesson,
	isFirst,
	isLast,
	moving,
}: {
	SL: subjectLesson;
	subjectLessonDays: subjectLessonDays[];
	ordinals: {
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
	/** Devuelve `true` si el tema se guardó: solo entonces se cierra la edición. */
	handleEditLesson: (
		id: number,
		lesson: string,
		order: number,
		status: boolean
	) => Promise<boolean>;
	/** Sube/baja el tema una posición (`PUT /api/subjects/lesson/order`). */
	handleMoveLesson: (
		lessonId: number | undefined,
		direction: -1 | 1
	) => Promise<void>;
	/** Primer/último tema de la sección: deshabilita la flecha que no aplica. */
	isFirst: boolean;
	isLast: boolean;
	/** Hay un reordenamiento en vuelo: evita dobles clics. */
	moving: boolean;
}) => {
	const [editLesson, setEditLesson] = useState(false);
	const [lessonName, setLessonName] = useState(SL.name);
	const [isActive, setIsActive] = useState(SL.status);
	const [saving, setSaving] = useState(false);

	// Tras reordenar o guardar, el tema puede llegar con otro nombre/estado
	// (el reducer reemplaza `subject_lessons` entero). Sin esto, el input y el
	// switch conservarían el valor viejo porque el componente sigue montado.
	useEffect(() => {
		setLessonName(SL.name);
		setIsActive(SL.status);
	}, [SL.id, SL.name, SL.status]);

	const handleCancelEdit = () => {
		setLessonName(SL.name);
		setIsActive(SL.status);
		setEditLesson(false);
	};

	const handleSave = async () => {
		if (!lessonName.trim() || saving) return;
		setSaving(true);
		const saved = await handleEditLesson(
			SL.id ? SL.id : -1,
			lessonName.trim(),
			SL.order,
			isActive,
		);
		setSaving(false);
		if (saved) setEditLesson(false);
	};

	return (
		<>
			<div className="flex min-w-0 flex-1 flex-row items-center gap-2">
				{editLesson ? (
					<Input
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						value={lessonName}
						required
						maxLength={500}
						onChange={(e) => {
							setLessonName(e.target.value);
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								handleSave();
							}
							if (e.key === 'Escape') {
								e.preventDefault();
								handleCancelEdit();
							}
						}}
						type="text"
						label="Nombre del tema"
						placeholder="Nombre"
						className="bg-slate-400 rounded-md p-2 w-full min-w-[12rem] block text-slate-900"
						crossOrigin={undefined}
					/>
				) : (
					<>
						<Typography
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
							className="min-w-0 break-words"
						>
							{SL.name}
						</Typography>
						{!SL.status && (
							<Typography
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								color="red"
								variant="small"
								className="shrink-0 font-medium"
							>
								Inactivo
							</Typography>
						)}
					</>
				)}
			</div>

			<div className="flex flex-wrap items-end justify-center gap-3">
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
							checked={isActive}
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
						{ordinals.map((ordinal) => {
							let SLD: subjectLessonDays | undefined = undefined;
							SLD = subjectLessonDays.find(
								(sld) => sld.day === ordinal.id + 1
							);
							return (
								<div
									className="flex flex-col gap-1"
									key={`ordinal-${ordinal.id}`}
								>
									<label>{ordinal.name}</label>
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
												ordinal,
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

			{editLesson ? (
				<ButtonGroup
					size="sm"
					variant="outlined"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Button
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
						title="Subir tema"
						disabled={isFirst || moving || !SL.id || editLesson}
						onClick={() => handleMoveLesson(SL.id, -1)}
					>
						<ArrowUp size={14} />
					</Button>
					<Button
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
						title="Bajar tema"
						disabled={isLast || moving || !SL.id || editLesson}
						onClick={() => handleMoveLesson(SL.id, 1)}
					>
						<ArrowDown size={14} />
					</Button>
					<Button
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
						title="Cancelar edición"
						disabled={saving}
						onClick={handleCancelEdit}
					>
						<X size={14} />
					</Button>
					<Button
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
						title="Guardar cambios"
						disabled={!lessonName.trim() || saving}
						onClick={handleSave}
					>
						<Save size={14} />
					</Button>
				</ButtonGroup>
			) : (
				<ButtonGroup
					size="sm"
					variant="outlined"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Button
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
						title="Subir tema"
						disabled={isFirst || moving || !SL.id}
						onClick={() => handleMoveLesson(SL.id, -1)}
					>
						<ArrowUp size={14} />
					</Button>
					<Button
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
						title="Bajar tema"
						disabled={isLast || moving || !SL.id}
						onClick={() => handleMoveLesson(SL.id, 1)}
					>
						<ArrowDown size={14} />
					</Button>
					<Button
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						placeholder={undefined}
						title="Editar tema"
						onClick={() => setEditLesson(true)}
					>
						<Pencil size={14} />
					</Button>
				</ButtonGroup>
			)}
		</>
	);
};

export default LessonDetail;
