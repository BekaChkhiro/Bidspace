import React from 'react';
import ForumList from '../../components/forum/ForumList';

const ForumCinema = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">კინო-თეატრი</h2>
            <ForumList category="cinema-theatre" />
        </div>
    );
};

export default ForumCinema;