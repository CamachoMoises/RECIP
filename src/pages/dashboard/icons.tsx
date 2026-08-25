import {
	BookOpenCheck,
	Cog,
	Mailbox,
	Newspaper,
	NotebookPen,
	NotebookText,
	Plane,
	Presentation,
	UserRound,
	GraduationCap,
	ClipboardList,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PermissionsValidate } from '../../services/permissionsValidate';
import SuggestionDialog from './suggestions/SuggestionDialog';
import '../../styles/global.css';

interface IconItem {
	id: string;
	title: string;
	icon: typeof UserRound;
	permission: ('staff' | 'instructor' | 'student' | 'super_user')[];
	route: string | null;
	color: string;
}

const sections: { label: string; items: IconItem[] }[] = [
	{
		label: 'Mis Cursos',
		items: [
			{
				id: 'my-instructor-courses',
				title: 'Mis Cursos (Instructor)',
				icon: ClipboardList,
				permission: ['instructor'],
				route: 'my-instructor-courses',
				color: 'from-indigo-600 to-indigo-800',
			},
			{
				id: 'my-courses',
				title: 'Mis Cursos (Alumno)',
				icon: GraduationCap,
				permission: ['student'],
				route: 'my-courses',
				color: 'from-indigo-600 to-indigo-800',
			},
		],
	},
	{
		label: 'Evaluación y Exámenes',
		items: [
			{
				id: 'assessment',
				title: 'Evaluaciones FSTD / ATD',
				icon: NotebookPen,
				permission: ['instructor'],
				route: 'assessment',
				color: 'from-indigo-600 to-indigo-800',
			},
			{
				id: 'tests',
				title: 'Exámenes',
				icon: BookOpenCheck,
				permission: ['student', 'instructor'],
				route: 'test',
				color: 'from-indigo-600 to-indigo-800',
			},
		],
	},
	{
		label: 'Comunicación',
		items: [
			{
				id: 'suggestions',
				title: 'Sugerencias',
				icon: Mailbox,
				permission: ['instructor', 'student', 'staff'],
				route: 'suggestions',
				color: 'from-indigo-600 to-indigo-800',
			},
			{
				id: 'records',
				title: 'Reportes',
				icon: NotebookText,
				permission: ['super_user'],
				route: 'reports',
				color: 'from-indigo-600 to-indigo-800',
			},
		],
	},
	{
		label: 'Gestión',
		items: [
			{
				id: 'users',
				title: 'Administradores',
				icon: UserRound,
				permission: ['staff'],
				route: 'users',
				color: 'from-indigo-600 to-indigo-800',
			},
			{
				id: 'courses',
				title: 'Gestión Cursos',
				icon: Newspaper,
				permission: ['staff', 'instructor'],
				route: 'courses',
				color: 'from-indigo-600 to-indigo-800',
			},
			{
				id: 'students',
				title: 'Pilotos / Participantes',
				icon: Plane,
				permission: ['staff'],
				route: 'students',
				color: 'from-indigo-600 to-indigo-800',
			},
			{
				id: 'instructors',
				title: 'Instructores',
				icon: Presentation,
				permission: ['instructor', 'staff'],
				route: 'instructors',
				color: 'from-indigo-600 to-indigo-800',
			},
			{
				id: 'config',
				title: 'Configuración',
				icon: Cog,
				permission: ['staff'],
				route: 'config',
				color: 'from-indigo-600 to-indigo-800',
			},
		],
	},
];

const Icons = () => {
	const navigate = useNavigate();
	const [suggestionOpen, setSuggestionOpen] = useState(false);

	const handleClick = (item: IconItem) => {
		if (item.id === 'suggestions') {
			setSuggestionOpen(true);
		} else if (item.route) {
			navigate(item.route);
		}
	};

	return (
		<>
			<div className="p-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
					{sections.map((section) => {
						const visibleItems = section.items.filter((item) =>
							PermissionsValidate(item.permission),
						);
						if (visibleItems.length === 0) return null;
						return (
							<div
								key={section.label}
								className="rounded-2xl p-4"
								style={{
									background: 'var(--bg-card)',
									border: '1px solid var(--glass-border)',
								}}
							>
								<p className="text-xs font-semibold uppercase tracking-wider mb-3 opacity-60">
									{section.label}
								</p>
								<div className="grid grid-cols-2 gap-3">
									{section.items.map((item) => {
										const isDisabled = !PermissionsValidate(
											item.permission,
										);
										const IconComponent = item.icon;

										return (
											<button
												key={item.id}
												type="button"
												disabled={isDisabled}
												onClick={() => handleClick(item)}
												className={`group flex flex-col items-center gap-2 rounded-xl p-3 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
													isDisabled
														? 'opacity-25 cursor-not-allowed'
														: 'hover:scale-105 hover:shadow-lg'
												}`}
											>
												<div
													className={`flex items-center justify-center rounded-xl bg-gradient-to-br ${item.color} w-11 h-11 shadow-md transition-shadow group-hover:shadow-xl`}
												>
													<IconComponent
														size={22}
														className="text-white"
													/>
												</div>
												<span className="text-[10px] sm:text-[11px] font-medium text-center leading-tight opacity-80">
													{item.title}
												</span>
											</button>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>

				<div
					className="mt-8 text-center animate-fade-up"
					style={{ animationDelay: '0.8s' }}
				>
					<div className="inline-flex items-center gap-2 glass-panel-dark px-6 py-3">
						<Plane className="w-5 h-5 text-blue-400" />
						<span className="text-blue-200 font-medium">
							Sistema de instrucción y entrenamiento
						</span>
					</div>
				</div>
			</div>
			<SuggestionDialog
				open={suggestionOpen}
				handler={() => setSuggestionOpen(!suggestionOpen)}
			/>
		</>
	);
};

export default Icons;
