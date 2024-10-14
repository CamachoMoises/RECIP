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
import Login from './pages/login';
import Cursos from './pages/pages/cursos';
import NuevoCurso from './pages/pages/nuevoCurso';
import './app.css';

function App() {
	return (
		<div className="min-h-screen w-full">
			<div className=" flex flex-col pt-24 px-16 gap-3 ">
				<Router>
					<div className="video-container">
						<video className="video-background" autoPlay loop muted>
							<source
								src="video/video_background.mp4"
								type="video/mp4"
							/>
							Tu navegador no soporta el video HTML5.
						</video>
						<div className="content">
							<NavBar />
							<div className="flex flex-col p-2"></div>
							<Routes>
								{/* Rutas para diferentes páginas */}

								<Route path="/" element={<HomePage />} />
								<Route path="/about" element={<AboutUs />} />
								<Route path="/contact" element={<ContactPage />} />
								<Route path="/login" element={<Login />} />
								<Route path="/cursos/*" element={<Cursos />} />
								<Route
									path="/nuevoCurso/*"
									element={<NuevoCurso />}
								/>
							</Routes>
						</div>
					</div>
				</Router>
				<Counter />
			</div>
		</div>
	);
}

export default App;
