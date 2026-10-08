import { AppRoutes } from './routes/AppRoutes';
import { SavedJobsProvider } from './context/SavedJobsContext';
import { WalletProvider } from './context/WalletContext.jsx';

function App() {
  return (
    <SavedJobsProvider>
      <WalletProvider>
        <AppRoutes />
      </WalletProvider>
    </SavedJobsProvider>
  );
}

export default App;
