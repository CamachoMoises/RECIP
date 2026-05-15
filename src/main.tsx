import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/global.css';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@material-tailwind/react';
import { Toaster } from 'react-hot-toast';
import ThemeInitializer from './components/ThemeInitializer';
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ThemeProvider>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<ThemeInitializer />
					<Toaster
						toastOptions={{
							style: {
								zIndex: 99999,
							},
						}}
						containerStyle={{
							zIndex: 99999,
						}}
					/>
					<App />
				</PersistGate>
			</Provider>
		</ThemeProvider>
	</StrictMode>,
);
