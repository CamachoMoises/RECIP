// import { Counter } from './features/counter/Counter';
import {
	BrowserRouter as Router,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import ContactPage from './pages/ContactPage';
import NavBar from './components/NavBar';
import Login from './pages/login';
import './App.css';
import Dashboard from './pages/dashboard';
import ScrollToTop from './components/scrollTop';
import NotFound from './pages/notFound';

function AppLayout() {
	const location = useLocation();
	const isLogin = location.pathname === '/login';

	if (isLogin) {
		return (
			<>
				<ScrollToTop />
				<Routes>
					<Route path="/login" element={<Login />} />
				</Routes>
			</>
		);
	}

	return (
		<>
			<NavBar />
			<div className="flex flex-col gap-3">
				<div className="content">
					<div className="w-full">
						<ScrollToTop />
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route path="/about" element={<AboutUs />} />
							<Route path="/contact" element={<ContactPage />} />
							<Route path="/dashboard/*" element={<Dashboard />} />
							<Route path="*" element={<NotFound />} />
						</Routes>
					</div>
				</div>
			</div>
		</>
	);
}

function App() {
	return (
		<div>
			<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
				<AppLayout />
			</Router>
		</div>
	);
}

export default App;
