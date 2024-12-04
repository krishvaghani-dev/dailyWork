import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../common/header/index';
import Footer from '../../common/footer/index';

export default function defaultLayout() {
    return (
        <div>
            <Header />
            <Outlet />
            <Footer />
        </div>
    )
}
