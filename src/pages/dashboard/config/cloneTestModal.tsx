import { useEffect, useMemo, useState } from 'react';
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
} from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, Loader, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppDispatch, RootState } from '../../../store';
import { cloneTest } from '../../../features/testSlice';
import { fetchCourses } from '../../../features/courseSlice';
import { course, test } from '../../../types/utilities';
import { isCourseDeleted } from '../../../utils/courseStatus';

type CloneTestModalProps = {
	open: boolean;
	setOpen: (open: boolean) => void;
	// Examen origen que se va a clonar.
	test: test;
	// Curso abierto en la pantalla. Si coincide con el destino, el clon se
	// inserta en la lista sin recargar (ver reducer de `cloneTest`).
	currentCourseId?: number | null;
};

const CloneTestModal = ({
	open,
	setOpen,
	test,
	currentCourseId,
}: CloneTestModalProps) => {
	const dispatch = useDispatch<AppDispatch>();
	const courseList = useSelector(
		(state: RootState) => state.courses.courseList,
	);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [search, setSearch] = useState('');
	const [destinationId, setDestinationId] = useState<number | null>(null);

	// Curso dueño del examen: el destino debe ser distinto
	// (`409 El curso destino debe ser diferente al curso dueño del examen`).
	const ownerCourseId = test.course?.id ?? test.course_id;

	useEffect(() => {
		if (!open) return;
		let active = true;
		setLoading(true);
		setSearch('');
		setDestinationId(null);

		// Sin `include_inactive`: el curso destino debe estar activo.
		dispatch(fetchCourses())
			.unwrap()
			.catch((error) => {
				if (active) {
					toast.error(
						typeof error === 'string'
							? error
							: 'Error al cargar los cursos',
					);
				}
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
		};
	}, [open, dispatch]);

	const destinations = useMemo(() => {
		const term = search.trim().toLowerCase();
		return courseList
			// Regla del backend: solo cursos de teoría activos.
			.filter(
				(C) =>
					typeof C.id === 'number' &&
					C.course_type?.id === 1 &&
					!isCourseDeleted(C) &&
					C.id !== ownerCourseId,
			)
			.filter((C) => {
				if (!term) return true;
				return (
					(C.name ?? '').toLowerCase().includes(term) ||
					(C.code ?? '').toLowerCase().includes(term)
				);
			})
			.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
	}, [courseList, ownerCourseId, search]);

	const destination: course | undefined = destinations.find(
		(C) => C.id === destinationId,
	);

	const handleClone = async () => {
		if (!destination || typeof destination.id !== 'number') return;
		setSaving(true);
		try {
			const result = await dispatch(
				cloneTest({
					test_id: test.id,
					course_id: destination.id,
					view_course_id: currentCourseId ?? undefined,
				}),
			).unwrap();
			toast.success(
				`Examen clonado como ${result.code}: ${result.questions_cloned} preguntas, ${result.answers_cloned} respuestas y ${result.test_question_types_cloned} tipo(s) de pregunta. Se creó inactivo en ${destination.name}.`,
			);
			setOpen(false);
		} catch (error: any) {
			// 400/404/409 llegan con el mensaje real del backend.
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al clonar el examen',
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<Dialog
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			open={open}
			handler={() => {
				if (!saving) setOpen(false);
			}}
			size="lg"
		>
			<DialogHeader
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Clonar examen
			</DialogHeader>
			<DialogBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="flex flex-col gap-3"
			>
				<p className="text-sm text-gray-700">
					Se creará una <strong>variante independiente</strong> del
					examen <strong>{test.code}</strong> (
					{test.duration} min · nota mínima {test.min_score}) en otro
					curso de teoría, copiando todas sus preguntas, respuestas y
					la configuración de tipos de pregunta.
				</p>

				<div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
					<div className="flex items-start gap-2">
						<AlertTriangle size={16} className="mt-0.5 shrink-0" />
						<div>
							El clon <strong>nace inactivo</strong> y solo queda
							vinculado al curso destino; el examen original y sus
							intentos no se modifican. Para activarlo, desactiva
							antes el examen activo del curso destino si ya hay
							uno.
						</div>
					</div>
				</div>

				<div className="relative">
					<Search
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
					/>
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Buscar curso destino por nombre o código"
						className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm"
					/>
				</div>

				{loading ? (
					<div className="flex justify-center py-6">
						<Loader className="h-6 w-6 animate-spin" />
					</div>
				) : destinations.length === 0 ? (
					<p className="py-4 text-center text-sm text-gray-600">
						No hay otros cursos de teoría activos para recibir el
						clon.
					</p>
				) : (
					<div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1">
						{destinations.map((C) => (
							<label
								key={C.id}
								className={`flex cursor-pointer items-center gap-3 rounded-md border p-2 ${
									destinationId === C.id
										? 'border-blue-500 bg-blue-50'
										: 'border-gray-300 hover:bg-gray-50'
								}`}
							>
								<input
									type="radio"
									name="clone-destination"
									checked={destinationId === C.id}
									onChange={() => setDestinationId(C.id)}
								/>
								<div>
									<div className="text-sm font-medium">
										{C.name}
									</div>
									<div className="text-xs text-gray-600">
										{C.code}
									</div>
								</div>
							</label>
						))}
					</div>
				)}

				{destination &&
					currentCourseId === destination.id && (
						<p className="text-xs text-gray-600">
							El clon aparecerá en esta misma lista, inactivo.
						</p>
					)}
			</DialogBody>
			<DialogFooter
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Button
					variant="text"
					color="red"
					onClick={() => setOpen(false)}
					disabled={saving}
					className="mr-2"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Cancelar
				</Button>
				<Button
					color="green"
					onClick={handleClone}
					disabled={!destination || saving}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{saving ? 'Clonando...' : 'Clonar examen'}
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default CloneTestModal;
