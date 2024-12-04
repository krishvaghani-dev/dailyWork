import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../common/Header/index';
import Footer from '../../common/Footer/index';

export default function defaultLayout() {
    return (
        <div>
            <Header />
            <Outlet />
            <Footer />
        </div>
    )
}
