import React from 'react';
import bidspaceLogo from '../assets/images/bidspace_logo.png';
import facebookIcon from '../assets/icons/footer/facebook_icon.svg';
import instagramIcon from '../assets/icons/footer/instagram_icon.svg';
import mastercardIcon from '../assets/icons/footer/mastercard_icon.svg';
import visaCardIcon from '../assets/icons/footer/visa_card_icon.svg';
import { Link } from 'react-router-dom';

const Footer = () => {

  return (
    <footer>
      <div className="w-full px-4 md:px-8 lg:px-16 py-6 bg-[#DCDCDC]">
        <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link to='/'>
              <img src={bidspaceLogo} alt='Bidspace Logo' className="max-w-[150px]" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-bold text-xl lg:text-2xl text-black">მენიუ</span>
            <nav className="flex flex-col gap-2">
              <Link to="/about" className="hover:font-bold hover:text-black">
                ჩვენ შესახებ
              </Link>
              <Link to="/forum" className="hover:font-bold hover:text-black">
                ფორუმი
              </Link>
              <Link to="/auction" className="hover:font-bold hover:text-black">
                აუქციონები
              </Link>
              <Link to="/questions" className="hover:font-bold hover:text-black">
                შეკითხვები
              </Link>
              <Link to="/instruction" className="hover:font-bold hover:text-black">
                ინსტრუქცია
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-bold text-xl lg:text-2xl text-black">კონტაქტი</span>
            <nav className="flex flex-col gap-2">
              <Link to="#" className="hover:font-bold hover:text-black">
                +995 555 555 555
              </Link>
              <Link to="#" className="hover:font-bold hover:text-black">
                info@bidspace.ge
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-bold text-xl lg:text-2xl text-black">გამოგვყევი</span>
            <nav className="flex flex-col gap-2">
              <Link to="#" className="flex gap-4 items-center hover:font-bold hover:text-black">
                <img src={facebookIcon} alt="Facebook Icon" width={24} height={24} />
                <span>Facebook</span>
              </Link>
              <Link to="#" className="flex gap-4 items-center hover:font-bold hover:text-black">
                <img src={instagramIcon} alt="Instagram Icon" width={24} height={24} />
                <span>Instagram</span>
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-4">
            <span className="font-bold text-xl lg:text-2xl text-black">წესები და პირობები</span>
            <nav className="flex flex-col gap-2">
              <Link to="#" className="hover:font-bold hover:text-black">
                წესები და პირობები
              </Link>
              <Link to="#" className="hover:font-bold hover:text-black">
                კონფიდენციალურობა
              </Link>
            </nav>
          </div>
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <span className="font-bold text-xl lg:text-2xl text-black">გადახდა</span>
            <nav className="flex gap-2">
              <img src={visaCardIcon} alt="Visa Card" width={40} height={40} />
              <img src={mastercardIcon} alt="Mastercard" width={40} height={40} />
            </nav>
          </div>
        </div>
      </div>
      <hr />
      <div className='w-full px-4 md:px-8 lg:px-16 py-3 flex flex-col md:flex-row justify-between items-center gap-2 bg-[#DCDCDC]'>
        <span className='font-normal text-base lg:text-lg text-center md:text-left'> 2024 Bidspace. All rights reserved</span>
        <span className='font-normal text-base lg:text-lg text-center md:text-left'>Powered By <Link to='https://infinityglobal.agency/'>Infinity Solutions</Link></span>
      </div>
    </footer>
  );
};

export default Footer;