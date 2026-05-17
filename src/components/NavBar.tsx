import { useEffect, useState } from 'react';
import {
	Collapse,
	Menu,
	MenuHandler,
	MenuList,
	MenuItem,
	Popover,
	PopoverHandler,
	PopoverContent,
	Button,
} from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../features/authSlice';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import {
	Sun,
	Moon,
	DoorOpen,
	HelpCircle,
	ChevronDown,
	Menu as MenuIcon,
	X,
} from 'lucide-react';
import { fetchCurrentUser } from '../features/userSlice';
import { formatUserName } from '../services/utilities';
import { useTheme } from '../hooks/useTheme';

const manualRoutes = {
	dashboard: {
		users: 'manual_users',
		instructors: 'manual_instructors',
		students: 'manual_students',
		courses: 'manual_courses',
		new_course: 'manual_new_course',
		config: 'manual_config',
		test: 'manual_test',
		assessment: 'manual_assessment',
		_: 'manual_dashboard',
	},
	login: 'manual_login',
	profile: 'manual_perfil',
	_: 'manual_general',
};

const NavBar = () => {
	const location = useLocation();
	const [openNav, setOpenNav] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const auth = useSelector((state: RootState) => state.auth);
	const { theme, toggle: toggleTheme } = useTheme();
	const { userLogged } = useSelector(
		(state: RootState) => state.users,
	);
	const dispatch = useDispatch<AppDispatch>();

	useEffect(() => {
		if (auth.user) dispatch(fetchCurrentUser());
	}, [auth.user, dispatch]);

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768) setOpenNav(false);
		};
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Scroll shrink
	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY >= 250);
		window.addEventListener('scroll', handleScroll, {
			passive: true,
		});
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const handleLogout = () => {
		dispatch(logout());
		toast.success('Sesión finalizada');
		setOpenNav(false);
	};

	const resolveManualNameFromPath = (
		path: string,
		manualTree: Record<string, any>,
	): string => {
		const segments = path.split('/').filter(Boolean);
		let current: any = manualTree;
		for (const segment of segments) {
			if (typeof current === 'string') return current;
			if (current[segment]) current = current[segment];
			else if (current._) return current._;
			else break;
		}
		return typeof current === 'string'
			? current
			: current._ || manualTree._ || 'manual_general';
	};

	const downloadManual = (type: string) => {
		if (!auth.user) {
			toast.error('Debe iniciar sesión para descargar el manual');
			return;
		}
		let manualPath = '';
		if (type === 'page') {
			manualPath = `/manual/${resolveManualNameFromPath(location.pathname, manualRoutes)}.pdf`;
		} else if (type === 'example' && auth.user.is_superuser) {
			manualPath = '/manual/manual_example.pdf';
		}
		fetch(manualPath, { method: 'HEAD' })
			.then((r) => {
				if (r.ok) window.open(manualPath, '_blank');
				else
					toast.error(
						'El manual para esta sección no está disponible',
					);
			})
			.catch(() =>
				toast.error('Error al intentar acceder al manual'),
			);
	};

	const is_superuser = !!userLogged?.is_superuser;
	const is_staff = !!userLogged?.is_staff;

	const userInitials = userLogged
		? `${userLogged.name?.[0] ?? ''}${userLogged.last_name?.[0] ?? ''}`.toUpperCase()
		: '?';

	const userName = userLogged
		? `${formatUserName(userLogged.name)} ${formatUserName(userLogged.last_name)}`
		: 'Usuario';

	return (
		<>
			<div
				className={`fixed top-2 z-50 left-[1%] w-[98%] glass-card-dark transition-all duration-300 ${
					scrolled ? 'top-1' : 'top-2'
				}`}
			>
				<div
					className={`
                        w-full
                        bg-[var(--color-background-primary)]
                        shadow-sm
                        transition-all duration-300 ease-in-out
                        ${scrolled ? 'rounded-xl px-4 py-2' : 'rounded-2xl px-5 py-3'}
                    `}
				>
					<div className="flex items-center justify-between gap-4">
						{/* Logo */}
						<a
							href="/dashboard"
							className="flex items-center gap-2 shrink-0"
						>
							<div
								className={`bg-[var(--color-background-secondary)] border  rounded-xl flex items-center justify-center transition-all duration-300 ${
									scrolled ? 'w-8 h-8' : 'w-12 h-12'
								}`}
							>
								<img
									src="/images/logo.png"
									alt="Logo RECIP"
									className="w-full h-full object-contain p-1 rounded-xl"
								/>
							</div>
							{scrolled && (
								<span className="text-sm font-medium nav-text hidden sm:block">
									R.E.C.I.P.
								</span>
							)}
						</a>

						{/* Título central — solo visible cuando no ha hecho scroll */}
						{!scrolled && (
							<div className="absolute left-1/2 -translate-x-1/2 text-center hidden sm:block">
								<p className="text-xl font-medium nav-text m-0 leading-tight">
									R.E.C.I.P.
								</p>
								<p className="text-xs nav-text opacity-70 m-0">
									Registro de Evaluación, Capacitación e Instrucción
									del Piloto
								</p>
							</div>
						)}

						{/* Acciones desktop */}
						{auth.user && (
							<div className="hidden md:flex items-center gap-2 ml-auto">
								{/* Theme toggle */}
								<button
									onClick={toggleTheme}
									className={`border border-[var(--glass-border)] rounded-lg flex items-center justify-center text-blue-200 hover:bg-white/10 transition-colors ${scrolled ? 'p-1.5' : 'p-2'}`}
									aria-label="Cambiar tema"
								>
									{theme === 'dark' ? (
										<Sun size={scrolled ? 14 : 16} />
									) : (
										<Moon size={scrolled ? 14 : 16} />
									)}
								</button>

								{/* Manual */}
								<Popover placement="bottom-end">
									<PopoverHandler>
										<button
											className={`border border-[var(--glass-border)] rounded-lg flex items-center justify-center text-blue-200 hover:bg-white/10 transition-colors ${scrolled ? 'p-1.5' : 'p-2'}`}
											aria-label="Ayuda"
										>
											<HelpCircle size={scrolled ? 14 : 16} />
										</button>
									</PopoverHandler>
									<PopoverContent
										className="z-50 glass-card-dark border border-blue-500/30 shadow-md rounded-xl p-3 flex flex-col gap-2"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<Button
											color="blue"
											variant="outlined"
											size="sm"
											onClick={() => downloadManual('page')}
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Manual de usuario
										</Button>
										{is_superuser && (
											<Button
												color="orange"
												variant="outlined"
												size="sm"
												onClick={() => downloadManual('example')}
												placeholder={undefined}
												onPointerEnterCapture={undefined}
												onPointerLeaveCapture={undefined}
											>
												Ejemplo de uso
											</Button>
										)}
									</PopoverContent>
								</Popover>

								{/* Chips de rol */}
								<div className="flex items-center gap-1">
									{is_superuser && (
										<span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
											Admin
										</span>
									)}
									{is_staff && (
										<span className="text-xs px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
											Staff
										</span>
									)}
								</div>

								{/* User menu */}
								<Menu>
									<MenuHandler>
										<button
											className={`flex items-center gap-2 rounded-lg hover:bg-[var(--color-background-secondary)] transition-colors ${scrolled ? 'px-2 py-1' : 'px-3 py-1.5'}`}
										>
											<div
												className={`rounded-full bg-blue-500/30 flex items-center justify-center font-medium text-blue-200 shrink-0 ${scrolled ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}`}
											>
												{userInitials}
											</div>
											<span
												className={`font-medium nav-text ${scrolled ? 'text-xs' : 'text-sm'}`}
											>
												{userName}
											</span>
											<ChevronDown
												size={scrolled ? 12 : 14}
												className="text-[var(--color-text-secondary)]"
											/>
										</button>
									</MenuHandler>
									<MenuList
										className="bg-[var(--color-background-primary)] border border-[var(--color-border-tertiary)] shadow-md rounded-xl p-1"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										<MenuItem
											disabled
											className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] opacity-50"
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										>
											Editar perfil
										</MenuItem>
									</MenuList>
								</Menu>

								{/* Logout */}
								<button
									onClick={handleLogout}
									className={`border border-[#F7C1C1] rounded-lg flex items-center justify-center text-[#A32D2D] hover:bg-[#FCEBEB] transition-colors ${scrolled ? 'p-1.5' : 'p-2'}`}
									aria-label="Cerrar sesión"
								>
									<DoorOpen size={scrolled ? 14 : 16} />
								</button>
							</div>
						)}

						{/* Hamburger mobile */}
						{auth.user && (
							<button
								className="md:hidden border border-[var(--color-border-secondary)] rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-background-secondary)] transition-colors ml-auto"
								onClick={() => setOpenNav(!openNav)}
								aria-label="Menú"
							>
								{openNav ? <X size={18} /> : <MenuIcon size={18} />}
							</button>
						)}
					</div>

					{/* Mobile menu */}
					<Collapse open={openNav}>
						{auth.user ? (
							<div className="flex flex-col gap-2 pt-3 mt-3 ">
								{/* User info */}
								<div className="flex items-center gap-3 p-3 bg-[var(--color-background-secondary)] rounded-xl">
									<div
										className={`rounded-full bg-blue-500/30 flex items-center justify-center font-medium text-blue-200 shrink-0 ${scrolled ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}`}
									>
										{userInitials}
									</div>
									<div>
										<p className="text-sm font-medium text-[var(--color-text-primary)] m-0">
											{userName}
										</p>
										<div className="flex gap-1 mt-0.5">
											{is_superuser && (
												<span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
													Admin
												</span>
											)}
											{is_staff && (
												<span className="text-xs px-1.5 py-0.5 rounded-full bg-cyan-50 text-cyan-700">
													Staff
												</span>
											)}
										</div>
									</div>
								</div>

								{/* Theme toggle */}
								<button
									onClick={toggleTheme}
									className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--color-background-secondary)] transition-colors"
								>
									<div
										className={`border border-[var(--glass-border)] rounded-lg flex items-center justify-center text-blue-200 hover:bg-white/10 transition-colors ${scrolled ? 'p-1.5' : 'p-2'}`}
									>
										{theme === 'dark' ? (
											<Sun size={16} />
										) : (
											<Moon size={16} />
										)}
										{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
									</div>
									<div className="w-9 h-5 bg-blue-500 rounded-full relative">
										<div
											className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'left-0.5' : 'left-4'}`}
										/>
									</div>
								</button>

								{/* Manual */}
								<button
									onClick={() => downloadManual('page')}
									className={`border border-[var(--glass-border)] rounded-lg flex items-center justify-center text-blue-200 hover:bg-white/10 transition-colors ${scrolled ? 'p-1.5' : 'p-2'}`}
								>
									<HelpCircle
										size={16}
										className="text-[var(--color-text-secondary)]"
									/>
									Manual de usuario
								</button>

								{/* Logout */}
								<button
									onClick={handleLogout}
									className="flex items-center gap-3 p-3 rounded-xl text-sm text-[#A32D2D] hover:bg-[#FCEBEB] transition-colors mt-1 border-t border-[var(--color-border-tertiary)] pt-3"
								>
									<DoorOpen size={16} />
									Cerrar sesión
								</button>
							</div>
						) : (
							<p className="text-sm text-[var(--color-text-secondary)] pt-3 mt-3 border-t border-[var(--color-border-tertiary)]">
								Inicie sesión para ver sus opciones
							</p>
						)}
					</Collapse>
				</div>
			</div>

			<div
				className={`transition-all duration-300 ${scrolled ? 'h-10' : 'h-16'}`}
			/>
		</>
	);
};

export default NavBar;
