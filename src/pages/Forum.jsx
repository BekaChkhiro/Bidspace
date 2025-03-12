import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavigationMenu from './../components/forum/NavigationMenu';

// Lazy load forum components
const AddQuestion = lazy(() => import('./Forum/AddQuestion'));
const ForumCinema = lazy(() => import('./Forum/ForumCinema'));
const ForumEvents = lazy(() => import('./Forum/ForumEvents'));
const ForumSports = lazy(() => import('./Forum/ForumSports'));
const ForumTravel = lazy(() => import('./Forum/ForumTravel'));
const ForumRules = lazy(() => import('./Forum/ForumRules'));
const MyQuestions = lazy(() => import('./Forum/MyQuestions'));
const SingleForumPost = lazy(() => import('./Forum/SingleForumPost'));

// Loading component
const ForumLoader = () => (
  <div className="flex items-center justify-center h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00adef]"></div>
  </div>
);

const Forum = () => {
    return (
        <div className="w-full px-4 md:px-8 lg:px-16 py-10">
            <div className="flex gap-8">
                <aside className="w-64 flex-shrink-0">
                    <NavigationMenu />
                </aside>

                <main className="flex-grow">
                    <Suspense fallback={<ForumLoader />}>
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
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

export default Forum;