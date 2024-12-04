import React, { useEffect } from 'react';

const QuestionsPage = () => {
  useEffect(() => {
    document.title = 'ხშირად დასმული კითხვები';
    
    return () => {
      document.title = 'ხშირად დასმული კითხვები';
    };
  }, []);

  return (
    <div className='w-full bg-[#E6E6E6] px-16 py-10 flex flex-col gap-10'>
      <h1 className='text-2xl font-bold text-center'>ხშირად დასმული კითხვები</h1>

      <div className='w-full bg-white rounded-2xl flex flex-col'>
        <div className='w-full px-6 py-6 border-b '>
           <div className='flex flex-col items-start gap-3'>
            <h3 className='text-xl font-bold'>ვინ ვართ ჩვენ?</h3>
            <p className='leading-7'>
            Bidspace არის პლატფორმა, სადაც გადამოწმებული გადამყიდველებისგან შეძლებთ ნებისმიერი ბილეთის შეძენას. ჩვენ უზრუნველვყოფთ ბილეთების ავთენტურობას და ვიღებთ პასუხისმგებლობას მათზე.
            </p>
           </div>
        </div>
      </div>

      <div className='w-full bg-white rounded-2xl flex flex-col'>
        <div className='w-full px-6 py-6 border-b '>
           <div className='flex flex-col items-start gap-3'>
            <h3 className='text-xl font-bold'>როგორ მუშაობს ვებ-საიტი?</h3>
            <p className='leading-7'>
            პირველ რიგში, რეგისტრირდებით საიტზე და უთითებთ ყველა საჭირო ინფორმაციას. ამის შემდეგ გექნებათ საკუთარი ექაუნთი. საიტზე ეძებთ სასურველი ბილეთის აუქციონს, რომელიც გადამოწმებულია Bidspace-ის მიერ. გაქვთ ორი არჩევანი:
            <ul className='ml-8'>
              <li className='list-disc'>მომენტალური შეძენა: აუქციონერის მიერ      მითითებული თანხის გადახდით.</li>
              <li className='list-disc'>აუქციონში მონაწილეობა: ბიდის (ფასის      შეთავაზების) განთავსებით.</li>
            </ul>
აუქციონის გამარჯვებული არის ის, ვინც ბოლო ბიდს განათავსებს. გამარჯვებული ვალდებულია 3 საათის განმავლობაში საიტზე არსებული ონლაინ გადახდის მეთოდის გამოყენებით. გადახდის შემდეგ, მიიღებთ ბილეთის სკანირებულ ვერსიას (ფიზიკური ბილეთის შემთხვევაში, ბილეთს მოგაწვდით თქვენთვის ხელსაყრელ მისამართზე).
            </p>
           </div>
        </div>
      </div>

      <div className='w-full bg-white rounded-2xl flex flex-col'>
        <div className='w-full px-6 py-6 border-b '>
           <div className='flex flex-col items-start gap-3'>
            <h3 className='text-xl font-bold'>რამდენი ბიდის დადების შესაძლებლობა მაქვს?</h3>
            <p className='leading-7'>
            ბიდების რაოდენობა შეზღუდული არ არის. თუმცა, ყოველი ბიდი უნდა იყოს წინაზე მაღალი. თუ გამარჯვებულმა 3 საათის განმავლობაში არ გადაიხადა თანხა, აუქციონში გამარჯვებულად გამოცხადდება მეორე ყველაზე მაღალი ბიდის ავტორი. მომხმარებელი, რომელიც არ გადაიხდის თანხას დროულად, დაიბლოკება და მომავალში აუქციონებში მონაწილეობის უფლება აღარ ექნება.
            </p>
           </div>
        </div>
      </div>

      <div className='w-full bg-white rounded-2xl flex flex-col'>
        <div className='w-full px-6 py-6 border-b '>
           <div className='flex flex-col items-start gap-3'>
            <h3 className='text-xl font-bold'>რამდენ ხანს გრძელდება აუქციონი?</h3>
            <p className='leading-7'>
            აუქციონის ხანგრძლივობას განსაზღვრავს აუქციონერი. თუ ბიდი დაიდო ბოლო 30 წამის განმავლობაში, დრო ავტომატურად გაგრძელდება 30 წამით, რათა ყველა მონაწილეს ჰქონდეს თანაბარი შანსი ბილეთის შესაძენად.
            </p>
           </div>
        </div>
      </div>

      <div className='w-full bg-white rounded-2xl flex flex-col'>
        <div className='w-full px-6 py-6 border-b '>
           <div className='flex flex-col items-start gap-3'>
            <h3 className='text-xl font-bold'>შეიძლება თუ არა აუქციონის შესახებ სიახლეების მიღება?</h3>
            <p className='leading-7'>
            დიახ, შეგიძლიათ დაამატოთ აუქციონი სასურველ სიაში (Wishlist). აქ თავმოყრილი იქნება თქვენთვის საინტერესო აუქციონები, ხოლო თქვენ მიიღებთ სიახლეებს, როგორიცაა ბიდების რაოდენობა, დროის დარჩენილი რაოდენობა და სხვა.
            </p>
           </div>
        </div>
      </div>

      <div className='w-full bg-white rounded-2xl flex flex-col'>
        <div className='w-full px-6 py-6 border-b '>
           <div className='flex flex-col items-start gap-3'>
            <h3 className='text-xl font-bold'>ყველა მომხმარებელს შეუძლია აუქციონის განთავსება და მასში მონაწილეობის მიღება?</h3>
            <p className='leading-7'>
            Bidspace-ზე ყველა რეგისტრირებული მომხმარებელი სტანდარტული ექაუნთით შეძლებს აუქციონში მონაწილეობის მიღებას. თუმცა, აუქციონის ჩასატარებლად საჭიროა ვერიფიკაციის გავლა, რაც მოიცავს დამატებითი ინფორმაციის შევსებას და ინფორმაციის ატვირთვას.
            </p>
           </div>
        </div>
      </div>

      <div className='w-full bg-white rounded-2xl flex flex-col'>
        <div className='w-full px-6 py-6 border-b '>
           <div className='flex flex-col items-start gap-3'>
            <h3 className='text-xl font-bold'>რა დოკუმენტებია საჭირო ვერიფიკაციისთვის?</h3>
            <p className='leading-7'>
            ვერიფიკაციისთვის საჭიროა:
            <ul className='ml-8'>
              <li className='list-disc'>ტელეფონის ნომრის დადასტურება SMS კოდით.</li>
              <li className='list-disc'>პირადობის მოწმობის ან პასპორტის ატვირთვა.</li>
              <li className='list-disc'>საკუთარი ფოტოს ატვირთვა, სადაც გიჭირავთ პირადობის დოკუმენტი.</li>
            </ul>
            </p>
           </div>
        </div>
      </div>

      <div className='w-full bg-white rounded-2xl flex flex-col'>
        <div className='w-full px-6 py-6 border-b '>
           <div className='flex flex-col items-start gap-3'>
            <h3 className='text-xl font-bold'>როგორ ხდება აუქციონის გადახდა?</h3>
            <p className='leading-7'>
            გადახდა უნდა განხორციელდეს 3 საათის განმავლობაში აუქციონის დამთავრების შემდეგ, პლატფორმაზე არსებული ონლაინ გადახდის მეთოდით. გადახდის შემდეგ მიიღებთ ბილეთის სკანირებულ ვერსიას, ხოლო ფიზიკური ბილეთის შემთხვევაში, იგი გადმოგეცემათ თქვენს მიერ მითითებულ მისამართზე.
            </p>
           </div>
        </div>
      </div>

      <div className='w-full bg-white rounded-2xl flex flex-col'>
        <div className='w-full px-6 py-6 border-b '>
           <div className='flex flex-col items-start gap-3'>
            <h3 className='text-xl font-bold'>რა ინფორმაცია გროვდება Bidspace-ის მიერ?</h3>
            <p className='leading-7'>
            Bidspace აგროვებს შემდეგ ინფორმაციას:
            <ul className='ml-8'>
              <li className='list-disc'>პირადი მონაცემები: სახელი, გვარი, ტელეფონის ნომერი, მისამართი, პირადი      ნომერი და ა.შ.</li>
              <li className='list-disc'>თქვენი IP მისამართი და ვიზიტის დრო.</li>
              <li className='list-disc'>ბრაუზერისა და მოწყობილობის ტიპი, ვიზიტის თარიღი და ხანგრძლივობა.</li>
              <li className='list-disc'>ეს მონაცემები გამოიყენება თქვენი ანგარიშის უსაფრთხოებისთვის და პლატფორმის გაუმჯობესებისთვის.</li>
            </ul>
            </p>
           </div>
        </div>
      </div>

      <div className='w-full bg-white rounded-2xl flex flex-col'>
        <div className='w-full px-6 py-6 border-b '>
           <div className='flex flex-col items-start gap-3'>
            <h3 className='text-xl font-bold'>როგორ ვაწარმოებ აუქციონს?</h3>
            <p className='leading-7'>
            ვერიფიკაციის წარმატებით გავლა მოგცემთ საშუალებას განათავსოთ საკუთარი აუქციონები. ინსტრუქციები აუქციონის შესაქმნელად დეტალურადაა მოცემული თქვენი ექაუნთის მართვის პანელში.
            </p>
           </div>
        </div>
      </div>


    </div>
  );
};

export default QuestionsPage;