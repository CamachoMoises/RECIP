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
import './app.css';
import Dashboard from './pages/pages/dashboard';
import ScrollToTop from './components/scrollTop';

function App() {
	return (
		<div className="min-h-screen w-full">
			<div className=" flex flex-col pt-24 px-5 gap-3 ">
				<Router>
					<div className="video-container">
						<div className="content">
							<NavBar />
							<div className="flex flex-col p-2"></div>
							<div className=" flex flex-row gap-3 ">
								<div>
									<video
										className="rounded-lg shadow-lg"
										width="150"
										height="150"
										loop
										autoPlay
										muted
									>
										<source
											src="/video/video_background.mp4"
											type="video/mp4"
										/>
										Tu navegador no soporta el elemento de video.
									</video>
								</div>
								<div className="w-full">
									<ScrollToTop />
									<Routes>
										{/* Rutas para diferentes páginas */}

										<Route path="/" element={<HomePage />} />
										<Route path="/about" element={<AboutUs />} />
										<Route
											path="/contact"
											element={<ContactPage />}
										/>
										<Route path="/login" element={<Login />} />
										<Route
											path="/dashboard/*"
											element={<Dashboard />}
										/>
										<Route
											path="/nuevoCurso/*"
											element={<NuevoCurso />}
										/>
									</Routes>
								</div>
							</div>
						</div>
					</div>
				</Router>
				{/* <Counter /> */}
			</div>
		</div>
	);
}

export default App;
