import { AppRoutes } from './routes/AppRoutes';
import { SavedJobsProvider } from './context/SavedJobsContext';
import { WalletProvider } from './context/WalletContext.jsx';
import { EmployerPackageProvider } from './context/EmployerPackageContext.jsx';

function App() {
  return (
    <SavedJobsProvider>
      <WalletProvider>
        <EmployerPackageProvider>
          <AppRoutes />
        </EmployerPackageProvider>
      </WalletProvider>
    </SavedJobsProvider>
  );
}

export default App;
