import React from 'react';
import { CSSTransition } from 'react-transition-group';

const MessageBox = ({ showMessageBox, setShowMessageBox, message, setMessage }) => {
  return (
    <CSSTransition
      in={showMessageBox}
      timeout={300}
      classNames={{
        enter: 'transition-all duration-300 ease-out',
        enterFrom: 'opacity-0 transform -translate-y-2',
        enterTo: 'opacity-100 transform translate-y-0',
        leave: 'transition-all duration-200 ease-in',
        leaveFrom: 'opacity-100 transform translate-y-0',
        leaveTo: 'opacity-0 transform -translate-y-2'
      }}
      unmountOnExit
    >
      <div className="mt-3 sm:mt-4 animate-fadeIn">
        <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h6 className="text-sm font-medium text-gray-900">შეტყობინების გაგზავნა</h6>
            </div>
            <button
              onClick={() => setShowMessageBox(false)}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="დაწერეთ შეტყობინება..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 shadow-sm hover:border-gray-400 resize-none text-sm bg-white/80"
            />
          </div>
          
          <div className="mt-2 sm:mt-3 flex justify-end space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={() => setShowMessageBox(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              გაუქმება
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-lg transition-all duration-200"
              onClick={() => {
                setMessage('');
                setShowMessageBox(false);
              }}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              გაგზავნა
            </button>
          </div>
        </div>
      </div>
    </CSSTransition>
  );
};

export default MessageBox;