import { useRef, useState } from 'react';
import {
	Button,
	IconButton,
	Typography,
} from '@material-tailwind/react';
import {
	CheckCircle2,
	ChevronDown,
	Save,
	Trash2,
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import toast from 'react-hot-toast';
import {
	axiosDeleteSlice,
	axiosPostDefault,
} from '../../../services/axios';
import {
	courseGroupSignature,
	signatureGroupCourse,
} from '../../../types/utilities';
import {
	ordinalLabel,
	ordinalNoun,
	ordinalNounArticle,
	ordinalNounPlural,
	usesSessions,
} from '../../../utils/programSize';

type Props = {
	groupId: number;
	course?: signatureGroupCourse | null;
	days: number[];
	signatures: courseGroupSignature[];
	canDelete?: boolean;
	onChanged?: () => void;
};

/**
 * El form del instructor solo permite **1 firma por día**: los días se toman del
 * cronograma (`days` del endpoint de firmas), no del programa completo del curso.
 */

const InstructorSignaturesPanel = ({
	groupId,
	course,
	days,
	signatures,
	canDelete = false,
	onChanged,
}: Props) => {
	const [openDays, setOpenDays] = useState<Set<number>>(new Set());
	const [saving, setSaving] = useState<number | null>(null);
	const sigCanvasRefs = useRef<Map<number, SignatureCanvas>>(
		new Map(),
	);

	const orderedDays = [...days].sort((a, b) => a - b);

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
		setSaving(day);
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
			onChanged?.();
		} catch (error: any) {
			toast.error(error?.message || 'Error al guardar la firma');
		} finally {
			setSaving(null);
		}
	};

	const handleDeleteSignature = async (sig: courseGroupSignature) => {
		if (
			!confirm(
				`¿Eliminar la firma ${ordinalNounArticle(course).toLowerCase()} ${sig.day_number}?`,
			)
		)
			return;
		try {
			await axiosDeleteSlice(
				`api/course_groups/${groupId}/signatures/${sig.id}`,
			);
			toast.success('Firma eliminada');
			onChanged?.();
		} catch (error: any) {
			toast.error(error?.message || 'Error al eliminar firma');
		}
	};

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
			{orderedDays.length === 0 ? (
				<Typography
					variant="small"
					color="gray"
					className="text-center py-4"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Este grupo no tiene programación en el cronograma.
				</Typography>
			) : (
				<div className="flex flex-col gap-1 max-w-md mx-auto">
					{orderedDays.map((day) => {
						const isOpen = openDays.has(day);
						const daySignature = signatures.find(
							(s) => s.day_number === day,
						);
						const filled = Boolean(daySignature);
						return (
							<div
								key={day}
								className="border border-gray-200 rounded"
							>
								<button
									type="button"
									onClick={() => handleToggleDay(day)}
									className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-left transition-colors rounded ${filled ? 'bg-green-50 text-green-800 hover:bg-green-100' : 'text-blue-gray-700 hover:bg-gray-50'}`}
								>
									<span className="flex items-center gap-2">
										<ChevronDown
											size={14}
											className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${filled ? 'text-green-500' : 'text-gray-400'}`}
										/>
										{ordinalLabel(course, day)}
										{filled && (
											<span className="flex items-center gap-1 text-xs text-green-600 font-normal">
												<CheckCircle2 size={12} />
												firmado
											</span>
										)}
									</span>
								</button>
								{isOpen && (
									<div className="px-3 pb-3 pt-1 flex flex-col items-center gap-3">
										{daySignature ? (
											<div className="flex flex-col items-center gap-1 w-full">
												<div className="flex items-center justify-between w-full max-w-xs">
													<Typography
														variant="small"
														color="gray"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														Firma {daySignature.signature_number}
													</Typography>
													{canDelete && (
														<IconButton
															size="sm"
															title={`Eliminar firma de la ${ordinalNoun(course).toLowerCase()} ${day}`}
															variant="text"
															color="red"
															onClick={() =>
																handleDeleteSignature(daySignature)
															}
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															<Trash2 size={14} />
														</IconButton>
													)}
												</div>
												<img
													src={daySignature.signature_url}
													alt={`Firma de la ${ordinalNoun(course).toLowerCase()} ${day}`}
													className="max-w-xs h-auto border rounded"
												/>
											</div>
										) : (
											<>
												<div
													className={`w-full overflow-hidden border border-gray-300 rounded ${saving === day ? 'pointer-events-none opacity-50' : ''}`}
												>
													<SignatureCanvas
														ref={(el) => {
															if (el)
																sigCanvasRefs.current.set(day, el);
															else sigCanvasRefs.current.delete(day);
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
																sigCanvasRefs.current.get(day);
															if (canvas)
																handleSaveSignature(day, canvas);
														}}
														disabled={saving === day}
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
														className="flex items-center gap-2"
													>
														<Save className="w-4 h-4" />
														{saving === day
															? 'Guardando...'
															: 'Guardar Firma'}
													</Button>
													<Button
														size="sm"
														color="red"
														variant="outlined"
														onClick={() => {
															const canvas =
																sigCanvasRefs.current.get(day);
															if (canvas) canvas.clear();
														}}
														disabled={saving === day}
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
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
			)}
		</div>
	);
};

export default InstructorSignaturesPanel;
