import { useEffect, useMemo, useState } from 'react';
import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
} from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import { Loader, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppDispatch, RootState } from '../../../store';
import { fetchAllTests, linkTestToCourse } from '../../../features/testSlice';
import { fetchCourses } from '../../../features/courseSlice';
import { course, test } from '../../../types/utilities';

type LinkTestModalProps = {
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
	courseId: number | null | undefined;
	courseName?: string;
	// Exámenes que ya están vinculados al curso (se excluyen de los candidatos).
	linkedTestIds: number[];
	// El curso ya tiene un examen activo: vincular otro activo daría 409.
	hasActiveTest: boolean;
};

const LinkTestModal = ({
	open,
	setOpen,
	courseId,
	courseName,
	linkedTestIds,
	hasActiveTest,
}: LinkTestModalProps) => {
	const dispatch = useDispatch<AppDispatch>();
	const courseList = useSelector(
		(state: RootState) => state.courses.courseList,
	);
	const [allTests, setAllTests] = useState<test[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState<number[]>([]);

	useEffect(() => {
		if (!open) return;
		let active = true;
		setLoading(true);
		setSelected([]);
		setSearch('');

		// `include_inactive` para poder resolver el nombre del curso dueño
		// aunque esté eliminado (el backend solo exige que sea de teoría).
		Promise.all([
			dispatch(fetchAllTests()).unwrap(),
			dispatch(fetchCourses({ include_inactive: true })).unwrap(),
		])
			.then(([tests]) => {
				if (active) setAllTests(tests);
			})
			.catch((error) => {
				if (active) {
					toast.error(
						typeof error === 'string'
							? error
							: 'Error al cargar los exámenes',
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

	const courseById = useMemo(() => {
		const map = new Map<number, course>();
		courseList.forEach((C) => {
			if (typeof C.id === 'number') map.set(C.id, C);
		});
		return map;
	}, [courseList]);

	const linkedSet = useMemo(
		() => new Set(linkedTestIds),
		[linkedTestIds],
	);

	const candidates = useMemo(() => {
		const term = search.trim().toLowerCase();
		return allTests
			// Solo exámenes de cursos de teoría (regla del backend).
			.filter((T) => {
				const owner = courseById.get(T.course_id);
				return owner?.course_type?.id === 1;
			})
			// Los ya vinculados no son candidatos (vincular es idempotente,
			// pero mostrarlos solo agrega ruido).
			.filter((T) => !linkedSet.has(T.id))
			.filter((T) => {
				if (!term) return true;
				const owner = courseById.get(T.course_id);
				return (
					(T.code ?? '').toLowerCase().includes(term) ||
					(owner?.name ?? '').toLowerCase().includes(term)
				);
			})
			.sort((a, b) => (a.code ?? '').localeCompare(b.code ?? ''));
	}, [allTests, courseById, linkedSet, search]);

	// Solo se puede seleccionar un examen activo: dos activos en el mismo
	// curso chocan (409) y el lote entero haría rollback.
	const selectedActiveTest = candidates.find(
		(T) => T.status && selected.includes(T.id),
	);

	const toggle = (test: test) => {
		setSelected((prev) =>
			prev.includes(test.id)
				? prev.filter((id) => id !== test.id)
				: [...prev, test.id],
		);
	};

	const handleLink = async () => {
		if (!courseId || selected.length === 0) return;
		setSaving(true);
		try {
			const result = await dispatch(
				linkTestToCourse({
					course_id: courseId,
					test_ids: selected,
				}),
			).unwrap();
			const parts = [
				`${result.linked.length} examen(es) vinculado(s) al curso`,
			];
			if (result.skipped.length > 0) {
				parts.push(
					`${result.skipped.length} ya estaba(n) vinculado(s)`,
				);
			}
			toast.success(parts.join('. '));
			setOpen(false);
		} catch (error) {
			toast.error(
				typeof error === 'string'
					? error
					: 'Error al vincular los exámenes',
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
			handler={setOpen}
			size="lg"
		>
			<DialogHeader
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Vincular examen existente
			</DialogHeader>
			<DialogBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				className="flex flex-col gap-3"
			>
				<p className="text-sm text-gray-700">
					Selecciona exámenes de otros cursos de teoría para usarlos en{' '}
					<strong>{courseName ?? 'este curso'}</strong> sin duplicar
					preguntas ni respuestas. Puedes seleccionar varios.
				</p>

				<div className="relative">
					<Search
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
					/>
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Buscar por código o curso dueño"
						className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm"
					/>
				</div>

				{loading ? (
					<div className="flex justify-center py-6">
						<Loader className="h-6 w-6 animate-spin" />
					</div>
				) : candidates.length === 0 ? (
					<p className="py-4 text-center text-sm text-gray-600">
						No hay exámenes disponibles para vincular.
					</p>
				) : (
					<div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
						{candidates.map((T) => {
							const owner = courseById.get(T.course_id);
							const ownerInactive = owner
								? !owner.status
								: false;
							const conflictsWithActive =
								hasActiveTest && T.status;
							const anotherActiveSelected =
								!conflictsWithActive &&
								T.status &&
								!!selectedActiveTest &&
								selectedActiveTest.id !== T.id;
							const disabled =
								conflictsWithActive ||
								anotherActiveSelected;

							return (
								<label
									key={T.id}
									className={`flex items-center justify-between gap-3 rounded-md border p-2 ${
										disabled
											? 'cursor-not-allowed border-gray-200 bg-gray-50 opacity-60'
											: 'cursor-pointer border-gray-300 hover:bg-gray-50'
									}`}
								>
									<div className="flex items-center gap-3">
										<input
											type="checkbox"
											checked={selected.includes(T.id)}
											disabled={disabled}
											onChange={() => toggle(T)}
										/>
										<div>
											<div className="text-sm font-medium">
												{T.code}
											</div>
											<div className="text-xs text-gray-600">
												{owner?.name ??
													`Curso ${T.course_id}`}
												{ownerInactive
													? ' (inactivo)'
													: ''}{' '}
												· {T.duration} min
											</div>
											{conflictsWithActive && (
												<div className="text-xs text-amber-700">
													El curso ya tiene un examen
													activo
												</div>
											)}
											{anotherActiveSelected && (
												<div className="text-xs text-amber-700">
													Solo se puede vincular un
													examen activo
												</div>
											)}
										</div>
									</div>
									<span
										className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
											T.status
												? 'bg-green-100 text-green-800'
												: 'bg-gray-100 text-gray-700'
										}`}
									>
										{T.status ? 'Activo' : 'Inactivo'}
									</span>
								</label>
							);
						})}
					</div>
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
					className="mr-2"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Cancelar
				</Button>
				<Button
					color="green"
					onClick={handleLink}
					disabled={selected.length === 0 || saving || !courseId}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{saving
						? 'Vinculando...'
						: `Vincular${selected.length > 0 ? ` (${selected.length})` : ''}`}
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default LinkTestModal;
