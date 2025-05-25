import React, { useState } from 'react';
import { Clock, Edit3, X } from 'lucide-react';
import { usePieceContext } from './PieceContext';
import NavBar from './NavBar';

const CustomTimeForm = ({ onClose, onSubmit, setTime }: { onClose: () => void, onSubmit: (totalSeconds: number) => void, setTime: (value: number) => void }) => {
    const [days, setDays] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [seconds, setSeconds] = useState('');
    const { t, darkMode } = usePieceContext();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert all inputs to seconds
        const totalSeconds =
            (parseInt(days) || 0) * 86400 +
            (parseInt(hours) || 0) * 3600 +
            (parseInt(minutes) || 0) * 60 +
            (parseInt(seconds) || 0);

        if (totalSeconds > 0) {
            // console.log(totalSeconds);
            setTime(totalSeconds);
            onSubmit(totalSeconds);
            onClose();
        }
    };

    const validateNumber = (value: string, max: number) => {
        let num = value.replace(/\D/g, '');
        num = num === '' ? '' : Math.min(parseInt(num), max).toString();
        return num;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`${darkMode? 'bg-slate-800':'bg-white'} rounded-2xl p-6 w-full max-w-md`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-xl font-semibold ${darkMode? 'text-white':'text-green-800'} flex items-center gap-2`}>
                        <Clock className={`w-5 h-5 ${darkMode? 'text-white':'text-green-600'}`} />
                        {t.customTimeTitle}
                    </h2>
                    <button
                        onClick={onClose}
                        className={`${darkMode? 'text-white hover:text-gray-200':'text-gray-400 hover:text-gray-600'} transition-colors`}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className={`block text-sm ${darkMode? 'text-white':'text-gray-600 mb-1'}`}>{t.days}</label>
                            <input
                                type="text"
                                value={days}
                                onChange={(e) => setDays(validateNumber(e.target.value, 99))}
                                className={`w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${darkMode? 'focus:ring-white bg-slate-800 text-white':'focus:ring-green-500'}`}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className={`block text-sm ${darkMode? 'text-white':'text-gray-600 mb-1'}`}>{t.hours}</label>
                            <input
                                type="text"
                                value={hours}
                                onChange={(e) => setHours(validateNumber(e.target.value, 23))}
                                className={`w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${darkMode? 'focus:ring-white bg-slate-800 text-white':'focus:ring-green-500'}`}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className={`block text-sm ${darkMode? 'text-white':'text-gray-600 mb-1'}`}>{t.minutes}</label>
                            <input
                                type="text"
                                value={minutes}
                                onChange={(e) => setMinutes(validateNumber(e.target.value, 59))}
                                className={`w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${darkMode? 'focus:ring-white bg-slate-800 text-white':'focus:ring-green-500'}`}
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className={`block text-sm ${darkMode? 'text-white':'text-gray-600 mb-1'}`}>{t.seconds}</label>
                            <input
                                type="text"
                                value={seconds}
                                onChange={(e) => setSeconds(validateNumber(e.target.value, 59))}
                                className={`w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 ${darkMode? 'focus:ring-white bg-slate-800 text-white':'focus:ring-green-500'}`}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 p-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                        >
                            {t.cancel}
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 p-3 rounded-xl ${darkMode? 'bg-slate-500 text-white font-medium hover:bg-slate-600':'bg-green-500 text-white font-medium hover:bg-green-600'} transition-colors`}
                        >
                            {t.submit}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function ChooseTime() {
    const [activeTime, setActiveTime] = useState('');
    const [showCustomForm, setShowCustomForm] = useState(false);
    const { t, darkMode, setTime, mode} = usePieceContext();

    const categories = [
        { id: 'quick', label: `${t.quick}` },
        { id: 'standard', label: `${t.standard}` },
        { id: 'daily', label: `${t.daily}` },
    ];

    const timeOptions = [
        { value: '30s', label: '30 sec', category: 'quick' },
        { value: '1m', label: '1 min', category: 'quick' },
        { value: '2m', label: '2 min', category: 'quick' },
        { value: '3m', label: '3 min', category: 'quick' },
        { value: '5m', label: '5 min', category: 'standard' },
        { value: '10m', label: '10 min', category: 'standard' },
        { value: '15m', label: '15 min', category: 'standard' },
        { value: '20m', label: '20 min', category: 'standard' },
        { value: '30m', label: '30 min', category: 'standard' },
        { value: '60m', label: '60 min', category: 'standard' },
        { value: '1d', label: `1 ${t.days}`, category: 'daily' },
        { value: '2d', label: `2 ${t.days}`, category: 'daily' },
        { value: '3d', label: `3 ${t.days}`, category: 'daily' },
        { value: '5d', label: `5 ${t.days}`, category: 'daily' },
        { value: '14d', label: `14 ${t.days}`, category: 'daily' },
    ];

    const convertToSeconds = (value: string) => {
        if (value.endsWith('s')) return parseInt(value) || 0;
        if (value.endsWith('m')) return (parseInt(value) || 0) * 60;
        if (value.endsWith('h')) return (parseInt(value) || 0) * 3600;
        if (value.endsWith('d')) return (parseInt(value) || 0) * 86400;
        return 0;
    }

    const handleCustomTime = (totalSeconds: number) => {
        let value;
        if (totalSeconds >= 86400) {
            value = `${Math.floor(totalSeconds / 86400)}d`;
        } else if (totalSeconds >= 3600) {
            value = `${Math.floor(totalSeconds / 3600)}h`;
        } else if (totalSeconds >= 60) {
            value = `${Math.floor(totalSeconds / 60)}m`;
        } else {
            value = `${totalSeconds}s`;
        }
        setActiveTime(value);
        setTime(totalSeconds);
    };

    return (
        <>
            <NavBar current={-1} />
            <div className={`min-h-screen bg-gradient-to-br ${darkMode? 'from-slate-900 to-slate-500':'from-green-100 to-amber-50'} p-6 md:p-8`}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className={`text-4xl font-bold ${darkMode? 'text-white':'text-green-800'} mb-4`}>
                            {t.chooseTimeTitle}
                        </h1>
                        <p className={`text-lg font-medium ${darkMode? 'text-white':'text-green-800'} max-w-2xl mx-auto`}>
                            {t.chooseTimeDescription}
                        </p>
                    </div>

                    <div className={`${darkMode? 'bg-white/30':'bg-white/70'} backdrop-blur-lg rounded-2xl p-8 shadow-xl`}>
                        {categories.map((category) => (
                            <div key={category.id} className="mb-8 last:mb-0">
                                <h2 className={`text-xl font-semibold ${darkMode? 'text-white':'text-green-800'} mb-4 flex items-center`}>
                                    <Clock className={`w-5 h-5 mr-2 ${darkMode? 'text-white':'text-green-600'}`} />
                                    {category.label}
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                    {timeOptions
                                        .filter((option) => option.category === category.id)
                                        .map((option) => (
                                            <a href={`/chessboard?mode=${mode}&time=${convertToSeconds(option.value)}`} key={option.value}>
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        const seconds = convertToSeconds(option.value);
                                                        setTime(seconds);
                                                        setActiveTime(option.value);
                                                    }}
                                                    className={`p-4 rounded-xl font-medium transition-all duration-200 ${activeTime === option.value
                                                        ? `${darkMode ? 'bg-slate-500 text-white' : 'bg-green-500 text-white'} shadow-lg scale-105`
                                                        : `${darkMode ? 'bg-slate-700 text-white hover:bg-slate-500' : 'bg-white/80 text-green-800 hover:bg-green-100'} hover:scale-105 hover:shadow-md`
                                                        }`}
                                                >
                                                    {option.label}
                                                </button>
                                            </a>
                                        ))}
                                </div>
                            </div>
                        ))}

                        <div className={`mt-8 pt-8 border-t ${darkMode ? 'border-slate-600' : 'border-green-100'}`}>
                            <button
                                onClick={() => setShowCustomForm(true)}
                                className={`w-full p-4 rounded-xl ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-amber-100 hover:bg-amber-200 text-amber-800'} font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md`}
                            >
                                <Edit3 className="w-5 h-5" />
                                {t.customTimeButton}
                            </button>
                        </div>
                    </div>
                </div>

                {showCustomForm && (
                    <CustomTimeForm
                        onClose={() => setShowCustomForm(false)}
                        onSubmit={handleCustomTime}
                        setTime={setTime}
                    />
                )}
            </div>
        </>
    );
}
