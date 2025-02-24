import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';
import { AlignLeft, Clapperboard, Tickets, Volleyball, Backpack, MessageCircleQuestion, CircleHelp } from 'lucide-react';

const NavigationMenu = () => {
    const { user } = useAuth();
    
    return (
        <nav className="bg-white shadow rounded-lg p-4 w-64">
            <ul className="space-y-2">
                <li>
                    <NavLink
                        to="/forum"
                        end
                        className={({ isActive }) =>
                            `w-full flex gap-2 items-center block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-[#00aff0] text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        <AlignLeft />
                        <span>წესები</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/forum/cinema"
                        className={({ isActive }) =>
                            `w-full flex gap-2 items-center block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-[#00aff0] text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        <Clapperboard />
                        <span>კინო-თეატრი</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/forum/events"
                        className={({ isActive }) =>
                            `w-full flex gap-2 items-center block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-[#00aff0] text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        <Tickets />
                        <span>ივენთები</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/forum/sports"
                        className={({ isActive }) =>
                            `w-full flex gap-2 items-center block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-[#00aff0] text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        <Volleyball />
                        <span>სპორტი</span>
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/forum/travel"
                        className={({ isActive }) =>
                            `w-full flex gap-2 items-center block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-[#00aff0] text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        <Backpack />
                        <span>მოგზაურობა</span>
                    </NavLink>
                </li>
                {user && (
                    <>
                        <li className="border-t my-2 pt-2">
                            <NavLink
                                to="/forum/my-questions"
                                className={({ isActive }) =>
                                    `w-full flex gap-2 items-center block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-[#00aff0] text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                                }
                            >
                                <MessageCircleQuestion />
                                <span>ჩემი კითხვები</span>
                            </NavLink>
                        </li>
                    </>
                )}
                <li className="border-t my-2 pt-2">
                    <NavLink
                        to="/forum/add-question"
                        className={({ isActive }) =>
                            `w-full flex gap-2 items-center block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-[#00aff0] text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        <CircleHelp />
                        <span>დასვი კითხვა</span>
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default NavigationMenu;