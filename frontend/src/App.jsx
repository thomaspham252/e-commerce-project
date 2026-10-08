import { AppRoutes } from './routes/AppRoutes';
import { SavedJobsProvider } from './context/SavedJobsContext';
import { ApplicationsProvider } from './context/ApplicationsContext';

function App() {
  return (
    <SavedJobsProvider>
      <ApplicationsProvider>
        <AppRoutes />
      </ApplicationsProvider>
    </SavedJobsProvider>
  );
}

export default App;
