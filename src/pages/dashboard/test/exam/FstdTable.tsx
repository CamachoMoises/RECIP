import { Minus } from 'lucide-react';

/**
 * Tabla de 44 casillas del formulario de "condiciones de operación" (FSTD).
 *
 * Antes eran 44 `<input>` copiados a mano, con el mismo `id`/`name` repetido y
 * con la fila/columna de cada casilla hardcodeada. Aquí la posición es dato:
 * `rows[i].cells[j]` es el índice del slot que se escribe en la columna `j+1`,
 * o `null` cuando esa celda es un guion. El orden de los slots es el orden en
 * que el backend espera el arreglo `resp`, así que **no** se debe reordenar.
 */

const HEADERS = [
	'CONDICIÓN DE OPERACIÓN',
	'SHP',
	'TORSIÓN LBS/PIE',
	'ITT MAXIMA OBSERVADA (ºC)',
	'GENERADOR DE GAS RPM N1',
	'GENERADOR DE GAS RPM N1',
	'RPM DE HELICE N2',
	'PRESIÓN DE ACEITE PSI (2)',
	'TEMP. DE ACEITE ºC',
];

type Row = { label: string; cells: Array<number | null> };

const ROWS: Row[] = [
	{ label: 'STARTING', cells: [null, null, 0, null, null, null, null, 1] },
	{ label: 'LOW IDLE', cells: [null, null, 2, 3, 4, null, 5, 6] },
	{ label: 'HIGH IDLE', cells: [null, null, null, null, null, null, null, 7] },
	{
		label: 'TAKEOFF AND MAX CONT',
		cells: [8, 9, 10, 11, 12, 13, 14, 15],
	},
	{ label: 'MAX CRUISE', cells: [16, 17, 18, 19, 20, 21, 22, 23] },
	{
		label: 'CRUISE CLIMB AND REC (NORMAL) CRUISE',
		cells: [24, 25, 26, 27, 28, 29, 30, 31],
	},
	{
		label: 'MAX REVERSE (9)',
		cells: [32, null, 33, null, 34, 35, 36, 37],
	},
	{
		label: 'TRANSIENT',
		cells: [null, 38, 39, 40, 41, 42, null, 43],
	},
];

const inputClass =
	'w-full min-w-[4.5rem] rounded-md bg-slate-100 px-2 py-1.5 text-center text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-sky-200 disabled:bg-slate-100 disabled:text-slate-500';

const FstdTable = ({
	questionId,
	values,
	onChange,
	disabled,
}: {
	questionId: number;
	values: string[];
	onChange: (index: number, value: string) => void;
	disabled?: boolean;
}) => (
	<div className="w-full">
		<p className="mb-1.5 text-[11px] text-slate-500 sm:hidden">
			Desliza la tabla horizontalmente para ver todas las columnas.
		</p>
		<div className="w-full overflow-auto">
			<table className="w-full min-w-[860px] border-collapse text-left">
				<thead>
					<tr>
						{HEADERS.map((header, index) => (
							<th
								key={`h-${index}`}
								className="bg-slate-50 p-2 text-center text-[11px] font-semibold leading-tight text-slate-600"
							>
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{ROWS.map((row, rowIndex) => (
						<tr
							key={row.label}
							className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}
						>
							<td className="p-2 text-center text-xs font-medium text-slate-700">
								{row.label}
							</td>
							{row.cells.map((slot, columnIndex) => (
								<td
									key={`${row.label}-${columnIndex}`}
									className="p-1.5 text-center align-middle"
								>
									{slot === null ? (
										<span className="flex justify-center text-slate-300">
											<Minus size={16} />
										</span>
									) : (
										<input
											type="text"
											inputMode="decimal"
											aria-label={`${row.label} - ${HEADERS[columnIndex + 1]}`}
											id={`fstd-${questionId}-${slot}`}
											name={`fstd-${questionId}-${slot}`}
											value={values[slot] ?? ''}
											disabled={disabled}
											onChange={(event) =>
												onChange(slot, event.target.value)
											}
											className={inputClass}
										/>
									)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	</div>
);

export default FstdTable;
