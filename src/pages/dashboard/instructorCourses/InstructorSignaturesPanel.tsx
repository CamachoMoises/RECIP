import { useEffect, useRef, useState } from 'react';
import {
	Button,
	IconButton,
	Typography,
} from '@material-tailwind/react';
import { ChevronDown, Save, Trash2 } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import toast from 'react-hot-toast';
import {
	axiosDeleteSlice,
	axiosGetDefault,
	axiosPostDefault,
} from '../../../services/axios';
import {
	course,
	courseGroupSignature,
} from '../../../types/utilities';
import {
	ordinalLabel,
	ordinalNoun,
	ordinalNounPlural,
	programSize,
	usesSessions,
} from '../../../utils/programSize';

type Props = {
	groupId: number;
	course?: course | null;
	canDelete?: boolean;
};

const MAX_SIGNATURES_PER_DAY = 3;

const InstructorSignaturesPanel = ({
	groupId,
	course,
	canDelete = false,
}: Props) => {
	const [signatures, setSignatures] = useState<courseGroupSignature[]>(
		[],
	);
	const [openDays, setOpenDays] = useState<Set<number>>(new Set());
	const [savingKey, setSavingKey] = useState<string | null>(null);
	const sigCanvasRefs = useRef<Map<string, SignatureCanvas>>(new Map());

	const loadSignatures = async () => {
		try {
			const { resp, status } = await axiosGetDefault(
				`api/course_groups/${groupId}/signatures`,
			);
			if (status >= 200 && status < 400) {
				const data = resp.data || resp || [];
				setSignatures(Array.isArray(data) ? data : []);
			}
		} catch {
			toast.error('Error al cargar las firmas');
		}
	};

	useEffect(() => {
		loadSignatures();
	}, [groupId]);

	const handleToggleDay = (day: number) => {
		setOpenDays((prev) => {
			const next = new Set(prev);
			if (next.has(day)) {
				next.delete(day);
			} else {
				next.add(day);
			}
			return next;
		});
	};

	const handleSaveSignature = async (
		day: number,
		canvas: SignatureCanvas,
	) => {
		if (canvas.isEmpty()) {
			toast.error('Dibuja una firma primero');
			return;
		}
		const key = `${day}-${signatures.filter((s) => s.day_number === day).length + 1}`;
		setSavingKey(key);
		try {
			await axiosPostDefault('api/course_groups/signature', {
				course_group_id: groupId,
				...(usesSessions(course)
					? { session_number: day }
					: { day_number: day }),
				signature: canvas.toDataURL(),
			});
			toast.success('Firma guardada correctamente');
			canvas.clear();
			await loadSignatures();
		} catch (error: any) {
			toast.error(error?.message || 'Error al guardar la firma');
		} finally {
			setSavingKey(null);
		}
	};

	const handleDeleteSignature = async (
		sig: courseGroupSignature,
		day: number,
	) => {
		if (
			!confirm(
				`¿Eliminar firma ${sig.signature_number} de la ${ordinalNoun(course).toLowerCase()} ${day}?`,
			)
		)
			return;
		try {
			await axiosDeleteSlice(
				`api/course_groups/${groupId}/signatures/${sig.id}`,
			);
			toast.success('Firma eliminada');
			await loadSignatures();
		} catch (error: any) {
			toast.error(error?.message || 'Error al eliminar firma');
		}
	};

	if (course?.course_type?.id === 2) return null;

	return (
		<div>
			<Typography
				variant="small"
				className="font-semibold mb-3 text-center"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Firmas del instructor por{' '}
				{ordinalNounPlural(course).toLowerCase()}
			</Typography>
			<div className="flex flex-col gap-1 max-w-md mx-auto">
				{Array.from(
					{ length: programSize(course) || 1 },
					(_, i) => i + 1,
				).map((day) => {
					const isOpen = openDays.has(day);
					const daySignatures = signatures
						.filter((s) => s.day_number === day)
						.sort((a, b) => a.signature_number - b.signature_number);
					const sigCount = daySignatures.length;
					const fullDay = sigCount >= MAX_SIGNATURES_PER_DAY;
					const canvasKey = `${day}-${sigCount + 1}`;
					return (
						<div
							key={day}
							className="border border-gray-200 rounded"
						>
							<button
								type="button"
								onClick={() => handleToggleDay(day)}
								className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-left transition-colors rounded ${fullDay ? 'bg-green-50 text-green-800 hover:bg-green-100' : 'text-blue-gray-700 hover:bg-gray-50'}`}
							>
								<span className="flex items-center gap-2">
									<ChevronDown
										size={14}
										className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${fullDay ? 'text-green-500' : 'text-gray-400'}`}
									/>
									{ordinalLabel(course, day)}
									{fullDay && (
										<span className="text-xs text-green-600 font-normal">
											✓ completo
										</span>
									)}
									{sigCount > 0 && !fullDay && (
										<span className="text-xs text-blue-600 font-normal">
											{sigCount}/{MAX_SIGNATURES_PER_DAY}{' '}
											firmas
										</span>
									)}
								</span>
							</button>
							{isOpen && (
								<div className="px-3 pb-3 pt-1 flex flex-col items-center gap-3">
									{daySignatures.map((sig) => (
										<div
											key={sig.id}
											className="flex flex-col items-center gap-1 w-full"
										>
											<div className="flex items-center justify-between w-full max-w-xs">
												<Typography
													variant="small"
													color="gray"
													placeholder={undefined}
													onPointerEnterCapture={
														undefined
													}
													onPointerLeaveCapture={
														undefined
													}
												>
													Firma {sig.signature_number}
												</Typography>
												{canDelete && (
													<IconButton
														size="sm"
														title={`Eliminar firma ${sig.signature_number} de la ${ordinalNoun(course).toLowerCase()} ${day}`}
														variant="text"
														color="red"
														onClick={() =>
															handleDeleteSignature(
																sig,
																day,
															)
														}
														placeholder={
															undefined
														}
														onPointerEnterCapture={
															undefined
														}
														onPointerLeaveCapture={
															undefined
														}
													>
														<Trash2 size={14} />
													</IconButton>
												)}
											</div>
											<img
												src={sig.signature_url}
												alt={`Firma ${sig.signature_number} ${ordinalNoun(course).toLowerCase()} ${day}`}
												className="max-w-xs h-auto border rounded"
											/>
										</div>
									))}
									{!fullDay && (
										<>
											<div
												className={`w-full overflow-hidden border border-gray-300 rounded ${savingKey === canvasKey ? 'pointer-events-none opacity-50' : ''}`}
											>
												<SignatureCanvas
													ref={(el) => {
														if (el)
															sigCanvasRefs.current.set(
																canvasKey,
																el,
															);
														else
															sigCanvasRefs.current.delete(
																canvasKey,
															);
													}}
													penColor="black"
													canvasProps={{
														width: 500,
														height: 120,
														style: {
															width: '100%',
															height: '120px',
															display: 'block',
														},
													}}
												/>
											</div>
											<div className="flex items-center gap-2">
												<Button
													size="sm"
													color="green"
													onClick={() => {
														const canvas =
															sigCanvasRefs.current.get(
																canvasKey,
															);
														if (canvas)
															handleSaveSignature(
																day,
																canvas,
															);
													}}
													disabled={savingKey === canvasKey}
													placeholder={undefined}
													onPointerEnterCapture={
														undefined
													}
													onPointerLeaveCapture={
														undefined
													}
													className="flex items-center gap-2"
												>
													<Save className="w-4 h-4" />
													{savingKey === canvasKey
														? 'Guardando...'
														: `Guardar Firma ${sigCount + 1}`}
												</Button>
												<Button
													size="sm"
													color="red"
													variant="outlined"
													onClick={() => {
														const canvas =
															sigCanvasRefs.current.get(
																canvasKey,
															);
														if (canvas) canvas.clear();
													}}
													disabled={savingKey === canvasKey}
													placeholder={undefined}
													onPointerEnterCapture={
														undefined
													}
													onPointerLeaveCapture={
														undefined
													}
													className="flex items-center gap-2"
												>
													Borrar
												</Button>
											</div>
										</>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default InstructorSignaturesPanel;
