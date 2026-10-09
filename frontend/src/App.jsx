import { AppRoutes } from './routes/AppRoutes';
import { SavedJobsProvider } from './context/SavedJobsContext';
import { ApplicationsProvider } from './context/ApplicationsContext';
import { WalletProvider } from './context/WalletContext.jsx';
import { EmployerPackageProvider } from './context/EmployerPackageContext.jsx';

function App() {
  return (
    <SavedJobsProvider>
      <ApplicationsProvider>
        <AppRoutes />
      </ApplicationsProvider>
      <WalletProvider>
        <EmployerPackageProvider>
          <AppRoutes />
        </EmployerPackageProvider>
      </WalletProvider>
    </SavedJobsProvider>
  );
}

export default App;
