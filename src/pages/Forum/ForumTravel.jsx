import React from 'react';
import ForumList from '../../components/forum/ForumList';

const ForumTravel = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">მოგზაურობა</h2>
            <ForumList category="travel" />
        </div>
    );
};

export default ForumTravel;