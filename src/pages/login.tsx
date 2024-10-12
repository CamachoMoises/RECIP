import {
	Button,
	Card,
	CardBody,
	CardFooter,
	CardHeader,
	Input,
	Typography,
} from '@material-tailwind/react';
import { KeyRound } from 'lucide-react';

const Login = () => {
	return (
		<>
			<div className="flex flex-row w-full justify-center my-5">
				<Card
					className="w-96"
					shadow={true}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<CardHeader
						variant="gradient"
						color="gray"
						className="mb-4 grid h-28 place-items-center"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Typography
							variant="h3"
							color="white"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Iniciar sesión
						</Typography>
					</CardHeader>
					<CardBody
						className="flex flex-col gap-4"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<form>
							<div className="mb-1 flex flex-col gap-6">
								<Typography
									variant="h6"
									color="blue-gray"
									className="-mb-3"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Correo
								</Typography>
								<Input
									type="email"
									size="lg"
									maxLength={254}
									crossOrigin={undefined}
									name="Correo"
									placeholder="nombre@joyarteydecoracion.com"
									className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								/>
								<Typography
									variant="h6"
									color="blue-gray"
									className="-mb-3"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Contraseña
								</Typography>
								<Input
									name="password"
									size="lg"
									crossOrigin={undefined}
									maxLength={20}
									placeholder="********"
									className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
									labelProps={{
										className:
											'before:content-none after:content-none',
									}}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								/>
							</div>
							<Button
								type="submit"
								className="mt-6 flex justify-center"
								fullWidth
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<KeyRound />
							</Button>
						</form>
					</CardBody>
					<CardFooter
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						{/* {errors.length > 0 && (
							<span className="text-red-500 text-center w-full">
								Acceso no autorizado
							</span>
						)} */}
						<span className="text-red-500 text-center w-full">
							Acceso no autorizado
						</span>
					</CardFooter>
				</Card>
			</div>
		</>
	);
};

export default Login;
