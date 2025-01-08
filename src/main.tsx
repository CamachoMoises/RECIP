import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { store, persistor } from './store';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@material-tailwind/react';
import { Toaster } from 'react-hot-toast';
createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<ThemeProvider>
			<Provider store={store}>
				<PersistGate loading={null} persistor={persistor}>
					<Toaster />
					<App />
				</PersistGate>
			</Provider>
		</ThemeProvider>
	</StrictMode>
);
