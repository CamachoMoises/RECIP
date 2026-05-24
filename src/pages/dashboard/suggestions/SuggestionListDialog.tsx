import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
	Typography,
} from '@material-tailwind/react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { fetchSuggestions } from '../../../features/userSlice';

interface Props {
	open: boolean;
	handler: () => void;
}

const SuggestionListDialog = ({ open, handler }: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const { suggestionList } = useSelector(
		(state: RootState) => state.users,
	);

	useEffect(() => {
		if (open) {
			dispatch(fetchSuggestions());
		}
	}, [open, dispatch]);

	return (
		<Dialog
			open={open}
			handler={handler}
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			className="max-h-[90vh] overflow-y-auto"
		>
			<DialogHeader
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Sugerencias Recibidas
			</DialogHeader>
			<DialogBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				{suggestionList.length === 0 ? (
					<Typography
						variant="h6"
						color="gray"
						className="text-center"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						No hay sugerencias aún
					</Typography>
				) : (
					<div className="flex flex-col gap-3">
						{suggestionList.map((s) => (
							<div
								key={s.id}
								className="border border-gray-200 rounded-lg p-4"
							>
								<Typography
									variant="h6"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{s.title}
								</Typography>
								<Typography
									variant="small"
									color="gray"
									className="mt-1"
									placeholder={undefined}
									onPointerEnterCapture={undefined}
									onPointerLeaveCapture={undefined}
								>
									{s.description}
								</Typography>
								{s.user && (
									<Typography
										variant="small"
										color="blue-gray"
										className="mt-2 font-medium"
										placeholder={undefined}
										onPointerEnterCapture={undefined}
										onPointerLeaveCapture={undefined}
									>
										Enviado por: {s.user.name} {s.user.last_name}
									</Typography>
								)}
							</div>
						))}
					</div>
				)}
			</DialogBody>
			<DialogFooter
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<Button
					variant="text"
					color="red"
					onClick={handler}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					Cerrar
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default SuggestionListDialog;
