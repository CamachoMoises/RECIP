import { Button, IconButton, Typography } from '@material-tailwind/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TestListPaginationProps {
	active: number;
	totalPages: number;
	totalItems: number;
	getItemProps: (index: number) => any;
	onPrev: () => void;
	onNext: () => void;
}

const TestListPagination = ({
	active,
	totalPages,
	totalItems,
	getItemProps,
	onPrev,
	onNext,
}: TestListPaginationProps) => {
	const pages =
		totalPages > 0
			? Array.from({ length: totalPages }, (_, i) => ({
					id: i,
					name: `Pagina ${i + 1}`,
			  }))
			: [];

	return (
		<div className="mt-6">
			<div className="flex flex-col w-full text-center mb-2">
				<small className="text-sm text-gray-600">
					Total: {totalItems} registros
				</small>
			</div>

			<div className="flex w-full justify-center gap-4">
				<Button
					variant="text"
					className="flex items-center gap-1 rounded-full text-xs sm:text-sm"
					onClick={onPrev}
					disabled={active === 1}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<ChevronLeft
						strokeWidth={2}
						className="h-4 w-4"
					/>
					<span className="hidden sm:inline">Anterior</span>
				</Button>

				<div className="hidden sm:flex items-center gap-2">
					{pages.map((page) => (
						<IconButton
							key={page.name}
							{...getItemProps(page.id + 1)}
							className="text-xs sm:text-sm"
						>
							{page.id + 1}
						</IconButton>
					))}
				</div>

				<div className="sm:hidden flex items-center">
					<Typography
						className="text-sm font-medium"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						Página {active} de {totalPages}
					</Typography>
				</div>

				<Button
					variant="text"
					className="flex items-center gap-1 rounded-full text-xs sm:text-sm"
					onClick={onNext}
					disabled={active === totalPages}
					placeholder={undefined}
					onPointerEnterCapture={undefined}
					onPointerLeaveCapture={undefined}
				>
					<span className="hidden sm:inline">Siguiente</span>
					<ChevronRight
						strokeWidth={2}
						className="h-4 w-4"
					/>
				</Button>
			</div>
		</div>
	);
};

export default TestListPagination;