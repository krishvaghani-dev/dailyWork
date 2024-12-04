import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/home/index.jsx';
import DefaultLayout from './defaultLayout/defaultLayout.jsx';
const routes = createBrowserRouter([
    {
        path: '/',
        element: <DefaultLayout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
        ],
    },
])

export default routes;
