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
import MyResponses from './Forum/MyResponses';
import MyLikes from './Forum/MyLikes';
import SingleForumPost from './Forum/SingleForumPost';

const Forum = () => {
    return (
        <div className="container mx-auto px-4 py-8">
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
                        <Route path="my-responses" element={<MyResponses />} />
                        <Route path="my-likes" element={<MyLikes />} />
                        <Route path="post/:postId" element={<SingleForumPost />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default Forum;