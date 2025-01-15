import React from 'react';

const InstructionItems = () => {
  return (
    <div className='w-full flex flex-col gap-4 md:gap-6'>
      <h3 className='text-xl md:text-2xl font-bold uppercase text-center px-4'>აუქციონის ინსტრუქცია</h3>

      <div className='w-full flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row justify-between gap-4 md:gap-6 md:px-6'>
        <div className='w-full lg:w-1/3 p-4 md:p-6 pb-8 md:pb-12 flex flex-col items-center bg-white rounded-2xl'>
           <span className='w-10 h-10 md:w-12 md:h-12 flex justify-center items-center bg-[#00AEEF] rounded-full text-white text-sm md:text-base shadow-lg border border-white'>
            01
           </span>
           <span className='mt-3 md:mt-4 text-lg md:text-xl font-bold text-center'>რეგისტრაცია და ვერიფიკაცია</span>
        </div>

        <div className='w-full lg:w-1/3 p-4 md:p-6 pb-8 md:pb-12 flex flex-col items-center bg-white rounded-2xl'>
           <span className='w-10 h-10 md:w-12 md:h-12 flex justify-center items-center bg-[#00AEEF] rounded-full text-white text-sm md:text-base shadow-lg border border-white'>
            02
           </span>
           <span className='mt-3 md:mt-4 text-lg md:text-xl font-bold text-center'>აუქციონის შერჩევა და მონაწილეობის ვარიანტები</span>
        </div>

        <div className='w-full lg:w-1/3 p-4 md:p-6 pb-8 md:pb-12 flex flex-col items-center bg-white rounded-2xl md:col-span-2 lg:col-span-1'>
           <span className='w-10 h-10 md:w-12 md:h-12 flex justify-center items-center bg-[#00AEEF] rounded-full text-white text-sm md:text-base shadow-lg border border-white'>
            03
           </span>
           <span className='mt-3 md:mt-4 text-lg md:text-xl font-bold text-center'>გამარჯვება, გადახდა და ბილეთის მიღება</span>
        </div>
      </div>
    </div>
  );
}

export default InstructionItems;