import { useEffect, useState } from 'react';
import {
	Button,
	Card,
	CardBody,
	Collapse,
	Typography,
} from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../hooks/useTheme';
import { AppDispatch, RootState } from '../../../store';
import {
	fetchReportTests,
	resetTestReport,
} from '../../../features/testReportSlice';
import { testReportRow } from '../../../types/utilities';
import {
	AlertCircle,
	BookOpenCheck,
	ChevronDown,
	ChevronUp,
	Loader,
	Search,
} from 'lucide-react';
import TestReportDetailDialog from './TestReportDetailDialog';

const TestReportsPanel = () => {
	const { theme } = useTheme();
	const dispatch = useDispatch<AppDispatch>();
	const { testList, status, error } = useSelector(
		(state: RootState) => state.testReports,
	);
	const [open, setOpen] = useState(false);
	const [selected, setSelected] = useState<testReportRow | null>(null);
	const [onlyActive, setOnlyActive] = useState<boolean | undefined>(undefined);
	const [courseFilter, setCourseFilter] = useState('');
	const [appliedCourse, setAppliedCourse] = useState<number | undefined>(
		undefined,
	);

	useEffect(() => {
		if (open) {
			dispatch(
				fetchReportTests({
					status: onlyActive,
					course_id: appliedCourse,
				}),
			);
		}
	}, [open, onlyActive, appliedCourse, dispatch]);

	useEffect(() => {
		return () => {
			dispatch(resetTestReport());
		};
	}, [dispatch]);

	const applyCourseFilter = () => {
		const parsed = parseInt(courseFilter, 10);
		setAppliedCourse(Number.isNaN(parsed) ? undefined : parsed);
	};

	return (
		<Card
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<CardBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Button
					fullWidth
					color="blue"
					variant="outlined"
					onClick={() => setOpen(!open)}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="flex items-center justify-center gap-2"
				>
					<BookOpenCheck className="w-4 h-4" />
					Reportes de Exámenes
					{open ? (
						<ChevronUp className="w-4 h-4" />
					) : (
						<ChevronDown className="w-4 h-4" />
					)}
				</Button>

				<Collapse open={open}>
					<div className="mt-4 flex flex-col gap-3">
						<div className="flex flex-wrap items-end gap-2">
							<div className="w-40">
								<Typography
									variant="small"
									color="gray"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Estado
								</Typography>
								<select
									value={
										onlyActive === undefined
											? 'all'
											: onlyActive
												? 'true'
												: 'false'
									}
									onChange={(e) => {
										const v = e.target.value;
										setOnlyActive(
											v === 'all' ? undefined : v === 'true',
										);
									}}
									className={`w-full text-sm rounded-lg border px-2 py-1.5 ${
										theme === 'dark'
											? 'bg-gray-800 border-gray-600 text-white'
											: 'bg-white border-gray-300 text-gray-800'
									}`}
								>
									<option value="all">Todos</option>
									<option value="true">Activos</option>
									<option value="false">Inactivos</option>
								</select>
							</div>

							<div className="w-40">
								<Typography
									variant="small"
									color="gray"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									ID de curso
								</Typography>
								<input
									type="number"
									value={courseFilter}
									onChange={(e) => setCourseFilter(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') applyCourseFilter();
									}}
									placeholder="Todos"
									className={`w-full text-sm rounded-lg border px-2 py-1.5 ${
										theme === 'dark'
											? 'bg-gray-800 border-gray-600 text-white'
											: 'bg-white border-gray-300 text-gray-800'
									}`}
								/>
							</div>

							<Button
								size="sm"
								color="blue"
								variant="outlined"
								className="flex items-center gap-1"
								onClick={applyCourseFilter}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<Search size={14} /> Filtrar
							</Button>
						</div>

						{status === 'loading' && (
							<div className="flex justify-center py-4">
								<Loader className="w-6 h-6 animate-spin" />
							</div>
						)}

						{status === 'failed' && (
							<div className="flex items-center gap-2 justify-center py-4">
								<AlertCircle className="w-5 h-5 text-red-500" />
								<Typography
									variant="small"
									color="red"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{error}
								</Typography>
							</div>
						)}

						{status === 'succeeded' && testList.length === 0 && (
							<Typography
								variant="h6"
								color="gray"
								className="text-center"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								No hay exámenes para este filtro
							</Typography>
						)}

						{status === 'succeeded' && testList.length > 0 && (
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr
											className={`border-b ${
												theme === 'dark'
													? 'border-gray-600'
													: 'border-gray-300'
											}`}
										>
											<th className="text-center py-2 px-2 font-medium">
												Código
											</th>
											<th className="text-center py-2 px-2 font-medium">
												Curso
											</th>
											<th className="text-center py-2 px-2 font-medium">
												Preguntas
											</th>
											<th className="text-center py-2 px-2 font-medium">
												Intentos
											</th>
											<th className="text-center py-2 px-2 font-medium">
												Mínimo
											</th>
											<th className="text-center py-2 px-2 font-medium">
												Estado
											</th>
											<th className="text-center py-2 px-2 font-medium">
												Acción
											</th>
										</tr>
									</thead>
									<tbody>
										{testList.map((t) => (
											<tr
												key={t.id}
												className={`border-b ${
													theme === 'dark'
														? 'border-gray-700 hover:bg-gray-800'
														: 'border-gray-200 hover:bg-gray-50'
												}`}
											>
												<td className="py-2 px-2">{t.code}</td>
												<td className="py-2 px-2">
													{t.course?.name ?? '—'}
												</td>
												<td className="py-2 px-2 text-center">
													{t.question_count}
												</td>
												<td className="py-2 px-2 text-center">
													{t.attempt_count}
												</td>
												<td className="py-2 px-2 text-center">
													{t.min_score}
												</td>
												<td className="py-2 px-2 text-center">
													{t.status ? 'Activo' : 'Inactivo'}
												</td>
												<td className="py-2 px-2 text-center">
													<Button
														size="sm"
														color="blue"
														variant="text"
														onClick={() => setSelected(t)}
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														Ver reporte
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</Collapse>
			</CardBody>

			<TestReportDetailDialog
				open={selected !== null}
				test={selected}
				onClose={() => setSelected(null)}
			/>
		</Card>
	);
};

export default TestReportsPanel;
