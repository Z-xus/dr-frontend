import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { SignupPage } from './pages'
import LoginPage from './pages/LoginPage.tsx'
import DashboardPage from './pages/Dashboard.tsx'
import Redact from './pages/Redact.tsx'
import Analyzer from './pages/Analyzer.tsx'
import Test from './pages/Test.tsx'
import RedactPdf from './pages/RedactPdf.tsx'
import RedactImage from './pages/RedactImage.tsx'

const tmp = 'h-screen bg-black text-white text-4xl text-center grid place-items-center'
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <div className={tmp}>Oops.. There seems to be a problem.</div>,
    children: [
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/signup',
        element: <SignupPage />,
      },
      {
        path: '/login',
        element: <LoginPage />
      }, {
        path: '/analyze',
        element: <Analyzer />
      },
      {
        path: '/redact',
        element: <Redact />
      }, {
        path: '/test',
        element: <Test />
      }, {
        path: '/test-pdf',
        element: <RedactPdf />
      }, {
        path: '/test-image',
        element: <RedactImage />
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
