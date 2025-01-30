import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const InstructioPage = () => {
  useEffect(() => {
    document.title = 'ინსტრუქცია';
    
    return () => {
      document.title = 'ინსტრუქცია';
    };
  }, []);

  return (
    <div className='w-full bg-[#E6E6E6] px-16 py-10 flex flex-col gap-10'>
      <h1 className='text-2xl font-bold text-center'>აუქციონის ინსტრუქცია</h1>

      <div className='w-full bg-white rounded-2xl flex flex-col'>
        <div className='w-full px-4 py-6 border-b flex flex-col items-center'>
           <span className='w-12 h-12 flex justify-center items-center bg-[#00AEEF] rounded-full text-white shadow-lg border border-white'>
            01
           </span>
           <div className='mt-4 flex flex-col items-center gap-2'>
            <h3 className='text-xl font-bold'>რეგისტრაცია და ვერიფიკაცია</h3>
            <p>
               რეგისტრაცია: მომხმარებელი რეგისტრირდება საიტზე, სადაც უნდა მიუთითოს შემდეგი პირადი ინფორმაცია: სახელი, გვარი, პირადი ნომერი, მობილური ტელეფონი და ელფოსტა. 
               ვერიფიკაცია: თუ მომხმარებელს სურს თავად განათავსოს აუქციონები, საჭიროა დამატებითი ვერიფიკაცია: ტელეფონის ნომრის დადასტურება: მომხმარებელი მიიღებს SMS კოდს, რომელიც შეჰყავს საიტზე. პირადობის დოკუმენტის ატვირთვა: მომხმარებელმა უნდა ატვირთოს საკუთარი პირადობის დამადასტურებელი დოკუმენტის ფოტო. საკუთარი სურათი პირადობით ხელში: მომხმარებელმა უნდა ატვირთოს ფოტო, სადაც პირადობის დამადასტურებელი დოკუმენტი უჭირავს ხელში.
            </p>
           </div>
        </div>

        <div className='w-full px-4 py-6 border-b flex flex-col items-center'>
           <span className='w-12 h-12 flex justify-center items-center bg-[#00AEEF] rounded-full text-white shadow-lg border border-white'>
            01
           </span>
           <div className='mt-4 flex flex-col items-center gap-2'>
            <h3 className='text-xl font-bold'>რეგისტრაცია და ვერიფიკაცია</h3>
            <p>
               რეგისტრაცია: მომხმარებელი რეგისტრირდება საიტზე, სადაც უნდა მიუთითოს შემდეგი პირადი ინფორმაცია: სახელი, გვარი, პირადი ნომერი, მობილური ტელეფონი და ელფოსტა. 
               ვერიფიკაცია: თუ მომხმარებელს სურს თავად განათავსოს აუქციონები, საჭიროა დამატებითი ვერიფიკაცია: ტელეფონის ნომრის დადასტურება: მომხმარებელი მიიღებს SMS კოდს, რომელიც შეჰყავს საიტზე. პირადობის დოკუმენტის ატვირთვა: მომხმარებელმა უნდა ატვირთოს საკუთარი პირადობის დამადასტურებელი დოკუმენტის ფოტო. საკუთარი სურათი პირადობით ხელში: მომხმარებელმა უნდა ატვირთოს ფოტო, სადაც პირადობის დამადასტურებელი დოკუმენტი უჭირავს ხელში.
            </p>
           </div>
        </div>

        <div className='w-full px-4 py-6 border-b flex flex-col items-center'>
           <span className='w-12 h-12 flex justify-center items-center bg-[#00AEEF] rounded-full text-white shadow-lg border border-white'>
            01
           </span>
           <div className='mt-4 flex flex-col items-center gap-2'>
            <h3 className='text-xl font-bold'>რეგისტრაცია და ვერიფიკაცია</h3>
            <p>
               რეგისტრაცია: მომხმარებელი რეგისტრირდება საიტზე, სადაც უნდა მიუთითოს შემდეგი პირადი ინფორმაცია: სახელი, გვარი, პირადი ნომერი, მობილური ტელეფონი და ელფოსტა. 
               ვერიფიკაცია: თუ მომხმარებელს სურს თავად განათავსოს აუქციონები, საჭიროა დამატებითი ვერიფიკაცია: ტელეფონის ნომრის დადასტურება: მომხმარებელი მიიღებს SMS კოდს, რომელიც შეჰყავს საიტზე. პირადობის დოკუმენტის ატვირთვა: მომხმარებელმა უნდა ატვირთოს საკუთარი პირადობის დამადასტურებელი დოკუმენტის ფოტო. საკუთარი სურათი პირადობით ხელში: მომხმარებელმა უნდა ატვირთოს ფოტო, სადაც პირადობის დამადასტურებელი დოკუმენტი უჭირავს ხელში.
            </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InstructioPage;