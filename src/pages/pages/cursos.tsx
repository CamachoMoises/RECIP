import { Button } from '@material-tailwind/react';
import {
	BadgeDollarSign,
	Building,
	Coins,
	Drama,
	GraduationCap,
	Landmark,
	Newspaper,
	NotebookText,
	Presentation,
	Printer,
	Replace,
	UserRound,
} from 'lucide-react';
import React from 'react';

const Cursos = () => {
	return (
		<>
			{/* <PageTitle title="Configuración" breadCrumbs={[]} /> */}

			<div className="grid grid-cols-1 d:grid-cols-2 lg:grid-cols-4 gap-y-6 text-center px-3 py-6">
				<div>
					<Button
						title="Usuarios"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
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
						title="Empresa"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="flex justify-center">
							<GraduationCap size={60} />
						</div>{' '}
						<br />
						Estudiantes
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
						title="Bancos"
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
						reportes
					</Button>
				</div>
			</div>
		</>
	);
};

export default Cursos;
