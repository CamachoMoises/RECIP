'use client';
import cn from '../lib/utils';
import React, { useTransition } from 'react';
import { Breadcrumbs, Button } from '@material-tailwind/react';
import { ChevronLeft, Home } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

type breadCrumbsItems = {
	name: string;
	href: string;
	parametros?: [];
};
type Props = {
	title: string;
	classname?: string;
	breadCrumbs?: breadCrumbsItems[];
};

export default function PageTitle({
	title,
	classname,
	breadCrumbs = [],
}: Props) {
	const navigate = useNavigate();
	const location = useLocation();
	// console.log(location.pathname);
	const pathName = location.pathname;
	const [isPending, startTransition] = useTransition();
	const handleBack = () => {
		navigate(-1);
	};
	return (
		<>
			<div className="flex flex-col py-3">
				<div className="flex-auto px-1">
					<h1 className={cn('text-2xl font-semibold', classname)}>
						{title}
					</h1>
				</div>
				<div className="flex flex-row gap-1">
					<Button
						onClick={handleBack}
						variant="text"
						title="Volver"
						className="text-xs bg-blue-gray-50"
						size="sm"
						placeholder={undefined}
						onPointerEnterCapture={undefined}
						onPointerLeaveCapture={undefined}
					>
						<ChevronLeft size={13} />
					</Button>
					{pathName !== '/' && (
						<Breadcrumbs
							placeholder={undefined}
							onPointerEnterCapture={undefined}
							onPointerLeaveCapture={undefined}
						>
							<a onClick={() => navigate('/')} className="opacity-60">
								<Home size={13} />
							</a>
							{breadCrumbs.map((item: breadCrumbsItems) => (
								<a
									onClick={() =>
										item.parametros
											? startTransition(() =>
													navigate(
														`${item.href}?${new URLSearchParams(
															item.parametros
														).toString()}`
													)
											  )
											: startTransition(() => navigate(item.href))
									}
									className="opacity-60"
									key={item.name}
								>
									{item.name}
								</a>
							))}
							<span>{title ? title : 'Desconocido'}</span>
						</Breadcrumbs>
					)}
				</div>
			</div>
		</>
	);
}
