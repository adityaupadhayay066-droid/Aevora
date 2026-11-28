import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from '../pages/HomePage';
import PlaceholderPage from '../pages/PlaceholderPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'explore',
        element: <PlaceholderPage />,
      },
      {
        path: 'destinations',
        element: <PlaceholderPage />,
      },
      {
        path: 'plan',
        element: <PlaceholderPage />,
      },
      {
        path: 'about',
        element: <PlaceholderPage />,
      },
      {
        path: 'ai-assistant',
        element: <PlaceholderPage />,
      },
      {
        path: 'login',
        element: <PlaceholderPage />,
      },
      {
        path: '*',
        element: <PlaceholderPage title="Page Not Found" description="The requested destination does not exist or has moved." />,
      },
    ],
  },
]);

export default router;
