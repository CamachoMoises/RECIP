import {
	Button,
	Card,
	CardBody,
	Collapse,
	List,
	ListItem,
	Typography,
} from '@material-tailwind/react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../hooks/useTheme';
import PageTitle from '../../../components/PageTitle';
import { AppDispatch, RootState } from '../../../store';
import { fetchSuggestions } from '../../../features/userSlice';
import { BarChart3, FileText, TrendingUp, Mailbox, ChevronDown, ChevronUp } from 'lucide-react';
import EmailHistoryPanel from './EmailHistoryPanel';

const breadCrumbs = [
	{ name: 'Dashboard', href: '/dashboard' },
];

const Reports = () => {
	const { theme } = useTheme();
	const dispatch = useDispatch<AppDispatch>();
	const { userLogged, suggestionList } = useSelector(
		(state: RootState) => state.users,
	);
	const [suggestionsOpen, setSuggestionsOpen] = useState(false);

	const isAdmin = userLogged?.is_superuser === true;

	useEffect(() => {
		if (suggestionsOpen) {
			dispatch(fetchSuggestions());
		}
	}, [suggestionsOpen, dispatch]);

	return (
		<div className="p-4 animate-fade-up">
			<PageTitle title="Reportes" breadCrumbs={breadCrumbs} />

			<div className="mb-8">
				<Typography
					variant="paragraph"
					className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Estadísticas y reportes del sistema
				</Typography>
			</div>

			{/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="glass-panel p-6 rounded-xl hover:shadow-xl transition-all duration-300">
					<div className="flex items-center gap-4 mb-4">
						<div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg">
							<BarChart3 className="w-6 h-6 text-white" />
						</div>
						<Typography
							variant="h5"
							className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Estadísticas
						</Typography>
					</div>
					<Typography
						variant="paragraph"
						className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Visualiza estadísticas generales del sistema, rendimiento de estudiantes y más.
					</Typography>
				</div>

				<div className="glass-panel p-6 rounded-xl hover:shadow-xl transition-all duration-300">
					<div className="flex items-center gap-4 mb-4">
						<div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg">
							<FileText className="w-6 h-6 text-white" />
						</div>
						<Typography
							variant="h5"
							className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Reportes PDF
						</Typography>
					</div>
					<Typography
						variant="paragraph"
						className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Genera reportes en PDF con los datos de cursos, estudiantes y evaluaciones.
					</Typography>
				</div>

				<div className="glass-panel p-6 rounded-xl hover:shadow-xl transition-all duration-300">
					<div className="flex items-center gap-4 mb-4">
						<div className="p-3 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 shadow-lg">
							<TrendingUp className="w-6 h-6 text-white" />
						</div>
						<Typography
							variant="h5"
							className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Progreso
						</Typography>
					</div>
					<Typography
						variant="paragraph"
						className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Seguimiento del progreso de estudiantes por curso y materia.
					</Typography>
				</div>
			</div> */}

			{isAdmin && (
				<div className="mt-6">
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
								onClick={() => setSuggestionsOpen(!suggestionsOpen)}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								className="flex items-center justify-center gap-2"
							>
								<Mailbox className="w-4 h-4" />
								Ver Sugerencias
								{suggestionsOpen ? (
									<ChevronUp className="w-4 h-4" />
								) : (
									<ChevronDown className="w-4 h-4" />
								)}
							</Button>

							<Collapse open={suggestionsOpen}>
								<div className="mt-4">
									{suggestionList.length === 0 ? (
										<Typography
											variant="h6"
											color="gray"
											className="text-center"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											No hay sugerencias aún
										</Typography>
									) : (
										<List
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{suggestionList.map((s) => (
												<ListItem
													key={s.id}
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													className="flex flex-col items-start"
												>
													<Typography
														variant="h6"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{s.title}
													</Typography>
													<Typography
														variant="small"
														color="gray"
														className="mt-1"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{s.description}
													</Typography>
													{s.user && (
														<Typography
															variant="small"
															color="blue-gray"
															className="mt-2 font-medium"
															placeholder={undefined}
															onPointerEnterCapture={undefined}
															onPointerLeaveCapture={undefined}
														>
															Enviado por: {s.user.name} {s.user.last_name}
														</Typography>
													)}
												</ListItem>
											))}
										</List>
									)}
								</div>
							</Collapse>
						</CardBody>
					</Card>
				</div>
			)}

			{isAdmin && (
				<div className="mt-6">
					<EmailHistoryPanel />
				</div>
			)}
		</div>
	);
};

export default Reports;
