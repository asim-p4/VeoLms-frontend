import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// NOTE: React.StrictMode is intentionally removed.
// StrictMode double-fires useEffect in dev, which causes two simultaneous
// POST /auth/refresh requests. Since the server rotates tokens (delete old → create new),
// the second concurrent request always fails with 401, immediately logging the user out.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />,
)
