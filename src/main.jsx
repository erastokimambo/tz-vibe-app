import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import Explore from './views/Explore.jsx';
import MapView from './views/Map.jsx';
import Trending from './views/Trending.jsx';
import Messages from './views/Messages.jsx';
import UserMenu from './views/UserMenu.jsx';
import ListBusiness from './views/ListBusiness.jsx';
import Landing from './views/Landing.jsx';
import Login from './views/Login.jsx';
import SavedListings from './views/SavedListings.jsx';
import MyPlans from './views/MyPlans.jsx';
import ManageListings from './views/ManageListings.jsx';
import AdminPanel from './views/AdminPanel.jsx';

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
  },
  {
    path: '/admin',
    element: <AdminPanel />,
  }
]);

import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
