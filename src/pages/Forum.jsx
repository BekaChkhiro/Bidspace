import React, { useState } from 'react';
import NavigationMenu from '../components/forum/NavigationMenu';

const Forum = () => {
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [photo, setPhoto] = useState(null);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('category', category);
        formData.append('title', title);
        formData.append('question', question);
        if (photo) {
            formData.append('photo', photo);
        }

        const response = await fetch('/wp-json/custom/v1/add-forum-question', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        setMessage(result.message);
    };

    return (
        <div className="flex gap-4 w-full px-4 md:px-8 lg:px-16 py-10">
            {/* Left Navigation */}
            <NavigationMenu />

            {/* Right Form Section */}
            <main className="flex-1">
                <div className="bg-white rounded-lg shadow-sm">
                    <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                        <div className="relative">
                            <select 
                                className="w-full p-3 border rounded-lg bg-white appearance-none cursor-pointer"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="" disabled>აირჩიე კატეგორია</option>
                                <option value="კინო-თეატრი">კინო-თეატრი</option>
                                <option value="ივენთები">ივენთები</option>
                                <option value="სპორტი">სპორტი</option>
                                <option value="მოგზაურობა">მოგზაურობა</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <input
                            type="text"
                            placeholder="სათაური"
                            className="w-full p-3 border rounded-lg"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <textarea
                            placeholder="დაწერე შენი კითხვა..."
                            className="w-full p-3 border rounded-lg min-h-32 resize-none"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />

                        <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                    />
                                </svg>
                                ფოტოს დამატება
                                <input type="file" className="hidden" onChange={(e) => setPhoto(e.target.files[0])} />
                            </label>

                            <div className="space-x-2">
                                <button 
                                    type="button"
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    შენახვა
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                                >
                                    გამოქვეყნება
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Forum;