import React from 'react';
import { Spinner } from '@material-tailwind/react';

const LoadingPage: React.FC = () => {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
			{/* Spinner */}
			<Spinner
				className="h-16 w-16 text-blue-500"
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			/>
			<p className="mt-4 text-gray-700 text-lg font-semibold">
				Cargando datos...
			</p>
		</div>
	);
};

export default LoadingPage;
