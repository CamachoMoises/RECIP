import React from 'react';
import {
	Accordion,
	AccordionHeader,
	AccordionBody,
} from '@material-tailwind/react';
import { ServerCrash } from 'lucide-react';

interface ErrorPageProps {
	error: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error }) => {
	const [open, setOpen] = React.useState(false);

	const handleOpen = () => setOpen(!open);

	return (
		<div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-100 p-4">
			{/* Imagen de desconexión */}
			<div className="flex flex-col items-center mb-6">
				<ServerCrash size={100} />

				<h1 className="text-2xl font-bold text-gray-700">
					Error de Conexión
				</h1>
				<p className="text-gray-600">
					No se pudieron cargar los datos. Por favor, intenta
					nuevamente.
				</p>
			</div>

			{/* Accordion para mostrar el error */}
			<Accordion
				open={open}
				className="w-full max-w-md"
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<AccordionHeader
					onClick={handleOpen}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<span className="text-gray-700 font-semibold">
						Detalles del Error
					</span>
				</AccordionHeader>
				<AccordionBody>
					<p className="text-red-600">{error}</p>
				</AccordionBody>
			</Accordion>
		</div>
	);
};

export default ErrorPage;