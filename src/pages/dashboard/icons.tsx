import { Button } from '@material-tailwind/react';
import {
	BookOpenCheck,
	Cog,
	Newspaper,
	NotebookPen,
	NotebookText,
	Plane,
	Presentation,
	UserRound,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PermissionsValidate } from '../../services/permissionsValidate';
import '../../styles/global.css';

const iconItems: Array<{
	id: string;
	title: string;
	icon: typeof UserRound;
	permission: ('staff' | 'instructor' | 'student' | 'super_user')[];
	route: string | null;
	color: string;
}> = [
	{
		id: 'users',
		title: 'Administradores',
		icon: UserRound,
		permission: ['staff'],
		route: 'users',
		color: 'from-blue-600 to-blue-800',
	},
	{
		id: 'courses',
		title: 'Cursos',
		icon: Newspaper,
		permission: ['staff', 'instructor', 'student'],
		route: 'courses',
		color: 'from-emerald-600 to-emerald-800',
	},
	{
		id: 'students',
		title: 'Pilotos / Participantes',
		icon: Plane,
		permission: ['staff'],
		route: 'students',
		color: 'from-sky-600 to-sky-800',
	},
	{
		id: 'instructors',
		title: 'Instructores',
		icon: Presentation,
		permission: ['instructor', 'staff'],
		route: 'instructors',
		color: 'from-violet-600 to-violet-800',
	},
	{
		id: 'records',
		title: 'Registros',
		icon: NotebookText,
		permission: ['super_user'],
		route: null,
		color: 'from-amber-600 to-amber-800',
	},
	{
		id: 'tests',
		title: 'Exámenes',
		icon: BookOpenCheck,
		permission: ['student', 'instructor'],
		route: 'test',
		color: 'from-rose-600 to-rose-800',
	},
	{
		id: 'assessment',
		title: 'Evaluaciones FSTD / ATD',
		icon: NotebookPen,
		permission: ['instructor'],
		route: 'assessment',
		color: 'from-cyan-600 to-cyan-800',
	},
	{
		id: 'config',
		title: 'Configuración Cursos',
		icon: Cog,
		permission: ['staff'],
		route: 'config',
		color: 'from-slate-600 to-slate-800',
	},
];

const Icons = () => {
	const navigate = useNavigate();

	return (
		<div className="p-4">
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{iconItems.map((item) => {
					const isDisabled = !PermissionsValidate(item.permission);
					const IconComponent = item.icon;

					return (
						<div
							key={item.id}
							className="animate-fade-up"
							style={{
								animationDelay: `${iconItems.indexOf(item) * 0.1}s`,
							}}
						>
							<Button
								title={item.title}
								className={`text-center h-36 w-full transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
									isDisabled ? 'opacity-50 cursor-not-allowed' : ''
								}`}
								variant="gradient"
								color="blue"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								disabled={isDisabled}
								onPointerLeaveCapture={undefined}
								onClick={() => item.route && navigate(item.route)}
							>
								<div className="flex flex-col items-center gap-3">
									<div
										className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}
									>
										<IconComponent size={36} className="text-white" />
									</div>
									<span className="text-sm font-semibold leading-tight">
										{item.title}
									</span>
								</div>
							</Button>
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
	);
};

export default Icons;
