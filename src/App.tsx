import { Typography } from '@material-tailwind/react';
import { Counter } from './features/counter/Counter';

function App() {
	return (
		<div className="w-full text-center bg-tahiti-400 h-screen">
			<Typography
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
				variant="h3"
			>
				Hello world!
			</Typography>
			<Counter />
		</div>
	);
}

export default App;
