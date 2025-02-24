import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/core/context/AuthContext';

const AddQuestion = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Fetch categories when component mounts
    useEffect(() => {
        fetch('/wp-json/wp/v2/forum-categories')
            .then(response => response.json())
            .then(data => {
                setCategories(data);
                if (data.length > 0) {
                    setCategory(data[0].id.toString());
                }
            })
            .catch(err => setError('Failed to load categories'));
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Find the category slug from the selected category id
            const selectedCategory = categories.find(cat => cat.id.toString() === category);
            const categorySlug = selectedCategory ? [selectedCategory.slug] : [];

            // Create FormData for multipart/form-data request
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('status', 'publish');
            formData.append('forum_category[]', categorySlug[0]);
            if (image) {
                formData.append('featured_image', image);
            }
            
            const response = await fetch('/wp-json/wp/v2/forum', {
                method: 'POST',
                headers: {
                    'X-WP-Nonce': wpApiSettings.nonce
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create forum post');
            }

            const data = await response.json();
            navigate('/forum');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="p-4">
                <p>გთხოვთ გაიაროთ ავტორიზაცია კითხვის დასამატებლად</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">დაამატე კითხვა</h2>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-base font-semibold text-gray-900 mb-4">
                            კატეგორია
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {categories.map(cat => (
                                <div 
                                    key={cat.id}
                                    className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all ${
                                        category === cat.id.toString() 
                                            ? 'border-[#FF3D00] bg-orange-50' 
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => setCategory(cat.id.toString())}
                                >
                                    <input
                                        type="radio"
                                        id={`category-${cat.id}`}
                                        name="category"
                                        value={cat.id}
                                        checked={category === cat.id.toString()}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="sr-only"
                                    />
                                    <label 
                                        htmlFor={`category-${cat.id}`}
                                        className="flex items-center cursor-pointer"
                                    >
                                        <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                                            category === cat.id.toString() ? 'border-[#FF3D00]' : 'border-gray-400'
                                        }`}>
                                            {category === cat.id.toString() && (
                                                <div className="w-2 h-2 rounded-full bg-[#FF3D00]" />
                                            )}
                                        </div>
                                        <span className="text-base">{cat.name}</span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-2">
                            <label htmlFor="title" className="block text-base font-semibold text-gray-900">
                                სათაური
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-5 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 shadow-sm"
                                placeholder="შეიყვანეთ კითხვის სათაური"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="content" className="block text-base font-semibold text-gray-900">
                            კითხვის შინაარსი
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="6"
                            className="w-full px-5 py-4 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 shadow-sm"
                            placeholder="დაწერეთ თქვენი კითხვა..."
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-base font-semibold text-gray-900">
                            სურათი (არასავალდებულო)
                        </label>
                        <div className="mt-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="forum-image"
                            />
                            <label
                                htmlFor="forum-image"
                                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                აირჩიეთ სურათი
                            </label>
                            {imagePreview && (
                                <div className="mt-4 relative">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-w-xs rounded-lg shadow-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImage(null);
                                            setImagePreview(null);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-[#FF3D00] text-white py-4 px-10 rounded-xl hover:bg-[#FF5722] focus:outline-none focus:ring-2 focus:ring-[#FF3D00] focus:ring-offset-2 transition-colors text-base font-medium shadow-md ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'იტვირთება...' : 'კითხვის დამატება'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddQuestion;