import { useEffect, useState } from 'react';
import {
	Typography,
	IconButton,
	Collapse,
	Menu,
	MenuHandler,
	Avatar,
	MenuList,
	MenuItem,
} from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../features/authSlice';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
interface menuItems {
	id: string;
	icon: React.ReactNode;
	label: string;
	disabled: boolean;
	action?: (() => void) | null;
}
const NavBar = () => {
	const location = useLocation();
	const [openNav, setOpenNav] = useState(false);
	const auth = useSelector((state: RootState) => state.auth);
	const dispatch = useDispatch<AppDispatch>();
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768) {
				setOpenNav(false);
			}
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Elementos del menú para reutilizar en desktop y mobile
	const menuItems: menuItems[] = [
		// {
		// 	id: 'profile',
		// 	icon: (
		// 		<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
		// 			<path
		// 				fillRule="evenodd"
		// 				clipRule="evenodd"
		// 				d="M16 8C16 10.1217 15.1571 12.1566 13.6569 13.6569C12.1566 15.1571 10.1217 16 8 16C5.87827 16 3.84344 15.1571 2.34315 13.6569C0.842855 12.1566 0 10.1217 0 8C0 5.87827 0.842855 3.84344 2.34315 2.34315C3.84344 0.842855 5.87827 0 8 0C10.1217 0 12.1566 0.842855 13.6569 2.34315C15.1571 3.84344 16 5.87827 16 8ZM10 5C10 5.53043 9.78929 6.03914 9.41421 6.41421C9.03914 6.78929 8.53043 7 8 7C7.46957 7 6.96086 6.78929 6.58579 6.41421C6.21071 6.03914 6 5.53043 6 5C6 4.46957 6.21071 3.96086 6.58579 3.58579C6.96086 3.21071 7.46957 3 8 3C8.53043 3 9.03914 3.21071 9.41421 3.58579C9.78929 3.96086 10 4.46957 10 5ZM8 9C7.0426 8.99981 6.10528 9.27449 5.29942 9.7914C4.49356 10.3083 3.85304 11.0457 3.454 11.916C4.01668 12.5706 4.71427 13.0958 5.49894 13.4555C6.28362 13.8152 7.13681 14.0009 8 14C8.86319 14.0009 9.71638 13.8152 10.5011 13.4555C11.2857 13.0958 11.9833 12.5706 12.546 11.916C12.147 11.0457 11.5064 10.3083 10.7006 9.7914C9.89472 9.27449 8.9574 8.99981 8 9Z"
		// 				fill="#90A4AE"
		// 			/>
		// 		</svg>
		// 	),
		// 	label: `${auth.user?.name || ''} ${auth.user?.last_name || ''}`,
		// 	action: null,
		// },
		{
			id: 'edit',
			icon: (
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M9.48999 1.17C9.10999 -0.39 6.88999 -0.39 6.50999 1.17C6.45326 1.40442 6.34198 1.62213 6.18522 1.80541C6.02845 1.9887 5.83063 2.13238 5.60784 2.22477C5.38505 2.31716 5.1436 2.35564 4.90313 2.33709C4.66266 2.31854 4.42997 2.24347 4.22399 2.118C2.85199 1.282 1.28199 2.852 2.11799 4.224C2.65799 5.11 2.17899 6.266 1.17099 6.511C-0.390006 6.89 -0.390006 9.111 1.17099 9.489C1.40547 9.54581 1.62322 9.65719 1.80651 9.81407C1.98979 9.97096 2.13343 10.1689 2.22573 10.3918C2.31803 10.6147 2.35639 10.8563 2.33766 11.0968C2.31894 11.3373 2.24367 11.5701 2.11799 11.776C1.28199 13.148 2.85199 14.718 4.22399 13.882C4.42993 13.7563 4.66265 13.6811 4.90318 13.6623C5.14371 13.6436 5.38527 13.682 5.60817 13.7743C5.83108 13.8666 6.02904 14.0102 6.18592 14.1935C6.34281 14.3768 6.45419 14.5945 6.51099 14.829C6.88999 16.39 9.11099 16.39 9.48899 14.829C9.54599 14.5946 9.65748 14.377 9.8144 14.1939C9.97132 14.0107 10.1692 13.8672 10.3921 13.7749C10.6149 13.6826 10.8564 13.6442 11.0969 13.6628C11.3373 13.6815 11.57 13.7565 11.776 13.882C13.148 14.718 14.718 13.148 13.882 11.776C13.7565 11.57 13.6815 11.3373 13.6628 11.0969C13.6442 10.8564 13.6826 10.6149 13.7749 10.3921C13.8672 10.1692 14.0107 9.97133 14.1939 9.81441C14.377 9.65749 14.5946 9.546 14.829 9.489C16.39 9.11 16.39 6.889 14.829 6.511C14.5945 6.45419 14.3768 6.34281 14.1935 6.18593C14.0102 6.02904 13.8666 5.83109 13.7743 5.60818C13.682 5.38527 13.6436 5.14372 13.6623 4.90318C13.681 4.66265 13.7563 4.42994 13.882 4.224C14.718 2.852 13.148 1.282 11.776 2.118C11.5701 2.24368 11.3373 2.31895 11.0968 2.33767C10.8563 2.35639 10.6147 2.31804 10.3918 2.22574C10.1689 2.13344 9.97095 1.9898 9.81407 1.80651C9.65718 1.62323 9.5458 1.40548 9.48899 1.171L9.48999 1.17ZM7.99999 11C8.79564 11 9.55871 10.6839 10.1213 10.1213C10.6839 9.55871 11 8.79565 11 8C11 7.20435 10.6839 6.44129 10.1213 5.87868C9.55871 5.31607 8.79564 5 7.99999 5C7.20434 5 6.44128 5.31607 5.87867 5.87868C5.31606 6.44129 4.99999 7.20435 4.99999 8C4.99999 8.79565 5.31606 9.55871 5.87867 10.1213C6.44128 10.6839 7.20434 11 7.99999 11Z"
						fill="#90A4AE"
					/>
				</svg>
			),
			label: 'Editar Perfil',
			disabled: true, // Deshabilitado por ahora
			action: null,
		},

		{
			id: 'logout',
			icon: (
				<svg width="16" height="14" viewBox="0 0 16 14" fill="none">
					<path
						fillRule="evenodd"
						clipRule="evenodd"
						d="M1 0C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734784 0 1V13C0 13.2652 0.105357 13.5196 0.292893 13.7071C0.48043 13.8946 0.734784 14 1 14C1.26522 14 1.51957 13.8946 1.70711 13.7071C1.89464 13.5196 2 13.2652 2 13V1C2 0.734784 1.89464 0.48043 1.70711 0.292893C1.51957 0.105357 1.26522 0 1 0ZM11.293 9.293C11.1108 9.4816 11.01 9.7342 11.0123 9.9964C11.0146 10.2586 11.1198 10.5094 11.3052 10.6948C11.4906 10.8802 11.7414 10.9854 12.0036 10.9877C12.2658 10.99 12.5184 10.8892 12.707 10.707L15.707 7.707C15.8945 7.51947 15.9998 7.26516 15.9998 7C15.9998 6.73484 15.8945 6.48053 15.707 6.293L12.707 3.293C12.6148 3.19749 12.5044 3.12131 12.3824 3.0689C12.2604 3.01649 12.1292 2.9889 11.9964 2.98775C11.8636 2.9866 11.7319 3.0119 11.609 3.06218C11.4861 3.11246 11.3745 3.18671 11.2806 3.2806C11.1867 3.3745 11.1125 3.48615 11.0622 3.60905C11.0119 3.73194 10.9866 3.86362 10.9877 3.9964C10.9889 4.12918 11.0165 4.2604 11.0689 4.3824C11.1213 4.50441 11.1975 4.61475 11.293 4.707L12.586 6H5C4.73478 6 4.48043 6.10536 4.29289 6.29289C4.10536 6.48043 4 6.73478 4 7C4 7.26522 4.10536 7.51957 4.29289 7.70711C4.48043 7.89464 4.73478 8 5 8H12.586L11.293 9.293Z"
						fill="#90A4AE"
					/>
				</svg>
			),
			label: 'Cerrar sesión',
			disabled: false, // Habilitado por defecto
			action: () => {
				dispatch(logout());
				toast.success('Sesión finalizada');
				setOpenNav(false);
			},
		},
	];
	const downloadManual = () => {
		// Mapeo de rutas a nombres de archivo
		const routeToManualMap: Record<string, string> = {
			'/dashboard': 'manual_dashboard',
			'/profile': 'manual_perfil',
			// Agrega más rutas según sea necesario
		};

		// Obtener el nombre del manual o usar 'manual_general' como predeterminado
		const manualName =
			routeToManualMap[location.pathname] || 'manual_general';
		const manualPath = `/manual/${manualName}.pdf`;

		// Verificar si el archivo existe
		fetch(manualPath, { method: 'HEAD' })
			.then((response) => {
				if (response.ok) {
					const link = document.createElement('a');
					link.href = manualPath;
					link.download = `${manualName}.pdf`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					toast.success(`Manual descargado: ${manualName}.pdf`);
				} else {
					toast.error(
						'El manual para esta sección no está disponible'
					);
				}
			})
			.catch(() => {
				toast.error('Error al intentar descargar el manual');
			});
	};

	return (
		<>
			<div className="fixed top-1 z-50 w-full border-2 border-white rounded-xl p-3 bg-[#2A4D77] text-white">
				<div className="flex items-center justify-between">
					{/* Logo y RIF - Siempre visibles */}
					<div className="flex flex-col items-center">
						<img
							src="/images/logo.png"
							alt="Logo RECIP"
							className="w-10 h-10 lg:h-16 lg:w-28 object-contain bg-white px-2 rounded-md shadow-sm"
						/>
						{/* <Typography
							variant="small"
							className="text-xs sm:text-sm md:text-base font-medium"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							J-500255586
						</Typography> */}
					</div>

					{/* Título centrado - Responsive */}
					<div className="absolute left-1/2 transform -translate-x-1/2">
						<Typography
							variant="h1"
							className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-center"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							R.E.C.I.P.
						</Typography>
						<Typography
							variant="small"
							className="hidden sm:block text-center text-xs md:text-sm"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Registro de Evaluación, Capacitación e Instrucción del
							Piloto
						</Typography>
					</div>

					{/* Menú de usuario */}
					<div className="flex items-center gap-2">
						{auth.user && (
							<>
								{/* Menú desktop (visible en md y superior) */}
								<div className="hidden md:block">
									<Menu>
										<MenuHandler>
											<Avatar
												variant="circular"
												alt="User Avatar"
												className="cursor-pointer"
												src="/images/user.png"
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											/>
										</MenuHandler>
										<MenuList
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											{menuItems.map((item) => (
												<MenuItem
													key={item.id}
													className="flex items-center gap-2"
													placeholder={undefined}
													onPointerEnterCapture={undefined}
													onPointerLeaveCapture={undefined}
													onClick={item.action || undefined}
												>
													{item.icon}
													<Typography
														variant="small"
														className="font-medium"
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														{item.label}
													</Typography>
												</MenuItem>
											))}
										</MenuList>
									</Menu>
								</div>

								{/* Botón de menú hamburguesa (visible en móviles) */}
								<IconButton
									variant="text"
									className="md:hidden text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent"
									ripple={false}
									onClick={() => setOpenNav(!openNav)}
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{openNav ? (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											className="h-6 w-6"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-6 w-6"
											fill="none"
											stroke="currentColor"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M4 6h16M4 12h16M4 18h16"
											/>
										</svg>
									)}
								</IconButton>
							</>
						)}
						<IconButton
							variant="text"
							className="text-white hover:bg-white/10"
							onClick={downloadManual}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<circle cx="12" cy="12" r="10" />
								<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
								<line x1="12" y1="17" x2="12.01" y2="17" />
							</svg>
						</IconButton>
					</div>
				</div>

				{/* Menú colapsable para móviles */}
				<Collapse
					open={openNav}
					className="mt-2 rounded-lg bg-blue-gray-300"
				>
					{auth.user && (
						<div className="flex flex-col p-4 gap-2">
							{/* Información del usuario */}
							<div className="flex items-center gap-3 p-2 bg-blue-gray-200 rounded-lg">
								<Avatar
									variant="circular"
									alt="User Avatar"
									className="cursor-pointer"
									src="/images/user.png"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								/>
								<div>
									<Typography
										variant="paragraph"
										className="font-semibold"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{auth.user.name} {auth.user.last_name}
									</Typography>
								</div>
							</div>

							{/* Elementos del menú */}
							{menuItems.map((item) => (
								<div
									key={item.id}
									className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-blue-gray-200 ${
										item.id === 'logout'
											? 'mt-2 border-t border-blue-gray-400 pt-4'
											: ''
									}`}
									onClick={() => {
										if (item.action) item.action();
										else setOpenNav(false);
									}}
								>
									<div className="w-6 flex justify-center">
										{item.icon}
									</div>
									<Typography
										variant="small"
										className="font-medium"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										{item.label}
									</Typography>
								</div>
							))}
						</div>
					)}
				</Collapse>
			</div>
			<div className="bg-white mx-auto  sm:w-12 h-20 md:w-9 rounded-full shadow-md" />
		</>
	);
};

export default NavBar;
