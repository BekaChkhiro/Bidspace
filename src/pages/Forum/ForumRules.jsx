import React from 'react';

const ForumRules = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold mb-6">ფორუმის წესები</h1>
      <div className="space-y-4">
        <div className="rule-item">
          <h2 className="text-lg font-semibold mb-2">1. ზოგადი წესები</h2>
          <p className="text-gray-700">დაიცავით ურთიერთპატივისცემა და ეთიკის ნორმები კომუნიკაციისას.</p>
        </div>
        <div className="rule-item">
          <h2 className="text-lg font-semibold mb-2">2. შინაარსის წესები</h2>
          <p className="text-gray-700">გამოაქვეყნეთ მხოლოდ რელევანტური და სასარგებლო ინფორმაცია.</p>
        </div>
        <div className="rule-item">
          <h2 className="text-lg font-semibold mb-2">3. აკრძალული შინაარსი</h2>
          <p className="text-gray-700">არ დაიშვება შეურაცხმყოფელი, სპამ ან არალეგალური შინაარსის გამოქვეყნება.</p>
        </div>
      </div>
    </div>
  );
};

export default ForumRules;