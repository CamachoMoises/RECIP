import { Button } from '@material-tailwind/react';
import {
	BadgeDollarSign,
	Building,
	Coins,
	Drama,
	Landmark,
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
							<Drama size={60} />
						</div>{' '}
						<br />
						Grupos
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
							<Building size={60} />
						</div>{' '}
						<br />
						Empresa
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
							<BadgeDollarSign size={60} />
						</div>{' '}
						<br />
						Formas de pago
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
							<Landmark size={60} />
						</div>{' '}
						<br />
						Bancos
					</Button>
				</div>
				<div>
					<Button
						title="Tasas de cambio"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="flex justify-center">
							<Replace size={60} />
						</div>{' '}
						<br />
						Tasas de Cambio
					</Button>
				</div>
				<div>
					<Button
						title="Impresoras y cajas"
						className="text-center w-40 h-32"
						variant="gradient"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="flex justify-center">
							<Printer size={60} />
						</div>{' '}
						<br />
						Impresoras <br />
						Cajas
					</Button>
				</div>
				<div>
					<Button
						title="Impuestos"
						className="text-center w-40 h-32"
						variant="gradient"
						disabled={true}
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<div className="flex justify-center">
							<Coins size={60} />
						</div>{' '}
						<br />
						Impuestos
					</Button>
				</div>
			</div>
		</>
	);
};

export default Cursos;
