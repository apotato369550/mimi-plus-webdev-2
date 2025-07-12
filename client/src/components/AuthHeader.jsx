import { useState } from 'react';
import headerlogo from '../assets/headerlogo.svg';
import Button from './Button.jsx';

export default function AuthHeader({variant}) {
  const [isLogin, setIsLogin] = useState(true)
  
  return (
    <header className="flex justify-between items-center p-4 border-b-gray-100 px-[112px]">
      <div className="flex items-center gap-2">
        <img src={headerlogo} alt="logo" />
      </div>
        <div className="flex items-center gap-3">
          <Button
          variant='borderless'
            onClick={() => setIsLogin(true)}
            className={isLogin ? "text-gray-900 bg-gray-100" : "text-gray-600"}
          >
            Log in
          </Button>
          <Button
          variant='primary'
            onClick={() => setIsLogin(false)}
            className={`bg-orange-600 hover:bg-orange-700 text-white ${!isLogin ? "bg-orange-700" : ""}`}
          >
            Sign up
          </Button>
        </div>
    </header>
  )
}
