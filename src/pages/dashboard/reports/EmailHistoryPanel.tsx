import {
	Button,
	Card,
	CardBody,
	Collapse,
	Typography,
} from '@material-tailwind/react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../hooks/useTheme';
import { AppDispatch, RootState } from '../../../store';
import {
	fetchEmailHistory,
	deleteEmailHistory,
} from '../../../features/emailSlice';
import {
	Mail,
	ChevronDown,
	ChevronUp,
	Trash2,
	Loader,
	AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const EmailHistoryPanel = () => {
	const { theme } = useTheme();
	const dispatch = useDispatch<AppDispatch>();
	const { emailList, status } = useSelector(
		(state: RootState) => state.emailHistory,
	);
	const { userLogged } = useSelector(
		(state: RootState) => state.users,
	);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (open) {
			dispatch(
				fetchEmailHistory({ user_id: userLogged?.id ?? undefined }),
			);
		}
	}, [open, dispatch, userLogged?.id]);

	const handleDelete = (id: number) => {
		toast(
			(t) => (
				<div className="flex flex-col gap-2">
					<Typography
						variant="small"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						¿Eliminar este registro de correo?
					</Typography>
					<div className="flex gap-2 justify-end">
						<Button
							size="sm"
							color="red"
							onClick={() => {
								dispatch(deleteEmailHistory(id));
								toast.dismiss(t.id);
								toast.success('Registro eliminado');
							}}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							Sí
						</Button>
						<Button
							size="sm"
							variant="outlined"
							onClick={() => toast.dismiss(t.id)}
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							No
						</Button>
					</div>
				</div>
			),
			{ duration: 5000 },
		);
	};

	return (
		<Card
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
		>
			<CardBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Button
					fullWidth
					color="blue"
					variant="outlined"
					onClick={() => setOpen(!open)}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
					className="flex items-center justify-center gap-2"
				>
					<Mail className="w-4 h-4" />
					Historial de Correos
					{open ? (
						<ChevronUp className="w-4 h-4" />
					) : (
						<ChevronDown className="w-4 h-4" />
					)}
				</Button>

				<Collapse open={open}>
					<div className="mt-4">
						{status === 'loading' && (
							<div className="flex justify-center py-4">
								<Loader className="w-6 h-6 animate-spin" />
							</div>
						)}

						{status === 'failed' && (
							<div className="flex items-center gap-2 justify-center py-4">
								<AlertCircle className="w-5 h-5 text-red-500" />
								<Typography
									variant="small"
									color="red"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									Error al cargar historial
								</Typography>
							</div>
						)}

						{status === 'succeeded' && emailList.length === 0 && (
							<Typography
								variant="h6"
								color="gray"
								className="text-center"
								placeholder={undefined}
								onPointerEnterCapture={undefined}
								onPointerLeaveCapture={undefined}
							>
								No hay registros de correos
							</Typography>
						)}

						{status === 'succeeded' && emailList.length > 0 && (
							<div className="overflow-x-auto">
								<table className="w-full text-sm">
									<thead>
										<tr
											className={`border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
										>
											<th className="text-left py-2 px-2 font-medium">
												Archivo
											</th>
											<th className="text-left py-2 px-2 font-medium">
												Email
											</th>
											<th className="text-left py-2 px-2 font-medium">
												Fecha
											</th>
											<th className="text-left py-2 px-2 font-medium">
												Tipo
											</th>
											<th className="text-left py-2 px-2 font-medium">
												Módulo
											</th>
											<th className="text-left py-2 px-2 font-medium">
												Descripción
											</th>
											<th className="text-left py-2 px-2 font-medium">
												Usuario
											</th>
											<th className="text-center py-2 px-2 font-medium">
												Acción
											</th>
										</tr>
									</thead>
									<tbody>
										{emailList.map((email) => (
											<tr
												key={email.id}
												className={`border-b ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
											>
												<td className="py-2 px-2">
													{email.nombre_archivo}
												</td>
												<td className="py-2 px-2">{email.email}</td>
												<td className="py-2 px-2">
													{email.fecha
														? new Date(
																email.fecha,
															).toLocaleDateString()
														: '-'}
												</td>
												<td className="py-2 px-2">{email.tipo}</td>
												<td className="py-2 px-2">{email.modulo}</td>
												<td
													className="py-2 px-2 max-w-xs truncate"
													title={email.descripcion}
												>
													{email.descripcion}
												</td>
												<td className="py-2 px-2">
													{email.user
														? `${email.user.name} ${email.user.last_name}`
														: '-'}
												</td>
												<td className="py-2 px-2 text-center">
													<Button
														size="sm"
														color="red"
														variant="text"
														onClick={() => handleDelete(email.id)}
														placeholder={undefined}
														onPointerEnterCapture={undefined}
														onPointerLeaveCapture={undefined}
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</Collapse>
			</CardBody>
		</Card>
	);
};

export default EmailHistoryPanel;
