import React from 'react';

const InstructionItems = () => {
  return (
    <div className='w-full flex flex-col gap-6'>
      <h3 className='text-2xl font-bold uppercase text-center'>აუქციონის ინსტრუქცია</h3>

      <div className='w-full flex justify-between gap-6'>
        <div className='w-1/3 p-6 pb-12 flex flex-col items-center bg-white rounded-2xl'>
           <span className='w-12 h-12 flex justify-center items-center bg-[#00AEEF] rounded-full text-white shadow-lg border border-white'>
            01
           </span>
           <span className='mt-4 text-xl font-bold text-center'>რეგისტრაცია და ვერიფიკაცია</span>
        </div>

        <div className='w-1/3 p-6 pb-12 flex flex-col items-center bg-white rounded-2xl'>
           <span className='w-12 h-12 flex justify-center items-center bg-[#00AEEF] rounded-full text-white shadow-lg border border-white'>
            02
           </span>
           <span className='mt-4 text-xl font-bold text-center'>აუქციონის შერჩევა და <br/>მონაწილეობის ვარიანტები</span>
        </div>

        <div className='w-1/3 p-6 pb-12 flex flex-col items-center bg-white rounded-2xl'>
           <span className='w-12 h-12 flex justify-center items-center bg-[#00AEEF] rounded-full text-white shadow-lg border border-white'>
            03
           </span>
           <span className='mt-4 text-xl font-bold text-center'>გამარჯვება, გადახდა და <br/> ბილეთის მიღება</span>
        </div>
      </div>
    </div>
  )
}

export default InstructionItems;