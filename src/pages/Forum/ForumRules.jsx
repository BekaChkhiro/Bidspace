import React from 'react';

const ForumRules = () => {
  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm p-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ფორუმის მოხმარების წესები</h1>
          <p className="text-gray-600 leading-relaxed">
            მოგესალმებით ჩვენი ონლაინ ბილეთების აუქციონის ფორუმზე! ეს სივრცე შეიქმნა,
            რათა მომხმარებლებს ჰქონდეთ შესაძლებლობა, ერთმანეთს გაუზიარონ თავიანთი
            გამოცდილება, მიიღონ რჩევები და უპასუხონ კითხვებს.
          </p>
        </div>

        {/* Rules Sections */}
        <div className="space-y-8">
          {/* Registration Section */}
          <div className="rule-section">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">1. რეგისტრაცია და ანგარიშის უსაფრთხოება</h2>
            </div>
            <ul className="ml-12 space-y-2 text-gray-600 list-disc">
              <li>ფორუმში მონაწილეობა შესაძლებელია მხოლოდ რეგისტრირებული მომხმარებლებისთვის</li>
              <li>მომხმარებლები ვალდებულნი არიან დაიცვან საკუთარი ანგარიშის უსაფრთხოება და არ გაუზიარონ პაროლი სხვებს</li>
            </ul>
          </div>

          {/* Forum Usage Section */}
          <div className="rule-section">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">2. ფორუმის გამოყენების მიზნები</h2>
            </div>
            <ul className="ml-12 space-y-2 text-gray-600 list-disc">
              <li>ივენთის ბილეთები: მომხმარებლებს შეუძლიათ დაწერონ თავიანთი სურვილების შესახებ და ისაუბრონ ბილეთების მოთხოვნაზე ან შეთავაზებაზე</li>
              <li>აუქციონერების შეფასება: მომხმარებლებს შეუძლიათ დაწერონ საკუთარი გამოცდილება აუქციონერებთან</li>
              <li>საიტის შეფასება და ხარვეზები: ფორუმი გამოიყენება საიტის ფუნქციონირების შეფასებისთვის და ხარვეზების დაფიქსირებისთვის</li>
            </ul>
          </div>

          {/* General Rules Section */}
          <div className="rule-section">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">3. ზოგადი წესები</h2>
            </div>
            <ul className="ml-12 space-y-2 text-gray-600 list-disc">
              <li>პატივისცემა და ზრდილობა: ყველა მომხმარებელმა უნდა დაიცვას ზრდილობის სტანდარტები</li>
              <li>თემიდან გადახვევა: მომხმარებლები ვალდებულნი არიან წერონ კონკრეტულ თემაზე</li>
              <li>კონფიდენციალურობა: აკრძალულია პირადი ინფორმაციის გაზიარება სხვა მომხმარებლების შესახებ</li>
              <li>კანონიერი ქმედებები: მომხმარებლები ვალდებულნი არიან დაიცვან მოქმედი კანონები</li>
            </ul>
          </div>

          {/* Reviews Section */}
          <div className="rule-section">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">4. საგნობრივი შეფასებები</h2>
            </div>
            <ul className="ml-12 space-y-2 text-gray-600 list-disc">
              <li>აუქციონერების და საიტის შეფასებები უნდა იყოს ობიექტური და ფაქტებზე დაფუძნებული</li>
              <li>უარყოფითი შეფასებები უნდა იყოს კონსტრუქციული და არ უნდა შეიცავდეს შეურაცხყოფას</li>
            </ul>
          </div>

          {/* Moderation Section */}
          <div className="rule-section">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">5. ფორუმის მონიტორინგი</h2>
            </div>
            <ul className="ml-12 space-y-2 text-gray-600 list-disc">
              <li>ფორუმის ადმინისტრაცია იტოვებს უფლებას წაშალოს ნებისმიერი შეტყობინება, რომელიც არღვევს წესებს</li>
              <li>განმეორებით წესების დარღვევა გამოიწვევს მომხმარებლის ანგარიშის დაბლოკვას</li>
            </ul>
          </div>

          {/* Complaints Section */}
          <div className="rule-section">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">6. საჩივრები და მოდერაცია</h2>
            </div>
            <ul className="ml-12 space-y-2 text-gray-600 list-disc">
              <li>თუ მომხმარებელი თვლის, რომ ფორუმის წესები დაირღვა, შეუძლია შეატყობინოს მოდერაციას</li>
              <li>მოდერაცია უზრუნველყოფს ობიექტური შეფასების საფუძველზე შესაბამის რეაგირებას</li>
            </ul>
          </div>

          {/* Updates Section */}
          <div className="rule-section">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-50 rounded-lg">
                <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">7. შეცვლები და განახლებები</h2>
            </div>
            <ul className="ml-12 space-y-2 text-gray-600 list-disc">
              <li>ფორუმის წესები შეიძლება პერიოდულად განახლდეს</li>
              <li>ნებისმიერი ცვლილება გამოქვეყნდება საიტზე და მომხმარებელი ვალდებულია დაემორჩილოს ახალ წესებს</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumRules;