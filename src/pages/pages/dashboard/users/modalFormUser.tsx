import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Input,
	Option,
	Select,
	Switch,
} from '@material-tailwind/react';
import 'react-phone-input-2/lib/style.css';
import { user, userDocType } from '../../../../types/utilities';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useRef, useState } from 'react';
import { EyeIcon, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../../store';
import {
	createUser,
	updateUser,
} from '../../../../features/userSlice';
import PhoneInput, { CountryData } from 'react-phone-input-2';
import countries from 'world-countries';
import { getFlagEmoji } from '../../../../services/utilities';
import { axiosGetDefault } from '../../../../services/axios';
type Inputs = {
	name: string;
	doc_number: number;
	user_doc_type: string;
	last_name: string;
	phone: string;
	email: string;
	password: string;
	password2: string;
	country_name: string;
};
const ModalFormUser = ({
	userSelect,
	openNewUser,
	handleOpen,
	userDocTypes,
}: {
	userSelect: user | null;
	openNewUser: boolean;
	handleOpen: (user?: user | null) => void;
	userDocTypes: userDocType[];
}) => {
	const [countryInfo, setCountryInfo] = useState<{
		name: string;
		flag: string;
	}>({
		name: userSelect?.country_name ? userSelect.country_name : '',
		flag: userSelect?.flag ? userSelect.flag : '',
	});
	const countryOptions = countries.map((country) => ({
		value: country.cca2.toLowerCase(),
		label: `${getFlagEmoji(country.cca2.toLowerCase())} ${
			country.name.common
		}`,
		name: country.name.common,
	}));
	const {
		register,
		handleSubmit,
		watch,
		control,
		setValue,
		formState: { errors },
	} = useForm<Inputs>({
		defaultValues: {
			name: userSelect?.name,
			doc_number: userSelect?.doc_number,
			last_name: userSelect?.last_name,
			phone: userSelect?.phone,
			email: userSelect?.email,
			country_name: userSelect?.country_name,
			password: '',
			password2: '',
			user_doc_type: userSelect?.user_doc_type?.id
				? `${userSelect.user_doc_type.id}`
				: '',
		},
	});
	const dispatch = useDispatch<AppDispatch>();

	// const status = useSelector(
	// 	(state: RootState) => state.users.status
	// );
	const password = useRef({});
	password.current = watch('password', '');
	const newForm = userSelect ? false : true;
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

	const validateUserEmail = async (value: string) => {
		const response = await axiosGetDefault(
			`api/users/userEmailValidate/${value}`
		);
		const respData: boolean = response?.resp.exist;
		return respData;
	};

	const onSubmit: SubmitHandler<Inputs> = async (data) => {
		if (data.user_doc_type) {
			const req: user = {
				uuid: userSelect?.uuid ? userSelect.uuid : null,
				id: userSelect?.id ? userSelect.id : null,
				user_doc_type_id: parseInt(data.user_doc_type),
				name: data.name,
				doc_number: data.doc_number,
				last_name: data.last_name,
				phone: data.phone,
				country_name: data.country_name,
				flag: countryInfo.flag,
				email: data.email,
				is_active: isActive,
				is_staff: isStaff,
				is_superuser: isSuperuser,
				password: data.password,
			};
			console.log(req);

			handleOpen();
			if (userSelect) {
				dispatch(updateUser(req));
			} else {
				dispatch(createUser(req));
			}
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

							<div>
								<Controller
									name="country_name"
									control={control}
									rules={{
										required:
											'Seleccionar la nacionalidad es obligatorio',
									}}
									render={({ field }) => (
										<Select
											label="Seleccionar Nacionalidad"
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											{...field}
											placeholder="Selecciona tu nacionalidad"
										>
											{countryOptions.map((country) => (
												<Option
													key={country.value}
													value={country.name}
												>
													{country.label}
												</Option>
											))}
										</Select>
									)}
								/>
								{errors.country_name && (
									<p className="text-red-500 text-sm mt-1">
										{errors.country_name.message}
									</p>
								)}
							</div>
							<div>
								<Controller
									name="phone"
									control={control}
									rules={{
										required: 'El número de teléfono es obligatorio',
									}}
									render={({ field }) => (
										<PhoneInput
											{...field}
											country={'ve'}
											inputStyle={{
												width: '100%',
												paddingLeft: '3rem',
												height: '2.5rem',
												borderRadius: '0.5rem',
												borderColor: errors.phone ? 'red' : '#b0bec5',
											}}
											dropdownStyle={{
												borderRadius: '0.5rem',
											}}
											onChange={(value, countryData: CountryData) => {
												console.log(countryData.countryCode);

												field.onChange(value);

												setValue('phone', value);
												setCountryInfo({
													name: countryData.name,
													flag: getFlagEmoji(countryData.countryCode),
												});
											}}
										/>
									)}
								/>
								{errors.phone && (
									<p className="text-red-500 text-sm mt-1">
										{errors.phone.message}
									</p>
								)}
							</div>
							{/* Información del país */}

							<div className="">
								<Controller
									name="user_doc_type"
									control={control}
									rules={{
										required: true,
									}}
									render={({ field }) => (
										<Select
											placeholder={undefined}
											onPointerEnterCapture={undefined}
											onPointerLeaveCapture={undefined}
											{...field}
											label="Seleccionar tipo de documento"
										>
											{userDocTypes.map((userDocType) => (
												<Option
													key={userDocType.id}
													value={`${userDocType.id}`}
												>
													{userDocType.name}
												</Option>
											))}
										</Select>
									)}
								/>
								{errors.user_doc_type && (
									<span className="text-red-500">
										El tipo de documento es requerido
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
										validate: async (value: string) => {
											let res;
											if (!newForm && userSelect?.email === value) {
												res = false;
											} else {
												res = await validateUserEmail(value);
											}
											return !res || 'Ya existe el usuario';
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
									{...register('password', {
										required: {
											value: newForm,
											message:
												'La contraseña de usuario es requerida',
										},
									})}
								/>
								{errors.password && (
									<span className="text-red-500 text-sm/[8px] py-2">
										{errors.password.message}
									</span>
								)}
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
						{/* <code>{JSON.stringify(errors)}</code> */}
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
											onChange={() => {
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
											onChange={() => {
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
											onChange={() => {
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
						onClick={() => {
							handleOpen(null);
						}}
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

export default ModalFormUser;
