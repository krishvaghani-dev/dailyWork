import React from 'react';
import TaskManager from '../../components/TaskManager';
import './home.scss';

export default function Home() {
    return (
        <div className="home-container">
            <h1>Daily Work Planner</h1>
            <TaskManager />
        </div>
    )
}
