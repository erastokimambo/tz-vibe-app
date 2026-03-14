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

const router = createBrowserRouter([
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
  }
], {
  basename: '/app' // Ensures all internal routing gets prefixed properly
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
