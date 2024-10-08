import React, { useEffect, useState } from 'react';
import {
	Navbar,
	MobileNav,
	Typography,
	Button,
	IconButton,
	Avatar,
} from '@material-tailwind/react';
// import { Link } from 'react-router-dom';

const NavBar = () => {
	const [openNav, setOpenNav] = useState(false);
	useEffect(() => {
		window.addEventListener(
			'resize',
			() => window.innerWidth >= 960 && setOpenNav(false)
		);
	}, []);
	const navList = (
		<ul className="mt-2 mb-4 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
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
				ddd
			</Typography>
		</ul>
	);

	return (
		<Navbar
			className="fixed top-0 z-50 left-1/2 transform -translate-x-1/2  bg-blue-gray-50"
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<div className="flex items-center justify-between text-blue-gray-900">
				<Avatar
					src="https://docs.material-tailwind.com/img/face-2.jpg"
					alt="avatar"
					variant="rounded"
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				/>

				<div className="flex items-center gap-4">
					<div className="mr-4 hidden lg:block">{navList}</div>
					<div className="flex items-center gap-x-1">
						<Button
							variant="text"
							size="sm"
							className="hidden lg:inline-block"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<span>Log In</span>
						</Button>
						<Button
							variant="gradient"
							size="sm"
							className="hidden lg:inline-block"
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<span>Sign in</span>
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
			<MobileNav open={openNav}>
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
						<span>Log In</span>
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
			</MobileNav>
		</Navbar>
	);
};

export default NavBar;
