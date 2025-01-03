import { useEffect, useState } from 'react';
import {
	Navbar,
	Typography,
	Button,
	IconButton,
	Collapse,
} from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
	const [openNav, setOpenNav] = useState(false);
	const navigate = useNavigate();
	useEffect(() => {
		window.addEventListener(
			'resize',
			() => window.innerWidth >= 960 && setOpenNav(false)
		);
	}, []);
	const navList = (
		<ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
			<li>
				<Typography
					as="li"
					variant="small"
					color="blue-gray"
					className="p-1 font-normal"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{/* <Link to="/contact">Contacto</Link> */}
					Test
				</Typography>
			</li>
			<li>
				<Typography
					as="li"
					variant="small"
					color="blue-gray"
					className="p-1 font-normal"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{/* <Link to="/contact">Contacto</Link> */}
					Test
				</Typography>
			</li>
		</ul>
	);

	return (
		<Navbar
			className="fixed top-0 z-50 left-1/2 transform -translate-x-1/2  bg-blue-gray-400"
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<div className="flex items-center justify-between text-blue-gray-900">
				<div className="flex flex-col fixed z-[-1] justify-center w-full mt-[-3rem]">
					<Typography
						variant="h1"
						className="pt-10 font-sans"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						RECIP
					</Typography>{' '}
					<div className="">
						<Typography
							variant="small"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Registro de Evaluacion, Capacitación e Instrución del
							Piloto
						</Typography>
					</div>
				</div>
				<div className="flex flex-col">
					<img
						src="/images/logo.png"
						alt="Descripción de la imagen"
						width={150}
					/>
					<Typography
						variant="small"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						J-500255586
					</Typography>
				</div>

				<div className="flex items-center gap-4">
					{/* <div className="mr-4 hidden lg:block">{navList}</div> */}
					<div className="flex items-center gap-x-1">
						<Button
							variant="gradient"
							size="sm"
							className="hidden lg:inline-block"
							placeholder={undefined}
							onClick={() => navigate('/login')}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Login
						</Button>
						<Button
							variant="gradient"
							size="sm"
							className="hidden lg:inline-block"
							placeholder={undefined}
							onClick={() => navigate('/dashboard')}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Pricipal
						</Button>
					</div>
					<IconButton
						variant="text"
						className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
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
				</div>
			</div>
			<Collapse open={openNav}>
				{navList}
				<div className="flex items-center gap-x-1">
					<Button
						fullWidth
						variant="text"
						size="sm"
						className=""
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<span>ffffff</span>
					</Button>
					<Button
						fullWidth
						variant="gradient"
						size="sm"
						className=""
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<span>Sign in</span>
					</Button>
				</div>
			</Collapse>
		</Navbar>
	);
};

export default NavBar;
