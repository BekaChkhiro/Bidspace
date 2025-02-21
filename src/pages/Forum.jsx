import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavigationMenu from '../components/forum/NavigationMenu';
import ForumRules from './Forum/ForumRules';
import ForumCinema from './Forum/ForumCinema';
import ForumEvents from './Forum/ForumEvents';
import ForumSports from './Forum/ForumSports';
import ForumTravel from './Forum/ForumTravel';
import MyQuestions from './Forum/MyQuestions';
import MyResponses from './Forum/MyResponses';
import MyLikes from './Forum/MyLikes';
import AddQuestion from './Forum/AddQuestion';

const Forum = () => {
    return (
        <div className="flex gap-4 w-full px-4 md:px-8 lg:px-16 py-10">
            {/* Left Navigation */}
            <NavigationMenu />

            {/* Right Content Section */}
            <div className="flex-1">
                <Routes>
                    <Route path="/" element={<ForumRules />} />
                    <Route path="add-question" element={<AddQuestion />} />
                    <Route path="cinema" element={<ForumCinema />} />
                    <Route path="events" element={<ForumEvents />} />
                    <Route path="sports" element={<ForumSports />} />
                    <Route path="travel" element={<ForumTravel />} />
                    <Route path="my-questions" element={<MyQuestions />} />
                    <Route path="my-responses" element={<MyResponses />} />
                    <Route path="my-likes" element={<MyLikes />} />
                </Routes>
            </div>
        </div>
    );
};

export default Forum;