import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddQuestion = () => {
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [question, setQuestion] = useState('');
    const [photo, setPhoto] = useState(null);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('category', category);
        formData.append('title', title);
        formData.append('question', question);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            const response = await fetch('/wp-json/custom/v1/add-forum-question', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            setMessage(result.message);
            
            if (response.ok) {
                // თუ წარმატებით დაემატა, გადავამისამართოთ ჩემი კითხვების გვერდზე
                navigate('/forum/my-questions');
            }
        } catch (error) {
            setMessage('დაფიქსირდა შეცდომა, გთხოვთ სცადოთ თავიდან');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-6">კითხვის დამატება</h1>
            
            {message && (
                <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
                    {message}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        კატეგორია
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        required
                    >
                        <option value="">აირჩიეთ კატეგორია</option>
                        <option value="cinema">კინო-თეატრი</option>
                        <option value="events">ივენთები</option>
                        <option value="sports">სპორტი</option>
                        <option value="travel">მოგზაურობა</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        სათაური
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        კითხვა
                    </label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                        rows="4"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        სურათი (არასავალდებულო)
                    </label>
                    <input
                        type="file"
                        onChange={(e) => setPhoto(e.target.files[0])}
                        accept="image/*"
                        className="w-full p-2 border rounded-lg"
                    />
                </div>
                
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    დამატება
                </button>
            </form>
        </div>
    );
};

export default AddQuestion;