import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { RiHomeLine, RiCalendarTodoLine, RiTodoLine, RiHomeFill, RiCalendarTodoFill, RiTodoFill } from 'react-icons/ri';
import './header.scss';
import logoIcon from '../../assets/logo/logo-small.png';

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getIcon = (path) => {
        const isActive = location.pathname === path;
        switch (path) {
            case '/':
                return isActive ? <RiHomeFill /> : <RiHomeLine />;
            case '/today':
                return isActive ? <RiTodoFill /> : <RiTodoLine />;
            case '/tomorrow':
                return isActive ? <RiCalendarTodoFill /> : <RiCalendarTodoLine />;
            default:
                return null;
        }
    };

    return (
        <div className={`bottom_nav ${scrolled ? 'scrolled' : ''}`}>
            <div className='nav_content'>
                <div className='logo_wrapper'>
                    <img src={logoIcon} alt='PA icon' className='logo_icon' />
                </div>
                <div className='nav_divider'></div>
                <nav className='nav_section'>
                    {[
                        { path: '/', title: 'Home' },
                        { path: '/today', title: "Today's Tasks" },
                        { path: '/tomorrow', title: "Tomorrow's Plan" }
                    ].map(({ path, title }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className='nav_item'
                        >
                            {getIcon(path)}
                            <span className="tooltip">{title}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
}
