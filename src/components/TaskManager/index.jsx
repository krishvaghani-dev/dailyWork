import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
    RiAddLine, RiCheckLine, RiDeleteBinLine, RiEditLine,
    RiTimeLine, RiFlagLine, RiCalendarLine, RiAlarmWarningLine,
    RiCalendarTodoLine, RiCalendarCheckLine, RiArrowLeftSLine,
    RiArrowRightSLine, RiCalendarEventLine, RiCalendar2Line,
    RiAlertFill, RiErrorWarningFill, RiCheckboxCircleFill,
    RiTimer2Line, RiTimerLine, RiAlarmLine,
    RiArrowUpSLine, RiArrowDownSLine, RiTimeFill,
    RiArrowUpDownLine
} from 'react-icons/ri';
import './taskManager.scss';

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn cancel" onClick={onClose}>
                        {cancelText}
                    </button>
                    <button className="modal-btn confirm" onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TaskStats = ({ tasks }) => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    return (
        <div className="task-stats">
            <span>Total: {totalTasks}</span>
            <span>Pending: {pendingTasks}</span>
            <span>Completed: {completedTasks}</span>
        </div>
    );
};

const FilterBar = ({
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    isVisible,
    onToggle
}) => {
    const statusFilters = [
        { value: 'all', label: 'All Tasks', icon: <RiCalendarTodoLine /> },
        { value: 'today', label: 'Today', icon: <RiCalendarEventLine /> },
        { value: 'tomorrow', label: 'Tomorrow', icon: <RiCalendarCheckLine /> },
        { value: 'upcoming', label: 'Upcoming', icon: <RiCalendarLine /> },
        { value: 'completed', label: 'Completed', icon: <RiCheckboxCircleFill /> }
    ];

    const priorityFilters = [
        { value: 'high', label: 'High', icon: <RiAlertFill className="high" /> },
        { value: 'medium', label: 'Medium', icon: <RiErrorWarningFill className="medium" /> },
        { value: 'low', label: 'Low', icon: <RiCheckboxCircleFill className="low" /> }
    ];

    const sortOptions = [
        { value: 'priority', label: 'Priority', icon: <RiAlertFill /> },
        { value: 'date', label: 'Due Date', icon: <RiCalendarLine /> },
        { value: 'name', label: 'Task Name', icon: <RiArrowUpDownLine /> }
    ];

    return (
        <div className="filters-container">
            <div className="filters-header">
                <button
                    className="filters-toggle"
                    onClick={onToggle}
                >
                    <RiArrowUpDownLine
                        className={`toggle-icon ${isVisible ? 'up' : ''}`}
                    />
                    <span>Filters & Sort</span>
                    <span className="active-filters">
                        {filter !== 'all' && `• ${filter}`}
                        {sortBy && ` • Sorted by ${sortBy}`}
                    </span>
                </button>
            </div>

            {isVisible && (
                <div className="filters-content">
                    <div className="filters-section">
                        <h4>Filter by Status</h4>
                        <div className="filter-group">
                            {statusFilters.map(option => (
                                <button
                                    key={option.value}
                                    className={`filter-button ${filter === option.value ? 'active' : ''}`}
                                    onClick={() => setFilter(option.value)}
                                >
                                    {option.icon}
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filters-section">
                        <h4>Filter by Priority</h4>
                        <div className="filter-group">
                            {priorityFilters.map(option => (
                                <button
                                    key={option.value}
                                    className={`filter-button priority-filter ${filter === option.value ? 'active' : ''}`}
                                    onClick={() => setFilter(option.value)}
                                >
                                    {option.icon}
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filters-section">
                        <h4>Sort Tasks</h4>
                        <div className="sort-group">
                            {sortOptions.map(option => (
                                <button
                                    key={option.value}
                                    className={`sort-button ${sortBy === option.value ? 'active' : ''}`}
                                    onClick={() => setSortBy(option.value)}
                                >
                                    {option.icon}
                                    <span>{option.label}</span>
                                </button>
                            ))}
                            <button
                                className="sort-direction"
                                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                                title={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
                            >
                                {sortDirection === 'asc' ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                                <span>{sortDirection === 'asc' ? 'A to Z' : 'Z to A'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const formatDate = (date) => {
    return format(new Date(date), 'MMM dd, yyyy hh:mm a');
};

const getPriorityWeight = (priority) => {
    switch (priority) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 0;
    }
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'high': return '#dc3545';
        case 'medium': return '#ffc107';
        case 'low': return '#28a745';
        default: return '#666';
    }
};

const Calendar = ({ selectedDate, setSelectedDate, setIsCalendarOpen }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
    const today = new Date();

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);

    startDate.setDate(startDate.getDate() - startDate.getDay());
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const weeks = [];
    let days = [];
    let day = new Date(startDate);

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            days.push(new Date(day));
            day.setDate(day.getDate() + 1);
        }
        weeks.push(days);
        days = [];
    }

    const isToday = (date) => {
        return date.toDateString() === today.toDateString();
    };

    const isPastDate = (date) => {
        return date < new Date(today.setHours(0, 0, 0, 0));
    };

    const handleDateSelect = (date) => {
        const newDate = new Date(date);
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
        setSelectedDate(newDate);
        setIsCalendarOpen(false);
    };

    return (
        <div className="calendar">
            <div className="calendar-header">
                <button
                    className="month-nav"
                    onClick={() => setCurrentMonth(prev => {
                        const newDate = new Date(prev);
                        newDate.setMonth(prev.getMonth() - 1);
                        return newDate;
                    })}
                >
                    <RiArrowLeftSLine />
                </button>
                <span className="current-month">{format(currentMonth, 'MMMM yyyy')}</span>
                <button
                    className="month-nav"
                    onClick={() => setCurrentMonth(prev => {
                        const newDate = new Date(prev);
                        newDate.setMonth(prev.getMonth() + 1);
                        return newDate;
                    })}
                >
                    <RiArrowRightSLine />
                </button>
            </div>
            <div className="weekdays">
                {weekDays.map(day => (
                    <div key={day} className="weekday">{day}</div>
                ))}
            </div>
            <div className="days">
                {weeks.map((week, i) => (
                    <div key={i} className="week">
                        {week.map(date => {
                            const isDisabled = isPastDate(date);
                            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                            const isSelected = date.toDateString() === selectedDate.toDateString();
                            const isTodayDate = isToday(date);

                            return (
                                <button
                                    key={date.getTime()}
                                    className={`day ${isCurrentMonth ? 'current' : 'other'}
                                            ${isSelected ? 'selected' : ''}
                                            ${isTodayDate ? 'today' : ''}
                                            ${isDisabled ? 'disabled' : ''}`
                                    }
                                    onClick={() => !isDisabled && handleDateSelect(date)}
                                    disabled={isDisabled}
                                    title={isDisabled ? 'Past dates cannot be selected' : format(date, 'MMMM d, yyyy')}
                                >
                                    <span className="date-number">{date.getDate()}</span>
                                    {isTodayDate && <span className="today-dot"></span>}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="calendar-footer">
                <button
                    className="today-button"
                    onClick={() => handleDateSelect(today)}
                >
                    Today
                </button>
            </div>
        </div>
    );
};

const TimePicker = ({ selectedTime, setSelectedTime, setIsTimeOpen }) => {
    const handleTimeChange = (type, increment) => {
        setSelectedTime(prev => {
            const newTime = { ...prev };

            switch (type) {
                case 'hours':
                    let hours = parseInt(prev.hours);
                    if (increment) {
                        hours = hours === 12 ? 1 : hours + 1;
                    } else {
                        hours = hours === 1 ? 12 : hours - 1;
                    }
                    newTime.hours = hours.toString().padStart(2, '0');
                    break;

                case 'minutes':
                    let minutes = parseInt(prev.minutes);
                    if (increment) {
                        minutes = (minutes + 5) % 60;
                    } else {
                        minutes = (minutes - 5 + 60) % 60;
                    }
                    newTime.minutes = minutes.toString().padStart(2, '0');
                    break;

                case 'period':
                    newTime.period = prev.period === 'AM' ? 'PM' : 'AM';
                    break;
            }

            return newTime;
        });
    };

    const handleTimeInput = (type, value) => {
        let newValue = value.replace(/\D/g, '');

        switch (type) {
            case 'hours':
                const hours = parseInt(newValue);
                if (hours >= 1 && hours <= 12) {
                    newValue = hours.toString().padStart(2, '0');
                } else if (hours > 12) {
                    newValue = '12';
                } else {
                    newValue = '01';
                }
                break;

            case 'minutes':
                const minutes = parseInt(newValue);
                if (minutes >= 0 && minutes < 60) {
                    newValue = minutes.toString().padStart(2, '0');
                } else {
                    newValue = '00';
                }
                break;
        }

        setSelectedTime(prev => ({
            ...prev,
            [type]: newValue
        }));
    };

    const handleKeyDown = (e, type) => {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                handleTimeChange(type, true);
                break;
            case 'ArrowDown':
                e.preventDefault();
                handleTimeChange(type, false);
                break;
            case 'Tab':
                if (!e.shiftKey && type === 'minutes') {
                    e.preventDefault();
                    handleTimeChange('period', true);
                }
                break;
        }
    };

    const handlePeriodKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case ' ':
            case 'Enter':
                e.preventDefault();
                handleTimeChange('period', true);
                break;
        }
    };

    return (
        <div className="time-picker-dropdown">
            <div className="time-columns">
                <div className="time-column">
                    <div className="time-label">Hour</div>
                    <div className="time-spinner">
                        <button
                            className="spinner-button up"
                            onClick={() => handleTimeChange('hours', true)}
                            aria-label="Increase hour"
                        >
                            <RiArrowUpSLine />
                        </button>
                        <input
                            type="text"
                            className="time-value"
                            value={selectedTime.hours}
                            onChange={(e) => handleTimeInput('hours', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, 'hours')}
                            maxLength={2}
                            aria-label="Hour"
                        />
                        <button
                            className="spinner-button down"
                            onClick={() => handleTimeChange('hours', false)}
                            aria-label="Decrease hour"
                        >
                            <RiArrowDownSLine />
                        </button>
                    </div>
                </div>
                <div className="time-separator">:</div>
                <div className="time-column">
                    <div className="time-label">Minute</div>
                    <div className="time-spinner">
                        <button
                            className="spinner-button up"
                            onClick={() => handleTimeChange('minutes', true)}
                            aria-label="Increase minutes"
                        >
                            <RiArrowUpSLine />
                        </button>
                        <input
                            type="text"
                            className="time-value"
                            value={selectedTime.minutes}
                            onChange={(e) => handleTimeInput('minutes', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, 'minutes')}
                            maxLength={2}
                            aria-label="Minutes"
                        />
                        <button
                            className="spinner-button down"
                            onClick={() => handleTimeChange('minutes', false)}
                            aria-label="Decrease minutes"
                        >
                            <RiArrowDownSLine />
                        </button>
                    </div>
                </div>
                <div className="time-column period">
                    <div className="time-label">Period</div>
                    <div className="time-spinner">
                        <button
                            className="spinner-button up"
                            onClick={() => handleTimeChange('period', true)}
                            aria-label="Toggle AM/PM"
                        >
                            <RiArrowUpSLine />
                        </button>
                        <button
                            className="time-value period-toggle"
                            onClick={() => handleTimeChange('period', true)}
                            onKeyDown={handlePeriodKeyDown}
                            tabIndex={0}
                            aria-label="Period"
                        >
                            {selectedTime.period}
                        </button>
                        <button
                            className="spinner-button down"
                            onClick={() => handleTimeChange('period', false)}
                            aria-label="Toggle AM/PM"
                        >
                            <RiArrowDownSLine />
                        </button>
                    </div>
                </div>
            </div>
            <div className="time-actions">
                <button
                    className="time-confirm"
                    onClick={() => setIsTimeOpen(false)}
                >
                    Set Time
                </button>
            </div>
        </div>
    );
};

export default function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const [editText, setEditText] = useState('');
    const [priority, setPriority] = useState('medium');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('priority');
    const [sortDirection, setSortDirection] = useState('asc');
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    // Date and Time states
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isTimeOpen, setIsTimeOpen] = useState(false);
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState({
        hours: '09',
        minutes: '00',
        period: 'AM'
    });

    // Refs for click outside handling
    const calendarRef = useRef(null);
    const timeRef = useRef(null);
    const priorityRef = useRef(null);

    const priorityIcons = {
        high: <RiAlertFill className="high" />,
        medium: <RiErrorWarningFill className="medium" />,
        low: <RiCheckboxCircleFill className="low" />
    };

    const selectedPriorityOption = priorityIcons[priority];

    const hours = Array.from({ length: 12 }, (_, i) =>
        String(i + 1).padStart(2, '0')
    );
    const minutes = Array.from({ length: 60 }, (_, i) =>
        String(i).padStart(2, '0')
    );

    const formatTimeDisplay = () => {
        return `${selectedTime.hours}:${selectedTime.minutes} ${selectedTime.period}`;
    };

    const handleTimeChange = (type, value) => {
        setSelectedTime(prev => ({
            ...prev,
            [type]: value
        }));
    };

    useEffect(() => {
        loadTasks();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (timeRef.current && !timeRef.current.contains(event.target)) {
                setIsTimeOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (priorityRef.current && !priorityRef.current.contains(event.target)) {
                setIsPriorityOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadTasks = () => {
        const savedTasks = localStorage.getItem('dailyTasks');
        if (savedTasks) {
            const parsedTasks = JSON.parse(savedTasks);
            // Sort tasks by priority and completion status
            const sortedTasks = parsedTasks.sort((a, b) => {
                if (a.completed === b.completed) {
                    return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
                }
                return a.completed ? 1 : -1;
            });
            setTasks(sortedTasks);
        }
    };

    const saveTasks = (updatedTasks) => {
        const sortedTasks = updatedTasks.sort((a, b) => {
            if (a.completed === b.completed) {
                // First sort by priority
                const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
                if (priorityDiff !== 0) return priorityDiff;

                // Then sort by date
                return new Date(a.date) - new Date(b.date);
            }
            return a.completed ? 1 : -1;
        });
        localStorage.setItem('dailyTasks', JSON.stringify(sortedTasks));
        setTasks(sortedTasks);
    };

    const handleAddTask = (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        // Combine date and time
        const taskDate = new Date(selectedDate);
        const [hours, minutes] = [
            selectedTime.period === 'PM' && selectedTime.hours !== '12'
                ? String(Number(selectedTime.hours) + 12)
                : selectedTime.hours === '12' && selectedTime.period === 'AM'
                    ? '00'
                    : selectedTime.hours,
            selectedTime.minutes
        ];
        taskDate.setHours(Number(hours), Number(minutes), 0, 0);

        const task = {
            id: Date.now(),
            text: newTask,
            date: taskDate.toISOString(),
            completed: false,
            createdAt: new Date().toISOString(),
            priority: priority,
            notes: '',
            category: 'general'
        };

        const updatedTasks = [...tasks, task];
        saveTasks(updatedTasks);
        setNewTask('');
        setPriority('medium');
    };

    const toggleComplete = (taskId) => {
        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        saveTasks(updatedTasks);
    };

    const showModal = (title, message, onConfirm) => {
        setModal({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const deleteTask = (taskId) => {
        showModal(
            'Delete Task',
            'Are you sure you want to delete this task?',
            () => {
                const updatedTasks = tasks.filter(task => task.id !== taskId);
                setTasks(updatedTasks);
                saveTasks(updatedTasks);
            }
        );
    };

    const startEditing = (task) => {
        setEditingTask(task.id);
        setEditText(task.text);
        setPriority(task.priority);
    };

    const handleEdit = (taskId) => {
        if (!editText.trim()) return;

        const updatedTasks = tasks.map(task =>
            task.id === taskId ? { ...task, text: editText, priority } : task
        );
        saveTasks(updatedTasks);
        setEditingTask(null);
        setEditText('');
        setPriority('medium');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Format time
        const timeString = date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        // Check if date is today/tomorrow
        if (date.toDateString() === today.toDateString()) {
            return `Today, ${timeString}`;
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return `Tomorrow, ${timeString}`;
        }

        // Otherwise return full date
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getDateLabel = (date) => {
        if (!date || !(date instanceof Date)) {
            return null;
        }

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Reset time parts for accurate comparison
        today.setHours(0, 0, 0, 0);
        tomorrow.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);

        if (compareDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (compareDate.getTime() === tomorrow.getTime()) {
            return 'Tomorrow';
        }
        return null;
    };

    const isDateDisabled = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getMonthData = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = getDaysInMonth(year, month);
        return { year, month, firstDay, daysInMonth };
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(day);
        setSelectedDate(newDate);
        setIsCalendarOpen(false);
    };

    const changeMonth = (increment) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + increment);
        setSelectedDate(newDate);
    };

    const renderCalendar = () => {
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const startDate = new Date(monthStart);
        const endDate = new Date(monthEnd);

        startDate.setDate(startDate.getDate() - startDate.getDay());
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

        const weeks = [];
        let days = [];
        let day = new Date(startDate);

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                days.push(new Date(day));
                day.setDate(day.getDate() + 1);
            }
            weeks.push(days);
            days = [];
        }

        return (
            <div className="calendar">
                <div className="calendar-header">
                    <button onClick={() => setCurrentMonth(prev => {
                        const newDate = new Date(prev);
                        newDate.setMonth(prev.getMonth() - 1);
                        return newDate;
                    })}>
                        <RiArrowLeftSLine />
                    </button>
                    <span>{format(currentMonth, 'MMMM yyyy')}</span>
                    <button onClick={() => setCurrentMonth(prev => {
                        const newDate = new Date(prev);
                        newDate.setMonth(prev.getMonth() + 1);
                        return newDate;
                    })}>
                        <RiArrowRightSLine />
                    </button>
                </div>
                <div className="weekdays">
                    {weekDays.map(day => (
                        <div key={day} className="weekday">{day}</div>
                    ))}
                </div>
                <div className="days">
                    {weeks.map((week, i) => (
                        <div key={i} className="week">
                            {week.map(date => (
                                <button
                                    key={date.getTime()}
                                    className={`day ${date.getMonth() === currentMonth.getMonth() ? 'current' : 'other'
                                        } ${date.toDateString() === selectedDate.toDateString() ? 'selected' : ''}
                                    `}
                                    onClick={() => {
                                        setSelectedDate(date);
                                        setIsCalendarOpen(false);
                                    }}
                                >
                                    {date.getDate()}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const incrementTime = (type) => {
        setSelectedTime(prev => {
            let newValue;
            switch (type) {
                case 'hours':
                    newValue = String(Number(prev.hours) % 12 + 1).padStart(2, '0');
                    return { ...prev, hours: newValue };
                case 'minutes':
                    newValue = String((Number(prev.minutes) + 5) % 60).padStart(2, '0');
                    return { ...prev, minutes: newValue };
                case 'period':
                    return { ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' };
                default:
                    return prev;
            }
        });
    };

    const decrementTime = (type) => {
        setSelectedTime(prev => {
            let newValue;
            switch (type) {
                case 'hours':
                    newValue = String(Number(prev.hours) - 1 || 12).padStart(2, '0');
                    return { ...prev, hours: newValue };
                case 'minutes':
                    newValue = String((Number(prev.minutes) - 5 + 60) % 60).padStart(2, '0');
                    return { ...prev, minutes: newValue };
                case 'period':
                    return { ...prev, period: prev.period === 'AM' ? 'PM' : 'AM' };
                default:
                    return prev;
            }
        });
    };

    const filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        switch (filter) {
            case 'today':
                return taskDate.toDateString() === today.toDateString();
            case 'tomorrow':
                return taskDate.toDateString() === tomorrow.toDateString();
            case 'upcoming':
                return taskDate > tomorrow;
            case 'completed':
                return task.completed;
            default:
                return true;
        }
    });

    const sortTasks = (tasks) => {
        return [...tasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }

            switch (sortBy) {
                case 'priority':
                    const diff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
                    return sortDirection === 'asc' ? diff : -diff;
                case 'date':
                    return sortDirection === 'asc'
                        ? new Date(a.date) - new Date(b.date)
                        : new Date(b.date) - new Date(a.date);
                case 'name':
                    return sortDirection === 'asc'
                        ? a.text.localeCompare(b.text)
                        : b.text.localeCompare(a.text);
                default:
                    return 0;
            }
        });
    };

    const TaskForm = () => {
        const [newTask, setNewTask] = useState('');
        const [priority, setPriority] = useState('medium');
        const [selectedDate, setSelectedDate] = useState(new Date());
        const [selectedTime, setSelectedTime] = useState({
            hours: '09',
            minutes: '00',
            period: 'AM'
        });
        const [isPriorityOpen, setIsPriorityOpen] = useState(false);
        const [isCalendarOpen, setIsCalendarOpen] = useState(false);
        const [isTimeOpen, setIsTimeOpen] = useState(false);

        const priorityRef = useRef(null);
        const calendarRef = useRef(null);
        const timeRef = useRef(null);

        const handleAddTask = () => {
            if (!newTask.trim()) return;

            const taskDate = new Date(selectedDate);
            const hours = selectedTime.period === 'PM' && selectedTime.hours !== '12'
                ? parseInt(selectedTime.hours) + 12
                : selectedTime.hours === '12' && selectedTime.period === 'AM'
                    ? 0
                    : parseInt(selectedTime.hours);

            taskDate.setHours(hours, parseInt(selectedTime.minutes));

            const newTaskObj = {
                id: Date.now(),
                text: newTask,
                priority,
                date: taskDate,
                completed: false
            };

            setTasks(prev => [...prev, newTaskObj]);
            setNewTask('');
            setPriority('medium');
            setSelectedDate(new Date());
            setSelectedTime({ hours: '09', minutes: '00', period: 'AM' });
        };

        // Click outside handlers
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (priorityRef.current && !priorityRef.current.contains(event.target)) {
                    setIsPriorityOpen(false);
                }
                if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                    setIsCalendarOpen(false);
                }
                if (timeRef.current && !timeRef.current.contains(event.target)) {
                    setIsTimeOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        return (
            <div className="task-form">
                <div className="input-group">
                    <div className="input-wrapper">
                        <RiAddLine className="input-icon" />
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a new task..."
                            className="task-input"
                        />
                    </div>

                    <div className="priority-dropdown" ref={priorityRef}>
                        <button
                            className={`priority-toggle ${isPriorityOpen ? 'active' : ''}`}
                            onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                        >
                            {priorityIcons[priority]}
                            <span>{priority.charAt(0).toUpperCase() + priority.slice(1)} Priority</span>
                        </button>
                        {isPriorityOpen && (
                            <div className="priority-options">
                                {['high', 'medium', 'low'].map(p => (
                                    <button
                                        key={p}
                                        className={`priority-option ${priority === p ? 'active' : ''}`}
                                        onClick={() => {
                                            setPriority(p);
                                            setIsPriorityOpen(false);
                                        }}
                                    >
                                        {priorityIcons[p]}
                                        <span>{p.charAt(0).toUpperCase() + p.slice(1)} Priority</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="date-wrapper" ref={calendarRef}>
                        <button
                            className={`date-toggle ${isCalendarOpen ? 'active' : ''}`}
                            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                        >
                            <RiCalendarLine />
                            <span>{format(selectedDate, 'MMM dd, yyyy')}</span>
                        </button>
                        {isCalendarOpen && (
                            <div className="calendar-dropdown">
                                <Calendar
                                    selectedDate={selectedDate}
                                    setSelectedDate={setSelectedDate}
                                    setIsCalendarOpen={setIsCalendarOpen}
                                />
                            </div>
                        )}
                    </div>

                    <div className="time-wrapper" ref={timeRef}>
                        <button
                            className={`time-toggle ${isTimeOpen ? 'active' : ''}`}
                            onClick={() => setIsTimeOpen(!isTimeOpen)}
                        >
                            <RiTimeLine />
                            <span>
                                {`${selectedTime.hours}:${selectedTime.minutes} ${selectedTime.period}`}
                            </span>
                        </button>
                        {isTimeOpen && (

                            <TimePicker
                                selectedTime={selectedTime}
                                setSelectedTime={setSelectedTime}
                                setIsTimeOpen={setIsTimeOpen}
                            />
                        )}
                    </div>
                </div>

                <button
                    className="add-button"
                    onClick={handleAddTask}
                    disabled={!newTask.trim()}
                >
                    Add Task
                </button>
            </div>
        );
    };

    const [isFiltersVisible, setIsFiltersVisible] = useState(true);

    const toggleFilters = () => {
        setIsFiltersVisible(!isFiltersVisible);
    };

    return (
        <>
            <div className="task-manager">
                <div className="task-header">
                    <h2>Task Manager</h2>
                    <TaskStats tasks={tasks} />
                </div>

                <FilterBar
                    filter={filter}
                    setFilter={setFilter}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                    isVisible={isFiltersVisible}
                    onToggle={toggleFilters}
                />
                <TaskForm />
                <div className="tasks-list">
                    {filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className={`task-item ${task.completed ? 'completed' : ''}`}
                            style={{ '--priority-color': getPriorityColor(task.priority) }}
                        >
                            <div className="task-content">
                                <button
                                    className="complete-button"
                                    onClick={() => toggleComplete(task.id)}
                                    title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                                >
                                    <RiCheckLine />
                                </button>

                                {editingTask === task.id ? (
                                    <div className="edit-form">
                                        <input
                                            type="text"
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            onBlur={() => handleEdit(task.id)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleEdit(task.id)}
                                            autoFocus
                                        />
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="priority-select-small"
                                        >
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="task-info">
                                        <span className="task-text">{task.text}</span>
                                        <span className="priority-indicator" title={`${task.priority} priority`}>
                                            {priorityIcons[task.priority]}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="task-actions">
                                <span className="task-date" title="Due date">
                                    <RiTimeLine />
                                    {formatDate(task.date)}
                                </span>
                                <div className="action-buttons">
                                    <button
                                        className="edit-button"
                                        onClick={() => startEditing(task)}
                                        title="Edit task"
                                    >
                                        <RiEditLine />
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => deleteTask(task.id)}
                                        title="Delete task"
                                    >
                                        <RiDeleteBinLine />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
            />
        </>
    );
} 