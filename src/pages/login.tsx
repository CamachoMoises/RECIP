import {
	Button,
	Card,
	CardBody,
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
import { EyeIcon, EyeOff, Plane } from 'lucide-react';
import '../styles/global.css';
import { useTheme } from '../hooks/useTheme';

type Inputs = {
	email: string;
	password: string;
};

const Login = () => {
	const navigate = useNavigate();
	const { theme } = useTheme();
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

	return (
		<div className="flex flex-col sm:flex-row items-center justify-center gap-8 min-h-screen p-4 relative overflow-hidden">
			<div className="absolute inset-0 aviation-gradient opacity-20" />
			<div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl opacity-10 animate-float" />
			<div
				className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl opacity-10 animate-float"
				style={{ animationDelay: '-2s' }}
			/>

			<div className="order-2 sm:order-1 w-full sm:w-auto flex justify-center animate-scale-in">
				<div className="relative">
					<video
						className="rounded-2xl shadow-2xl shadow-blue-500/20 w-full max-w-md border-2 border-blue-500/30"
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
			</div>

			<div
				className="order-1 sm:order-2 w-full max-w-sm animate-fade-up"
				style={{ animationDelay: '0.2s' }}
			>
				<Card
					className="glass-panel border-2 border-blue-500/20 shadow-2xl shadow-blue-500/10"
					style={{
						background:
							theme === 'dark'
								? 'rgba(30, 41, 59, 0.95)'
								: 'rgba(255, 255, 255, 0.95)',
					}}
				>
					<CardBody className="flex flex-col gap-6 p-8">
						<div className="text-center">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 mb-4 shadow-lg shadow-blue-500/30">
								<Plane className="w-8 h-8 text-white" />
							</div>
							<Typography
								variant="h2"
								className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								R.E.C.I.P.
							</Typography>
							<Typography
								variant="paragraph"
								className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'}`}
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Ingresa a tu cuenta
							</Typography>
						</div>

						<form
							onSubmit={handleSubmit(onSubmit)}
							autoComplete="off"
							className="flex flex-col gap-5"
						>
							<div>
								<Input
									crossOrigin={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="email"
									size="lg"
									maxLength={254}
									className="glass-input !bg-white/90 !text-gray-800"
									placeholder="correo@ejemplo.com"
									labelProps={{ className: 'text-gray-500' }}
									{...register('email', {
										required: {
											value: true,
											message: 'El correo es requerido',
										},
									})}
								/>
								{errors.email && (
									<span className="text-red-500 text-sm mt-2 block">
										{errors.email.message}
									</span>
								)}
							</div>

							<div>
								<div className="relative">
									<Input
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
										crossOrigin={undefined}
										size="lg"
										autoComplete="new-password"
										className="glass-input !bg-white/90 !text-gray-800 pr-12"
										maxLength={20}
										labelProps={{ className: 'text-gray-500' }}
										type={passwordShown ? 'text' : 'password'}
										placeholder="••••••••"
										{...register('password', {
											required: {
												value: true,
												message: 'La contraseña es requerida',
											},
										})}
									/>
									<button
										type="button"
										className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
										onClick={() => setPasswordShown(!passwordShown)}
									>
										{passwordShown ? (
											<EyeOff className="h-5 w-5" />
										) : (
											<EyeIcon className="h-5 w-5" />
										)}
									</button>
								</div>
								{errors.password && (
									<span className="text-red-500 text-sm mt-2 block">
										{errors.password.message}
									</span>
								)}
							</div>

							<Button
								type="submit"
								className="glass-button py-3 text-base shadow-lg shadow-blue-500/20"
								fullWidth
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								<span className="flex items-center justify-center gap-2">
									<Plane className="w-4 h-4" />
									Iniciar Sesión
								</span>
							</Button>
						</form>

						<div className="text-center pt-2 border-t border-gray-200">
							<Typography
								variant="small"
								className="text-gray-400"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								Registro de Evaluación, Capacitación e instrucción del
								Piloto
							</Typography>
						</div>
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default Login;
