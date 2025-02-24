import React from 'react';
import ForumList from '../../components/forum/ForumList';

const ForumSports = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">სპორტი</h2>
            <ForumList category="sports" />
        </div>
    );
};

export default ForumSports;