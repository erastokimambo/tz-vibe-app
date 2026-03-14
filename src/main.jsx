import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './styles/index.css';
import App from './App.jsx';
import Explore from './features/explore/Explore.jsx';
import MapView from './features/map/Map.jsx';
import Trending from './features/explore/Trending.jsx';
import Messages from './features/messaging/Messages.jsx';
import UserMenu from './components/UserMenu.jsx';
import ListBusiness from './features/vendor/ListBusiness.jsx';
import Landing from './features/explore/Landing.jsx';
import Login from './features/explore/Login.jsx';
import SavedListings from './features/explore/SavedListings.jsx';
import MyPlans from './features/explore/MyPlans.jsx';
import ManageListings from './features/vendor/ManageListings.jsx';
import AdminPanel from './features/vendor/AdminPanel.jsx';
import OnboardingGate from './components/OnboardingGate.jsx';

const router = createBrowserRouter([
  {
    path: '/about',
    element: <Landing />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: <OnboardingGate />,
    children: [
      {
        path: '/',
        element: <App />,
        children: [
          {
            path: '/',
            element: <Explore />,
          },
          {
            path: '/map',
            element: <MapView />,
          },
          {
            path: '/trending',
            element: <Trending />,
          },
          {
            path: '/messages',
            element: <Messages />,
          },
          {
            path: '/menu',
            element: <UserMenu />,
          },
        ],
      },
      {
        path: '/list-business',
        element: <ListBusiness />,
      },
      {
        path: '/dashboard/saved',
        element: <SavedListings />,
      },
      {
        path: '/dashboard/plans',
        element: <MyPlans />,
      },
      {
        path: '/dashboard/manage',
        element: <ManageListings />,
      }
    ]
  },
  {
    path: '/admin',
    element: <AdminPanel />,
  }
]);

import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
