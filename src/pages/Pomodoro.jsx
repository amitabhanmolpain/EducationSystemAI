import React, { useState, useEffect, useRef } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';

const PomodoroTimer = () => {
  const [time, setTime] = useState(1500); // 25 min in seconds
  const [initialTime, setInitialTime] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [skipBreaks, setSkipBreaks] = useState(false);
  const intervalRef = useRef(null);
  const [customMinutes, setCustomMinutes] = useState(25); // Default to 25 min
  const dailyGoal = 8 * 3600; // 8 hours in seconds
  const [isFocusSession, setIsFocusSession] = useState(false);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
        setFocusSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const formatFocusTime = (sec) => {
    const minutes = Math.floor(sec / 60);
    return `You have completed ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const startTimer = () => {
    if (time > 0) {
      setIsRunning(true);
      setIsFocusSession(true);
      speak('Focus Session Started');
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsFocusSession(false);
    setTime(initialTime);
    setFocusSeconds(0);
  };

  const setTimer = (minutes) => {
    const seconds = minutes * 60;
    setInitialTime(seconds);
    setTime(seconds);
    setIsRunning(false);
    setIsFocusSession(false);
    setFocusSeconds(0);
  };

  const incrementTime = () => {
    const newMinutes = customMinutes + 5;
    setCustomMinutes(newMinutes);
    setTimer(newMinutes);
  };

  const decrementTime = () => {
    const newMinutes = Math.max(5, customMinutes - 5);
    setCustomMinutes(newMinutes);
    setTimer(newMinutes);
  };

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([{ id: Date.now(), text: newTask, completed: false }, ...tasks]); // Prepend task
      setNewTask('');
      setShowTaskInput(false);
    }
  };

  const toggleTaskCompletion = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const progress = (focusSeconds / dailyGoal) * 100;
  const getProgressColor = (progress) => {
    const threshold = 80;
    if (progress >= 100) return '#4CAF50';
    if (progress >= threshold) {
      const ratio = (progress - threshold) / (100 - threshold);
      const r = parseInt(51 + (76 * ratio));
      const g = parseInt(51 + (202 * ratio));
      const b = parseInt(51 + (80 * ratio));
      return `rgb(${r}, ${g}, ${b})`;
    }
    return '#333';
  };

  const monthlyData = [
    { month: 'Dec', value: 20 },
    { month: 'Jan', value: 25 },
    { month: 'Feb', value: 30 },
    { month: 'Mar', value: 50 },
    { month: 'Apr', value: 70 },
    { month: 'May', value: 85 },
    { month: 'Jun', value: 90 },
    { month: 'Jul', value: 95 },
    { month: 'Aug', value: 100 },
    { month: 'Sep', value: 80 },
    { month: 'Oct', value: 60 },
    { month: 'Nov', value: 40 },
  ];

  const weeklyData = [
    { day: 'Mon', value: 30 },
    { day: 'Tue', value: 40 },
    { day: 'Wed', value: 50 },
    { day: 'Thu', value: 70 },
    { day: 'Fri', value: 90 },
    { day: 'Sat', value: 100 },
  ];

  // Clock hands calculation (adjusted for clockwise)
  const elapsedSeconds = initialTime - time;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60) % 60;
  const elapsedHours = Math.floor(elapsedSeconds / 3600);
  const secondDeg = (elapsedSeconds / initialTime) * 360; // Clockwise
  const minuteDeg = ((elapsedMinutes * 60 + elapsedSeconds % 60) / (initialTime / 60)) * 360;
  const hourDeg = ((elapsedHours * 3600 + elapsedMinutes * 60 + elapsedSeconds % 60) / (initialTime)) * 360;

  // Calculate number of breaks (1 break every 25 minutes)
  const totalMinutes = customMinutes;
  const breaks = Math.floor(totalMinutes / 25);

  return (
    <div className="w-full p-6 bg-black-gradient from-[#1A1A2E] to-[#16213E] text-white rounded-lg mt-10">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Focus Session Card */}
        <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
          <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D] green-gradient">
            <div className="relative flex flex-1 flex-col justify-between gap-3 items-center">
              {isFocusSession ? (
                <>
                  <h4 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                    Focus Session
                  </h4>
                  <div className="relative w-64 h-64 mx-auto">
                    {/* SVG Clock */}
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                      {/* Gradient Definitions */}
                      <defs>
                        <linearGradient id="clockBorderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      {/* Clock Face Border */}
                      <circle
                        cx="100"
                        cy="100"
                        r="95"
                        fill="none"
                        stroke="url(#clockBorderGradient)"
                        strokeWidth="10"
                      />
                      {/* Clock Face */}
                      <circle
                        cx="100"
                        cy="100"
                        r="90"
                        fill="#1A1A2E"
                      />
                      {/* Clock Numbers */}
                      {[...Array(12)].map((_, i) => {
                        const angle = ((i + 1) * 30 - 90) * (Math.PI / 180);
                        const x = 100 + 75 * Math.cos(angle);
                        const y = 100 + 75 * Math.sin(angle);
                        return (
                          <text
                            key={i}
                            x={x}
                            y={y}
                            fill="white"
                            fontSize="12"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {i + 1}
                          </text>
                        );
                      })}
                      {/* Hour Hand */}
                      <line
                        x1="100"
                        y1="100"
                        x2="100"
                        y2="60"
                        stroke="#EF4444"
                        strokeWidth="4"
                        transform={`rotate(${hourDeg} 100 100)`}
                      />
                      {/* Minute Hand */}
                      <line
                        x1="100"
                        y1="100"
                        x2="100"
                        y2="40"
                        stroke="#60A5FA"
                        strokeWidth="3"
                        transform={`rotate(${minuteDeg} 100 100)`}
                      />
                      {/* Second Hand */}
                      <line
                        x1="100"
                        y1="100"
                        x2="100"
                        y2="30"
                        stroke="white"
                        strokeWidth="2"
                        transform={`rotate(${secondDeg} 100 100)`}
                      />
                      {/* Center Dot */}
                      <circle
                        cx="100"
                        cy="100"
                        r="5"
                        fill="white"
                      />
                      {/* Digital Time Display */}
                      <text
                        x="100"
                        y="130"
                        fill="white"
                        fontSize="16"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {formatTime(time)}
                      </text>
                    </svg>
                  </div>
                  <p className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                    {isRunning ? 'Running' : 'Paused'}
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={isRunning ? pauseTimer : resumeTimer}
                      className="bg-blue-gradient hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full"
                      disabled={time <= 0}
                    >
                      {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={resetTimer}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-full"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h4 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                    Get ready to focus
                  </h4>
                  <p className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                    We'll turn off notifications and app alerts during each session. For longer sessions, we'll add a short break so you can recharge.
                  </p>
                  <div className="bg-black p-4 rounded-lg inline-block shadow-[0_0_10px_rgba(255,0,0,0.3)]">
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={decrementTime}
                        className="text-2xl text-gray-400 hover:text-white transition-colors"
                      >
                        ▼
                      </button>
                      <div
                        className="text-4xl font-mono text-red-500 bg-black px-4 py-2 rounded-lg"
                        style={{ fontFamily: '"Digital-7", monospace', letterSpacing: '2px' }}
                      >
                        {formatTime(time)}
                      </div>
                      <button
                        onClick={incrementTime}
                        className="text-2xl text-gray-400 hover:text-white transition-colors"
                      >
                        ▲
                      </button>
                    </div>
                    <div className="text-md mt-2 text-center text-gray-400">mins</div>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={skipBreaks}
                        onChange={(e) => setSkipBreaks(e.target.checked)}
                        className="form-checkbox text-blue-500"
                      />
                      <span className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                        Skip breaks
                      </span>
                    </label>
                    <p className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold mt-1">
                      {skipBreaks ? 'You have no breaks' : `You will have ${breaks} break${breaks !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                  <button
                    onClick={startTimer}
                    className="bg-blue-gradient hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-full text-sm"
                    disabled={time <= 0}
                  >
                    Start focus session
                  </button>
                  <div className="space-x-1 mt-2">
                    <button onClick={() => setTimer(25)} className={btn}>25 Min</button>
                    <button onClick={() => setTimer(60)} className={btn}>1 Hr</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Daily Progress Card */}
        <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3 col-span-2">
          <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D] green-gradient">
            <div className="relative flex flex-1 flex-col justify-between gap-3 items-center">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                Daily progress
              </h3>
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="70"
                    fill="none"
                    stroke="#333"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="70"
                    fill="none"
                    stroke={getProgressColor(progress)}
                    strokeWidth="10"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * progress) / 100}
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                  {Math.round(progress)}%
                </div>
              </div>
              <div className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                Daily goal: <strong>8 hrs</strong>
              </div>
              <div className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                Completed: <strong>{formatFocusTime(focusSeconds)}</strong>
              </div>
              <div className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                Streak: <strong>0 days</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
          <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D] green-gradient">
            <div className="relative flex flex-1 flex-col justify-between gap-3 items-center">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                Tasks
              </h3>
              {tasks.length === 0 ? (
                <>
                  <p className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                    Stay on track
                    <br />
                    Add tasks and assign them to focus sessions throughout your day.
                  </p>
                  <button
                    onClick={() => setShowTaskInput(true)}
                    className="red-gradient hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-full text-sm"
                  >
                    + Add a task
                  </button>
                </>
              ) : (
                <div className="w-full">
                  <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {tasks.map(task => (
                      <li key={task.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(task.id)}
                          className="form-checkbox text-blue-500"
                        />
                        <span className={`font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 ${task.completed ? 'line-through' : ''}`}>
                          {task.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setShowTaskInput(true)}
                    className="red-gradient hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-full text-sm mt-4"
                  >
                    + Add a task
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Task Input Modal */}
          {showTaskInput && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-gray-900 p-4 rounded-lg flex items-center space-x-3 w-3/4 max-w-md">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a task..."
                  className="flex-1 p-2 bg-gray-800 text-white rounded-lg border-none focus:outline-none"
                />
                <button
                  onClick={() => setShowTaskInput(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  onClick={addTask}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rectangular Grid for Graphs */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Student Monthly Cycle Graph */}
        <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
          <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D] green-gradient">
            <div className="relative flex flex-1 flex-col justify-between gap-3 items-center">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                Student Monthly Cycle Graph
              </h3>
              <div className="relative w-full h-56">
                <svg className="w-full h-full" viewBox="0 0 240 140">
                  {/* Grid Lines */}
                  <g stroke="#4B5563" strokeWidth="0.5" opacity="0.3">
                    {[...Array(5)].map((_, i) => (
                      <line key={i} x1="10" x2="230" y1={140 - i * 30} y2={140 - i * 30} />
                    ))}
                    {[...Array(12)].map((_, i) => (
                      <line key={i} y1="10" y2="140" x1={10 + i * 20} x2={10 + i * 20} />
                    ))}
                  </g>
                  {/* Axis Labels */}
                  <text x="10" y="150" fill="white" fontSize="10">Dec</text>
                  <text x="230" y="150" fill="white" fontSize="10" textAnchor="end">Nov</text>
                  <text x="0" y="10" fill="white" fontSize="10" textAnchor="end" transform="rotate(-90, 0, 10)">Value</text>
                  {/* Gradient Area */}
                  <defs>
                    <linearGradient id="areaGradientMonthly" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: 'rgba(238,3,3,1)', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: 'rgba(0,22,145,1)', stopOpacity: 0.4 }} />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${monthlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${10 + i * 20},${140 - (d.value / 100) * 120}`).join(' ')} L 230 135 L 10 135 Z`}
                    fill="url(#areaGradientMonthly)"
                    opacity="0.9"
                  />
                  {/* Line */}
                  <path
                    d={`${monthlyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${10 + i * 20},${140 - (d.value / 100) * 120}`).join(' ')}`}
                    fill="none"
                    stroke="url(#areaGradientMonthly)"
                    strokeWidth="2"
                  />
                  {/* Data Points */}
                  {monthlyData.map((d, i) => (
                    <circle
                      key={i}
                      cx={10 + i * 20}
                      cy={140 - (d.value / 100) * 120}
                      r={hoverIndex === i ? 6 : 4}
                      fill="url(#circleGradient)"
                      stroke="white"
                      strokeWidth="1"
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(null)}
                      style={{ transition: 'r 0.2s' }}
                    />
                  ))}
                </svg>
                {hoverIndex !== null && (
                  <div className="absolute -top-2 left-0 red-gradient bg-opacity-90 p-3 rounded-lg shadow-lg transform -translate-x-1/2" style={{ left: `${10 + hoverIndex * 20}px` }}>
                    <svg width="12" height="12" className="absolute -bottom-1 left-1/2 transform -translate-x-1/2" viewBox="0 0 10 10">
                      <path d="M0 0 L5 10 L10 0 Z" fill="#6B46C1" />
                    </svg>
                    <div className="flex items-center space-x-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-.5-11h1v5h-1zm0 6h1v1h-1z" />
                      </svg>
                      <span className="text-white text-sm">
                        {hoverIndex < 2 ? 'Worst Months: Dec, Jan, Feb' : hoverIndex >= 5 ? 'Best Months: Jun, Jul, Aug' : 'Moderate'}
                        <br />
                        It is {hoverIndex < 2 ? 'not' : ''} the right time to focus on this keyword.
                        <br />
                        Example: Ice Cream
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <p className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold mt-2">
                Seasonality
              </p>
              <p className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                Spot when any keywords' seasonality is trending and when losing
              </p>
            </div>
          </div>
        </div>

        {/* Student Everyday (Monday to Saturday) Graph */}
        <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
          <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D] green-gradient">
            <div className="relative flex flex-1 flex-col justify-between gap-3 items-center">
              <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
                Student Everyday Graph
              </h3>
              <div className="relative w-full h-56">
                <svg className="w-full h-full" viewBox="0 0 180 140">
                  {/* Grid Lines */}
                  <g stroke="#4B5563" strokeWidth="0.5" opacity="0.3">
                    {[...Array(5)].map((_, i) => (
                      <line key={i} x1="10" x2="170" y1={140 - i * 30} y2={140 - i * 30} />
                    ))}
                    {[...Array(6)].map((_, i) => (
                      <line key={i} y1="10" y2="140" x1={10 + i * 30} x2={10 + i * 30} />
                    ))}
                  </g>
                  {/* Axis Labels */}
                  <text x="10" y="150" fill="white" fontSize="10">Mon</text>
                  <text x="170" y="150" fill="white" fontSize="10" textAnchor="end">Sat</text>
                  <text x="0" y="10" fill="white" fontSize="10" textAnchor="end" transform="rotate(-90, 0, 10)">Value</text>
                  {/* Gradient Area */}
                  <defs>
                    <linearGradient id="areaGradientMonthly" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{ stopColor: 'rgba(238,3,3,1)', stopOpacity: 0.4 }} />
                      <stop offset="100%" style={{ stopColor: 'rgba(0,22,145,1)', stopOpacity: 0.4 }} />
                    </linearGradient>
                    <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(238,3,3,1)" />
                      <stop offset="100%" stopColor="rgba(0,22,145,1)" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${weeklyData.map((d, i) => {
                      const x = 10 + i * 30;
                      const y = 140 - (d.value / 100) * 120;
                      return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
                    }).join(' ')} L ${10 + (weeklyData.length - 1) * 30} 135 L 10 135 Z`}
                    fill="url(#areaGradientMonthly)"
                    opacity="0.9"
                  />
                  {/* Line */}
                  <path
                    d={`${weeklyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${10 + i * 30},${140 - (d.value / 100) * 120}`).join(' ')}`}
                    fill="none"
                    stroke="url(#areaGradientMonthly)"
                    strokeWidth="2"
                  />
                  {/* Data Points */}
                  {weeklyData.map((d, i) => (
                    <circle
                      key={i}
                      cx={10 + i * 30}
                      cy={140 - (d.value / 100) * 120}
                      r={hoverIndex === i ? 6 : 4}
                      fill="url(#circleGradient)"
                      stroke="white"
                      strokeWidth="1"
                      onMouseEnter={() => setHoverIndex(i)}
                      onMouseLeave={() => setHoverIndex(null)}
                      style={{ transition: 'r 0.2s' }}
                    />
                  ))}
                </svg>
                {hoverIndex !== null && (
                  <div className="absolute -top-2 left-0 red-gradient bg-opacity-90 p-3 rounded-lg shadow-lg transform -translate-x-1/2" style={{ left: `${10 + (hoverIndex % 6) * 30}px` }}>
                    <svg width="12" height="12" className="absolute -bottom-1 left-1/2 transform -translate-x-1/2" viewBox="0 0 10 10">
                      <path d="M0 0 L5 10 L10 0 Z" fill="#6B46C1" />
                    </svg>
                    <div className="flex items-center space-x-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                        <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm-.5-11h1v5h-1zm0 6h1v1h-1z" />
                      </svg>
                      <span className="text-white text-sm">
                        {hoverIndex < 2 ? 'Worst Days: Mon, Tue' : hoverIndex >= 4 ? 'Best Days: Fri, Sat' : 'Moderate'}
                        <br />
                        It is {hoverIndex < 2 ? 'not' : ''} the right time to focus on this day.
                        <br />
                        Example: Study
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <p className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold mt-2">
                Weekly Trends
              </p>
              <p className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
                Spot when daily focus is trending and when losing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const btn = "bg-gray-700 hover:bg-gray-600 text-white py-1 px-2 rounded text-sm";

export default PomodoroTimer;