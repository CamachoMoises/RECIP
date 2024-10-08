import { Counter } from './features/counter/Counter';
import {
	BrowserRouter as Router,
	Route,
	Routes,
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import ContactPage from './pages/ContactPage';
import NavBar from './components/NavBar';

function App() {
	return (
		<div className="min-h-screen w-full">
			<NavBar />
			<div className="pt-20 px-8 ">
				<Router>
					<Routes>
						{/* Rutas para diferentes páginas */}
						<Route path="/" element={<HomePage />} />
						<Route path="/about" element={<AboutUs />} />
						<Route path="/contact" element={<ContactPage />} />
					</Routes>
				</Router>

				<Counter />
			</div>
		</div>
	);
}

export default App;
