import { Link } from 'react-router-dom'; // O usa `next/link` si es Next.js
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
			<AlertTriangle size={64} className="text-red-500 mb-4" />
			<h1 className="text-4xl font-bold mb-2">
				404 - Página no encontrada
			</h1>
			<p className="text-gray-600 mb-6">
				La página que estás buscando no existe o ha sido movida.
			</p>
			<Link
				to="/dashboard"
				className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
			>
				Volver al inicio
			</Link>
		</div>
	);
};

export default NotFound;
