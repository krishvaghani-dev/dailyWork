import React from 'react';
import { RouterProvider } from 'react-router-dom';
import routes from './routes';
import './styles/index.scss';

function App() {
  return (
    <RouterProvider router={routes} />
  )
}

export default App
