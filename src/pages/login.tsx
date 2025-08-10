import {
	Button,
	Card,
	CardBody,
	// CardFooter,
	Input,
	Typography,
} from '@material-tailwind/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { credentials } from '../types/utilities';
import { loginUser } from '../features/authSlice';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EyeIcon, EyeOff } from 'lucide-react';

type Inputs = {
	email: string;
	password: string;
};

const Login = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const auth = useSelector((state: RootState) => state.auth);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>({});

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const req: credentials = {
			email: data.email,
			password: data.password,
		};
		await dispatch(loginUser(req)).unwrap();
	};

	useEffect(() => {
		if (auth.token) {
			toast.success('Bienvenido');
			navigate('/dashboard');
		}
	}, [auth.token, navigate]);

	useEffect(() => {
		if (auth.status === 'failed') {
			toast.error(auth.error);
		}
	}, [auth.status, auth.error]);
	const [passwordShown, setPasswordShown] = useState(false);
	const togglePasswordVisiblity = () => {
		setPasswordShown((cur) => !cur);
		setTimeout(() => {
			setPasswordShown(false);
		}, 1000);
	};
	return (
		<div className="flex flex-col sm:flex-row items-center justify-center gap-8 min-h-screen">
			{/* Video */}
			<div className="order-2 sm:order-1 w-full sm:w-auto flex justify-center">
				<video
					className="rounded-lg shadow-lg w-full max-w-md"
					loop
					autoPlay
					muted
				>
					<source
						src="https://res.cloudinary.com/moisesinc/video/upload/v1751816208/recip_resource/avion2_drrbld.mp4"
						type="video/mp4"
					/>
					Tu navegador no soporta el elemento de video.
				</video>
			</div>

			{/* Formulario */}
			<div className="order-1 sm:order-2 w-full max-w-sm">
				<Card
					className="w-full shadow-lg"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<CardBody
						className="flex flex-col gap-4"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<Typography
							variant="h2"
							color="black"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Iniciar sesión
						</Typography>
						<form
							onSubmit={handleSubmit(onSubmit)}
							autoComplete="off"
						>
							<div className="mb-1 flex flex-col gap-6 mt-8">
								<div>
									<Input
										crossOrigin={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										type="email"
										size="lg"
										maxLength={254}
										className="bg-slate-400 rounded-md p-2 w-full mb-2 text-slate-900"
										placeholder="nombre@correo.com"
										label="Correo"
										{...register('email', {
											required: {
												value: true,
												message: 'El Correo es requerido',
											},
										})}
									/>
									{errors.email && (
										<span className="text-red-500 text-sm py-2">
											{errors.email.message}
										</span>
									)}
								</div>
								<div>
									<Input
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
										size="lg"
										autoComplete="new-password"
										className="bg-slate-400 rounded-md p-2 w-full mb-2 text-slate-900"
										maxLength={20}
										label="Contraseña"
										type={passwordShown ? 'text' : 'password'}
										icon={
											<i onClick={togglePasswordVisiblity}>
												{passwordShown ? (
													<EyeIcon className="h-5 w-5" />
												) : (
													<EyeOff className="h-5 w-5" />
												)}
											</i>
										}
										placeholder="********"
										{...register('password', {
											required: {
												value: true,
												message: 'La contraseña es requerida',
											},
										})}
									/>
									{errors.password && (
										<span className="text-red-500 text-sm py-2">
											{errors.password.message}
										</span>
									)}
								</div>
							</div>
							<Button
								type="submit"
								color="blue-gray"
								className="mt-6"
								fullWidth
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								onClick={() => {
									//mostrar un toast indicando la consulta
									toast.success('Iniciando sesión...');
								}}
							>
								Ingresar
							</Button>
						</form>
					</CardBody>
					{/* <CardFooter>Opcional: mensajes de error</CardFooter> */}
				</Card>
			</div>
		</div>
	);
};

export default Login;
