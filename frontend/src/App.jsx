import { AppRoutes } from './routes/AppRoutes';
import { SavedJobsProvider } from './context/SavedJobsContext';

function App() {
  return (
    <SavedJobsProvider>
      <AppRoutes />
    </SavedJobsProvider>
  );
}

export default App;
