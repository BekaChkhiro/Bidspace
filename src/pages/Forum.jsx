import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavigationMenu from './../components/forum/NavigationMenu';
import AddQuestion from './Forum/AddQuestion';
import ForumCinema from './Forum/ForumCinema';
import ForumEvents from './Forum/ForumEvents';
import ForumSports from './Forum/ForumSports';
import ForumTravel from './Forum/ForumTravel';
import ForumRules from './Forum/ForumRules';
import MyQuestions from './Forum/MyQuestions';
import SingleForumPost from './Forum/SingleForumPost';

const Forum = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <div className="px-4 md:px-8 lg:px-16 py-6 lg:py-10">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 relative">
                    <NavigationMenu 
                        isOpen={isMobileMenuOpen} 
                        onOpenChange={setIsMobileMenuOpen} 
                    />

                    <main className="flex-grow">
                        <Routes>
                            <Route index element={<ForumRules />} />
                            <Route path="add-question" element={<AddQuestion />} />
                            <Route path="cinema" element={<ForumCinema />} />
                            <Route path="events" element={<ForumEvents />} />
                            <Route path="sports" element={<ForumSports />} />
                            <Route path="travel" element={<ForumTravel />} />
                            <Route path="my-questions" element={<MyQuestions />} />
                            <Route path="post/:postId" element={<SingleForumPost />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Forum;