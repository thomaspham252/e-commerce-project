import { AppRoutes } from './routes/AppRoutes';
import { SavedJobsProvider } from './context/SavedJobsContext';
import { ApplicationsProvider } from './context/ApplicationsContext';
import { WalletProvider } from './context/WalletContext.jsx';
import { EmployerPackageProvider } from './context/EmployerPackageContext.jsx';

function App() {
  return (
    <SavedJobsProvider>
      <ApplicationsProvider>
        <WalletProvider>
          <EmployerPackageProvider>
            <AppRoutes />
          </EmployerPackageProvider>
        </WalletProvider>
      </ApplicationsProvider>
    </SavedJobsProvider>
  );
}

export default App;
