import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/app/App'
import { ErrorBoundaryComponent } from '@/shared/components/ErrorBoundary'
import { logBundleSize } from '@/shared/utils/performance'

// Log bundle size in development
if (process.env.NODE_ENV === 'development') {
  logBundleSize();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundaryComponent>
      <App />
    </ErrorBoundaryComponent>
  </StrictMode>,
)
