import React from 'react';
import ForumList from '../../components/forum/ForumList';

const ForumEvents = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">ივენთები</h2>
            <ForumList category="events" />
        </div>
    );
};

export default ForumEvents;