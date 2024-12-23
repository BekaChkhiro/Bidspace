import React from 'react';
import { Link } from 'react-router-dom';

const PostList = () => {
  return (
    <div>
      <h1>This is Blog List</h1>
      <Link to='/dashboard'>Dashboard</Link>
      <h1 className='text-2xl text-red-400 mt-20'>Test Text</h1>
    </div>
  )
}

export default PostList;