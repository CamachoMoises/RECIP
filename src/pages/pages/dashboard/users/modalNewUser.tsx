import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
	Switch,
} from '@material-tailwind/react';
import { user } from '../../../../types/utilidades';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import { EyeIcon, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import {
	axiosPostDefault,
	axiosPutDefault,
} from '../../../../services/axios';
import {
	createUser,
	updateUser,
} from '../../../../features/userSlice';
type Inputs = {
	name: string;
	doc_number: number;
	last_name: string;
	phone: string;
	email: string;
	password: string;
	password2: string;
};
const ModalNewUser = ({
	userSelect,
	openNewUser,
	handleOpen,
}: {
	userSelect: user | null;
	openNewUser: boolean;
	handleOpen: () => void;
}) => {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			name: userSelect?.name,
			doc_number: userSelect?.doc_number,
			last_name: userSelect?.last_name,
			phone: userSelect?.phone,
			email: userSelect?.email,
			password: '',
			password2: '',
		},
	});
	const dispatch = useDispatch<AppDispatch>();

	const status = useSelector(
		(state: RootState) => state.users.status
	);
	const password = useRef({});
	password.current = watch('password', '');

	const [isActive, setIsActive] = useState(
		userSelect ? userSelect?.is_active : true
	);
	const [isStaff, setIsStaff] = useState(
		userSelect ? userSelect?.is_staff : false
	);
	const [isSuperuser, setIsSuperuser] = useState(
		userSelect ? userSelect?.is_superuser : false
	);
	const [passwordShown, setPasswordShown] = useState(false);
	const togglePasswordVisiblity = () => {
		setPasswordShown((cur) => !cur);
	};
	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		const req: user = {
			uuid: userSelect?.uuid ? userSelect.uuid : null,
			id: userSelect?.id ? userSelect.id : null,
			name: data.name,
			doc_number: data.doc_number,
			last_name: data.last_name,
			phone: data.phone,
			email: data.email,
			is_active: isActive,
			is_staff: isStaff,
			is_superuser: isSuperuser,
			password: data.password,
		};
		handleOpen();

		if (userSelect) {
			dispatch(updateUser(req));
		} else {
			dispatch(createUser(req));
		}
	};
	return (
		<Dialog
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			open={openNewUser}
			handler={handleOpen}
			size="xl"
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogHeader
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					{userSelect
						? `Editar a ${userSelect.name} ${userSelect.last_name}`
						: 'Nuevo usuario'}
				</DialogHeader>
				<DialogBody
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<div className="container mx-auto p-3">
						<div className="grid grid-cols-3 gap-4">
							<div className="">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="text"
									label="Nombre"
									placeholder="Nombre"
									maxLength={20}
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register('name', {
										required: {
											value: true,
											message: 'El nombre es requerido',
										},
									})}
									aria-invalid={errors.name ? 'true' : 'false'}
								/>
								{errors.name && (
									<span className="text-red-500 text-sm/[8px] py-2">
										{errors.name.message}
									</span>
								)}
							</div>
							<div className="">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="text"
									label="Apellido"
									maxLength={20}
									placeholder="Apellido"
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register('last_name', {
										required: {
											value: true,
											message: 'El apellido es requerido',
										},
									})}
								/>
								{errors.last_name && (
									<span className="text-red-500 text-sm/[8px] py-2">
										{errors.last_name.message}
									</span>
								)}
							</div>
							<div className="">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="text"
									label="Telefono"
									maxLength={20}
									placeholder="Telefono"
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register('phone', {
										required: {
											value: true,
											message: 'El telefono es requerido',
										},
									})}
								/>
								{errors.phone && (
									<span className="text-red-500 text-sm/[8px] py-2">
										{errors.phone.message}
									</span>
								)}
							</div>
							<div className="">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="text"
									label="Cedula"
									maxLength={20}
									placeholder="Cedula"
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register('doc_number', {
										required: {
											value: true,
											message: 'La cedula es requerida',
										},
									})}
								/>
								{errors.doc_number && (
									<span className="text-red-500 text-sm/[8px] py-2">
										{errors.doc_number.message}
									</span>
								)}
							</div>
							<div className="col-span-2">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="email"
									label="Email"
									placeholder="Email"
									maxLength={254}
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register('email', {
										required: {
											value: true,
											message: 'El email de usuario es requerido',
										},
									})}
								/>
								{errors.email && (
									<span className="text-red-500 text-sm/[8px] py-2">
										{errors.email.message}
									</span>
								)}
							</div>
							<div className="col-span-2">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									label="Contraseña"
									placeholder="Contraseña"
									maxLength={20}
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
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register('password')}
								/>
							</div>
							<div className="">
								<Input
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
									type="password"
									label="Confirmar Contraseña"
									placeholder="Contraseña"
									maxLength={20}
									className="bg-slate-400 rounded-md p-2 w-full mb-2 block text-slate-900"
									crossOrigin={undefined}
									{...register('password2', {
										validate: (value: any) => {
											if (value !== password.current) {
												return 'Las contraseñas no coinciden';
											}
											if (value.length <= 7 && value.length !== 0) {
												return 'La contraseña es muy corta';
											}
											return true;
										},
									})}
								/>
								{errors.password2 && (
									<span className="text-red-500 text-sm/[8px] py-2">
										{errors.password2.message}
									</span>
								)}
							</div>
						</div>
						<div className="flex flex-row gap-3 py-3">
							<div className="basis-1/2">
								<div className="flex flex-row gap-5">
									<div>
										<label
											htmlFor="Nombre"
											className="text-sx text-black"
										>
											Activo
										</label>
										<br />
										<Switch
											defaultChecked={userSelect ? isActive : true}
											onChange={(e: any) => {
												setIsActive(!isActive);
											}}
											crossOrigin={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
									</div>
									<div>
										<label
											htmlFor="Nombre"
											className="text-sx text-black"
										>
											Staff
										</label>{' '}
										<br />
										<Switch
											defaultChecked={isStaff}
											onChange={(e: any) => {
												setIsStaff(!isStaff);
											}}
											crossOrigin={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
									</div>
									<div>
										<label
											htmlFor="Nombre"
											className="text-sx text-black"
										>
											Super Usuario
										</label>{' '}
										<br />
										<Switch
											defaultChecked={isSuperuser}
											onChange={(e: any) => {
												setIsSuperuser(!isSuperuser);
											}}
											crossOrigin={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
										/>
									</div>
								</div>
							</div>
							<div className="basis-1/2"></div>
						</div>
					</div>
				</DialogBody>
				<DialogFooter
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<Button
						variant="text"
						color="red"
						onClick={handleOpen}
						className="mr-1"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<span>Cancelar</span>
					</Button>
					<Button
						variant="gradient"
						color="green"
						type="submit"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<span>{userSelect ? 'Actualizar' : 'Crear'}</span>
					</Button>
				</DialogFooter>
			</form>
		</Dialog>
	);
};

export default ModalNewUser;
