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
import './App.css';
import Dashboard from './pages/pages/dashboard';
import ScrollToTop from './components/scrollTop';
import NotFound from './pages/notFound';

function App() {
	return (
		<div>
			<Router>
				<NavBar />
				<div className="flex flex-col  gap-3">
					<div className="content">
						<div className="w-full">
							<ScrollToTop />
							<Routes>
								{/* Rutas para diferentes páginas */}
								<Route path="/" element={<HomePage />} />
								<Route path="/about" element={<AboutUs />} />
								<Route path="/contact" element={<ContactPage />} />
								<Route path="/login" element={<Login />} />
								<Route path="/dashboard/*" element={<Dashboard />} />

								<Route path="*" element={<NotFound />} />
							</Routes>
						</div>
					</div>
				</div>
				{/* <Counter /> */}
			</Router>
		</div>
	);
}

export default App;
