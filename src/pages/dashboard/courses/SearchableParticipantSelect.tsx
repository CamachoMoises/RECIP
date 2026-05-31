import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { searchedStudentItem } from '../../../types/utilities';
import { fetchSearchedStudent } from '../../../features/userSlice';

interface Props {
	value: searchedStudentItem | null;
	onChange: (student: searchedStudentItem) => void;
	disabled?: boolean;
}

const SearchableParticipantSelect = ({
	value,
	onChange,
	disabled = false,
}: Props) => {
	const dispatch = useDispatch<AppDispatch>();
	const { searchedStudent, status } = useSelector(
		(state: RootState) => state.users,
	);

	const [query, setQuery] = useState('');
	const [open, setOpen] = useState(false);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (value) setQuery(value.name);
		else setQuery('');
	}, [value?.student_id]);

	useEffect(() => {
		if (!open || disabled) return;
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			dispatch(fetchSearchedStudent(query));
		}, 300);
		return () => {
			if (debounceRef.current) clearTimeout(debounceRef.current);
		};
	}, [query, open, disabled, dispatch]);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(e.target as Node)
			) {
				setOpen(false);
				if (value) setQuery(value.name);
				else setQuery('');
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [value]);

	const handleSelect = (student: searchedStudentItem) => {
		setQuery(student.name);
		setOpen(false);
		onChange(student);
	};

	const isLoading = status === 'loading';
	const labelUp = query || open;

	return (
		<div ref={wrapperRef} className="relative w-full">
			<div className="relative">
				<input
					type="text"
					disabled={disabled}
					value={query}
					placeholder=" "
					onChange={(e) => {
						setQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					className={`peer w-full h-10 px-3 pt-3 pb-1 text-sm border rounded-[7px] outline-none transition-all border-blue-gray-200 focus:border-2 focus:border-gray-900 disabled:bg-blue-gray-50 disabled:border-0 disabled:cursor-not-allowed bg-transparent text-blue-gray-700`}
				/>
				<label
					className={`absolute left-3 transition-all pointer-events-none ${labelUp ? 'top-1 text-xs text-gray-900' : 'top-1/2 -translate-y-1/2 text-sm text-blue-gray-400'}`}
				>
					Seleccionar participante
				</label>
				{isLoading && (
					<div className="absolute right-3 top-1/2 -translate-y-1/2">
						<div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
					</div>
				)}
			</div>

			{open && !disabled && (
				<ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-blue-gray-100 rounded-md shadow-lg text-sm text-blue-gray-700">
					{isLoading && (
						<li className="px-3 py-2 text-blue-gray-400">Buscando...</li>
					)}
					{!isLoading && searchedStudent.length === 0 && (
						<li className="px-3 py-2 text-blue-gray-400">Sin resultados</li>
					)}
					{!isLoading &&
						searchedStudent.map((student) => (
							<li
								key={student.student_id}
								onMouseDown={() => handleSelect(student)}
								className={`px-3 py-2 cursor-pointer hover:bg-blue-gray-50 flex flex-col ${value?.student_id === student.student_id ? 'bg-blue-50' : ''}`}
							>
								<span className="font-medium">{student.name}</span>
								<span className="text-xs text-blue-gray-400">
									{student.email}
								</span>
							</li>
						))}
				</ul>
			)}
		</div>
	);
};

export default SearchableParticipantSelect;
