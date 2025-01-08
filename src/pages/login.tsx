import {
	Button,
	Card,
	CardBody,
	CardFooter,
	Input,
	Typography,
} from '@material-tailwind/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../store';
import { credentials } from '../types/utilities';
import { loginUser } from '../features/authSlice';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
type Inputs = {
	email: string;
	password: string;
};
const Login = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch<AppDispatch>();
	const auth = useSelector((state: RootState) => {
		return state.auth;
	});
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<Inputs>({});
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		console.log(data);
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

	return (
		<>
			<div className="fixed left-8 z-20 mt-10">
				<video
					className="rounded-lg shadow-lg"
					width="550"
					height="550"
					loop
					autoPlay
					muted
				>
					<source
						src="/video/video_background.mp4"
						type="video/mp4"
					/>
					Tu navegador no soporta el elemento de video.
				</video>
			</div>
			<div className="flex flex-row w-full fixed justify-center my-16 ms-32">
				<Card
					className="w-96"
					shadow={true}
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
						{/* <code>{JSON.stringify(auth.error, null, 4)}</code>
						<code>{JSON.stringify(auth.status, null, 4)}</code> */}
						<form onSubmit={handleSubmit(onSubmit)}>
							<div className="mb-1 flex flex-col gap-12 mt-14">
								<div>
									<Input
										type="email"
										size="lg"
										maxLength={254}
										className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
										crossOrigin={undefined}
										placeholder="nombre@correo.com"
										label="Correo"
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										{...register('email', {
											required: {
												value: true,
												message: 'El Correo es requerido',
											},
										})}
									/>
									{errors.email && (
										<span className="text-red-500 text-sm/[8px] py-2">
											{errors.email.message}
										</span>
									)}
								</div>
								<div>
									<Input
										size="lg"
										type="password"
										className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
										crossOrigin={undefined}
										maxLength={20}
										label="Contraseña"
										placeholder="********"
										{...register('password', {
											required: {
												value: true,
												message: 'La contraseña es requerida',
											},
										})}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									/>
									{errors.password && (
										<span className="text-red-500 text-sm/[8px] py-2">
											{errors.password.message}
										</span>
									)}
								</div>
							</div>
							<Button
								type="submit"
								color="blue-gray"
								className="mt-6 flex justify-center"
								fullWidth
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
								// onClick={() => {
								// 	navigate('../dashboard');
								// }}
							>
								Ingresar
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
						{/* <span className="text-red-500 text-center w-full">
							Acceso no autorizado
						</span> */}{' '}
					</CardFooter>
				</Card>
			</div>
		</>
	);
};

export default Login;
