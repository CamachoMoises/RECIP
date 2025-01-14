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

const Icons = () => {
	const navigate = useNavigate();

	return (
		<div>
			<div className="grid grid-cols-1 d:grid-cols-2 lg:grid-cols-4 gap-y-6 text-center px-3">
				<div>
					<Button
						title="Usuarios"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={() => navigate('users')}
					>
						<div className="flex justify-center">
							<UserRound size={60} />
						</div>{' '}
						<br />
						Usuarios
					</Button>
				</div>
				<div>
					<Button
						title="Grupos"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={() => navigate('courses')}
					>
						<div className="flex justify-center">
							<Newspaper size={60} />
						</div>{' '}
						<br />
						Cursos
					</Button>
				</div>
				<div>
					<Button
						title="Pilotos"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={() => navigate('students')}
					>
						<div className="flex justify-center">
							<Plane size={50} />
						</div>{' '}
						<br />
						Pilotos / Participantes
					</Button>
				</div>
				<div>
					<Button
						title="Formas de pago"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={() => navigate('instructors')}
					>
						<div className="flex justify-center">
							<Presentation size={60} />
						</div>{' '}
						<br />
						Instructores
					</Button>
				</div>
				<div>
					<Button
						title="Reportes"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="flex justify-center">
							<NotebookText size={60} />
						</div>{' '}
						<br />
						Reportes
					</Button>
				</div>
				<div>
					<Button
						title="Examenes"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={() => navigate('test')}
					>
						<div className="flex justify-center">
							<BookOpenCheck size={60} />
						</div>{' '}
						<br />
						Examenes
					</Button>
				</div>
				<div>
					<Button
						title="Evaluacion"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={() => navigate('assessment')}
					>
						<div className="flex justify-center">
							<NotebookPen size={60} />
						</div>{' '}
						<br />
						Evaluaciones
					</Button>
				</div>
				<div>
					<Button
						title="Configuracion"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
						onClick={() => navigate('config')}
					>
						<div className="flex justify-center">
							<Cog size={60} />
						</div>{' '}
						<br />
						Configuracion
					</Button>
				</div>
			</div>
		</div>
	);
};

export default Icons;
