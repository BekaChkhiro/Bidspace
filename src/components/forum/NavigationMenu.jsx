import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';

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
                            `block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        წესები
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/forum/cinema"
                        className={({ isActive }) =>
                            `block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        კინო-თეატრი
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/forum/events"
                        className={({ isActive }) =>
                            `block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        ივენთები
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/forum/sports"
                        className={({ isActive }) =>
                            `block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        სპორტი
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/forum/travel"
                        className={({ isActive }) =>
                            `block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        მოგზაურობა
                    </NavLink>
                </li>
                {user && (
                    <>
                        <li className="border-t my-2 pt-2">
                            <NavLink
                                to="/forum/my-questions"
                                className={({ isActive }) =>
                                    `block px-4 py-2 rounded-md ${
                                        isActive
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                ჩემი კითხვები
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/forum/my-responses"
                                className={({ isActive }) =>
                                    `block px-4 py-2 rounded-md ${
                                        isActive
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                ჩემი პასუხები
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/forum/my-likes"
                                className={({ isActive }) =>
                                    `block px-4 py-2 rounded-md ${
                                        isActive
                                            ? 'bg-blue-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                მოწონებული
                            </NavLink>
                        </li>
                    </>
                )}
                <li className="border-t my-2 pt-2">
                    <NavLink
                        to="/forum/add-question"
                        className={({ isActive }) =>
                            `block px-4 py-2 rounded-md ${
                                isActive
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        დასვი კითხვა
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default NavigationMenu;