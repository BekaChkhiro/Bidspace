import React, { useEffect, useState } from 'react';

const InstructioPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabData = [
    {
      id: 0,
      title: 'რეგისტრაცია და ვერიფიკაცია',
      content: {
        title: 'რეგისტრაცია და ვერიფიკაცია',
        items: [
          'რეგისტრაცია: მომხმარებელი რეგისტრირდება საიტზე, სადაც უნდა მიუთითოს შემდეგი პირადი ინფორმაცია: სახელი, გვარი, პირადი ნომერი, მობილური ტელეფონი და ელფოსტა.',
          'ვერიფიკაცია: თუ მომხმარებელს სურს თავად განათავსოს აუქციონები, საჭიროა დამატებითი ვერიფიკაცია:',
          {
            subItems: [
              'ტელეფონის ნომრის დადასტურება: მომხმარებელი მიიღებს SMS კოდს, რომელიც შეჰყავს საიტზე.',
              'პირადობის დოკუმენტის ატვირთვა: მომხმარებელმა უნდა ატვირთოს საკუთარი პირადობის დამადასტურებელი დოკუმენტის ფოტო.',
              'საკუთარი სურათი პირადობით ხელში: მომხმარებელმა უნდა ატვირთოს ფოტო, სადაც პირადობის დამადასტურებელი დოკუმენტი უჭირავს ხელში.',
            ]
          }
        ]
      }
    },
    {
      id: 1,
      title: 'სასურველი აუქციონის ძებნა',
      content: {
        title: 'სასურველი აუქციონის ძებნა',
        items: [
          'რეგისტრაციის ან ავტორიზაციის შემდეგ, მომხმარებელი შეძლებს მოძებნოს, დაათვალიეროს და მონაწილეობა მიიღოს სასურველი აუქციონებში, რომლებიც გამოქვეყნებულია გადამოწმებული აუქციონერების მიერ.',
        ]
      }
    },
    {
      id: 2,
      title: 'შერჩევა და მონაწილეობის არჩევანი',
      content: {
        title: 'შერჩევა და მონაწილეობის არჩევანი',
        items: [
          'მომხმარებელს აქვს ორი არჩევანი:',
          {
            subItems: [
              'მომენტალური შეძენა: მომხმარებელი შეძლებს პირდაპირ შეიძინოს ბილეთი მითითებულ ფასად.',
              'აუქციონში მონაწილეობა: მომხმარებელი შეუძლია განათავსოს საკუთარი ბიდი და ჩაერთოს აუქციონში.',
            ]
          }
        ]
      }
    },
    {
      id: 3,
      title: 'აუქციონის გამარჯვებულის განსაზღვრა',
      content: {
        title: 'აუქციონის გამარჯვებულის განსაზღვრა',
        items: [
          'აუქციონის დასრულებისას გამარჯვებულად გამოცხადდება ის მომხმარებელი, რომელმაც ბოლო ბიდი განათავსა.',
        ]
      }
    },
    {
      id: 4,
      title: 'გადახდა და ბილეთის მიღება',
      content: {
        title: 'გადახდა და ბილეთის მიღება',
        items: [
          'გამარჯვებული ვალდებულია გადახდა განახორციელოს აუქციონის დასრულებიდან 3 საათის განმავლობაში საიტზე მითითებული ონლაინ გადახდის მეთოდით.',
          'გადახდის დასრულების შემდეგ, მომხმარებელი მიიღებს ბილეთის შტრიხ კოდს.',
          'ფიზიკური ბილეთის შემთხვევაში, ის გაგზავნილი იქნება მომხმარებლისთვის მოსახერხებელ ადგილას.'
        ]
      }
    },
  ];

  useEffect(() => {
    document.title = 'ინსტრუქცია';
  }, []);

  const renderListItem = (item, idx) => {
    if (typeof item === 'string') {
      return <li key={idx} className='text-gray-700'>{item}</li>;
    }

    if (item.title) {
      return (
        <li key={idx} className='space-y-2'>
          <h3 className='font-medium text-lg text-gray-900'>{item.title}</h3>
          {item.items && (
            <ul className='pl-6 space-y-2'>
              {item.items.map((subItem, subIdx) => renderListItem(subItem, subIdx))}
            </ul>
          )}
          {item.subItems && (
            <ul className='pl-6 space-y-2'>
              {item.subItems.map((subItem, subIdx) => (
                <li key={subIdx} className='text-gray-600 flex items-center'>
                  <span className='inline-block w-2 h-2 rounded-full border border-gray-400 mr-3 flex-shrink-0'></span>
                  <span>{subItem}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    if (item.subItems) {
      return (
        <ul className='pl-6 space-y-2 mt-2'>
          {item.subItems.map((subItem, subIdx) => (
            <li key={subIdx} className='text-gray-600 flex items-center'>
              <span className='inline-block w-2 h-2 rounded-full border border-gray-400 mr-3 flex-shrink-0'></span>
              <span>{subItem}</span>
            </li>
          ))}
        </ul>
      );
    }

    return null;
  };

  const renderContent = (content) => {
    if (content.title) {
      return (
        <div className='space-y-8'>
          <h2 className='text-2xl font-bold text-gray-900'>{content.title}</h2>
          <ul className='list-disc pl-6 space-y-4'>
            {content.items.map((item, idx) => renderListItem(item, idx))}
          </ul>
        </div>
      );
    }

    return (
      <div className='space-y-8'>
        <ul className='list-disc pl-6 space-y-4'>
          {content.items.map((item, idx) => renderListItem(item, idx))}
        </ul>
      </div>
    );
  };

  return (
    <div className='w-full px-4 md:px-8 lg:px-16 py-10'>
      <div className='w-full bg-white rounded-2xl flex flex-col md:flex-row'>
        {/* Left side - Tabs */}
        <div className='w-full md:w-1/4 border-r flex flex-col gap-2 p-4'>
          {tabData.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 transition-colors rounded-xl ${
                activeTab === tab.id
                  ? 'bg-[#00AEEF] text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className='text-lg font-medium'>{tab.title}</span>
            </button>
          ))}
        </div>

        {/* Right side - Content */}
        <div className='w-full md:w-3/4 p-6 md:p-4 overflow-y-auto'>
          {renderContent(tabData[activeTab].content)}
        </div>
      </div>
    </div>
  );
};

export default InstructioPage;