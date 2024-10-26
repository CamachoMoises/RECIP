import {
	Button,
	Dialog,
	DialogBody,
	DialogFooter,
	DialogHeader,
} from '@material-tailwind/react';
import { user } from '../../../../types/utilidades';

const ModalNewUser = ({
	userSelect,
	openNewUser,
	handleOpen,
}: {
	userSelect: user | null;
	openNewUser: boolean;
	handleOpen: () => void;
}) => {
	return (
		<Dialog
			placeholder={undefined}
			onPointerEnterCapture={undefined}
			onPointerLeaveCapture={undefined}
			open={openNewUser}
			handler={handleOpen}
		>
			<DialogHeader
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				Crear
			</DialogHeader>
			<DialogBody
				placeholder={undefined}
				onPointerEnterCapture={undefined}
				onPointerLeaveCapture={undefined}
			>
				<code>{JSON.stringify(userSelect, null, 4)}</code>
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
					<span>Cancel</span>
				</Button>
				<Button
					variant="gradient"
					color="green"
					onClick={handleOpen}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<span>Confirm</span>
				</Button>
			</DialogFooter>
		</Dialog>
	);
};

export default ModalNewUser;
