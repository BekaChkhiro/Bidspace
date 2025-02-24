import React from 'react';
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
    return (
        <div className="w-full px-4 md:px-8 lg:px-16 py-10">
            <div className="flex gap-8">
                <aside className="w-64 flex-shrink-0">
                    <NavigationMenu />
                </aside>

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
    );
};

export default Forum;