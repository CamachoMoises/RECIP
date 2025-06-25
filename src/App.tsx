// import { Counter } from './features/counter/Counter';
import {
	BrowserRouter as Router,
	Route,
	Routes,
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import ContactPage from './pages/ContactPage';
import NavBar from './components/NavBar';
import Login from './pages/login';
import NuevoCurso from './pages/pages/nuevoCurso';
import './App.css';
import Dashboard from './pages/pages/dashboard';
import ScrollToTop from './components/scrollTop';

function App() {
	return (
		<div className="min-h-screen w-full">
			<div className="flex flex-col  px-5 gap-3 ">
				<Router>
					<div className="content">
						<NavBar />

						<div className="w-full">
							<ScrollToTop />
							<Routes>
								{/* Rutas para diferentes páginas */}
								<Route path="/" element={<HomePage />} />
								<Route path="/about" element={<AboutUs />} />
								<Route path="/contact" element={<ContactPage />} />
								<Route path="/login" element={<Login />} />
								<Route path="/dashboard/*" element={<Dashboard />} />
								<Route
									path="/nuevoCurso/*"
									element={<NuevoCurso />}
								/>
							</Routes>
						</div>
					</div>
				</Router>
				{/* <Counter /> */}
			</div>
		</div>
	);
}

export default App;
