import { Toaster } from 'sonner';
import { BrowserRouter as Router } from 'react-router-dom';

import { AppRoutes } from '@/app/router';
import { AppProviders } from '@/app/AppProviders';

function App() {
  return (
    <>
      <Toaster position="bottom-right" richColors theme="system" />
      <Router>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </Router>
    </>
  );
}

export default App;
