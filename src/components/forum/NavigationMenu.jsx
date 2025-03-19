import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';
import { AlignLeft, Clapperboard, Tickets, Volleyball, Backpack, MessageCircleQuestion, CircleHelp, Menu, X } from 'lucide-react';

const NavigationMenu = ({ isOpen, onOpenChange }) => {
    const { user } = useAuth();
    
    return (
        <>
            {/* Mobile Menu Button */}
            <button 
                onClick={() => onOpenChange(!isOpen)}
                className="lg:hidden fixed top-22 right-4 z-50 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50"
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => onOpenChange(false)}
                />
            )}

            {/* Navigation Menu */}
            <aside className={`
                lg:w-64 lg:flex-shrink-0
                fixed lg:relative top-0 right-0 h-[100dvh] lg:h-auto w-72 sm:w-80 lg:w-64
                bg-white shadow-lg lg:shadow rounded-lg 
                transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0
                transition-transform duration-200 ease-in-out
                z-50 lg:z-auto
                overflow-y-auto lg:overflow-visible
            `}>
                <nav className="p-4 lg:sticky lg:top-6">
                    <ul className="space-y-1.5">
                        <li className="lg:hidden mb-6 pb-4 border-b">
                            <button 
                                onClick={() => onOpenChange(false)}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <X size={20} className="mr-2" />
                                <span>დახურვა</span>
                            </button>
                        </li>

                        <li>
                            <NavLink
                                to="/forum"
                                end
                                onClick={() => onOpenChange(false)}
                                className={({ isActive }) =>
                                    `w-full flex gap-2 items-center px-3 py-2.5 rounded-md text-sm ${
                                        isActive
                                            ? 'bg-[#00aff0] text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <AlignLeft size={18} />
                                <span>წესები</span>
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/forum/cinema"
                                onClick={() => onOpenChange(false)}
                                className={({ isActive }) =>
                                    `w-full flex gap-2 items-center px-3 py-2.5 rounded-md text-sm ${
                                        isActive
                                            ? 'bg-[#00aff0] text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <Clapperboard size={18} />
                                <span>კინო-თეატრი</span>
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/forum/events"
                                onClick={() => onOpenChange(false)}
                                className={({ isActive }) =>
                                    `w-full flex gap-2 items-center px-3 py-2.5 rounded-md text-sm ${
                                        isActive
                                            ? 'bg-[#00aff0] text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <Tickets size={18} />
                                <span>ივენთები</span>
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/forum/sports"
                                onClick={() => onOpenChange(false)}
                                className={({ isActive }) =>
                                    `w-full flex gap-2 items-center px-3 py-2.5 rounded-md text-sm ${
                                        isActive
                                            ? 'bg-[#00aff0] text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <Volleyball size={18} />
                                <span>სპორტი</span>
                            </NavLink>
                        </li>

                        <li>
                            <NavLink
                                to="/forum/travel"
                                onClick={() => onOpenChange(false)}
                                className={({ isActive }) =>
                                    `w-full flex gap-2 items-center px-3 py-2.5 rounded-md text-sm ${
                                        isActive
                                            ? 'bg-[#00aff0] text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <Backpack size={18} />
                                <span>მოგზაურობა</span>
                            </NavLink>
                        </li>

                        {user && (
                            <li className="border-t my-2 pt-2">
                                <NavLink
                                    to="/forum/my-questions"
                                    onClick={() => onOpenChange(false)}
                                    className={({ isActive }) =>
                                        `w-full flex gap-2 items-center px-3 py-2.5 rounded-md text-sm ${
                                            isActive
                                                ? 'bg-[#00aff0] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <MessageCircleQuestion size={18} />
                                    <span>ჩემი კითხვები</span>
                                </NavLink>
                            </li>
                        )}

                        <li className="border-t my-2 pt-2">
                            <NavLink
                                to="/forum/add-question"
                                onClick={() => onOpenChange(false)}
                                className={({ isActive }) =>
                                    `w-full flex gap-2 items-center px-3 py-2.5 rounded-md text-sm ${
                                        isActive
                                            ? 'bg-[#00aff0] text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <CircleHelp size={18} />
                                <span>დასვი კითხვა</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>
        </>
    );
};

export default NavigationMenu;