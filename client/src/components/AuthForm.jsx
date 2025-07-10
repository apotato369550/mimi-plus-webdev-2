import { AiOutlineShoppingCart } from "react-icons/ai";
import Button from './Button.jsx'
import Content from './Content.jsx'

export default function AuthForm({ variant = 'login'}) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 p-4 w-[360px]">
      <div className="flex flex-col items-center justify-center gap-4 w-full">
        <AiOutlineShoppingCart className="h-12 w-12"/>
        {variant === 'login' ? (
          <>
          <div className="flex flex-col text-center gap-3">
            <h3 className="font-semibold">Login to your account</h3>
            <p className="text-gray-600">Welcome back! Please enter your details</p>
          </div>
          <form className="flex flex-col gap-5 w-full">
            <div className="flex flex-col gap-1">
              <label className="text-sm">Email</label>
              <input type="Email" placeholder="Email" className="form-input" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Password</label>
              <input type="Password" placeholder="Password" className="form-input" />
            </div>
          </form>
          </>
        ) : (
          <>
          <div className="flex flex-col text-center gap-3">
            <h3 className="font-semibold">Create an account</h3>
            <p className="text-gray-600">Start your Mimi+ account!</p>
          </div>
          <form className="flex flex-col gap-5 w-full">
            <div className="flex flex-col gap-1">
              <label className="text-sm">Name*</label>
              <input type="Email" placeholder="Email" className="form-input" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Email*</label>
              <input type="Password" placeholder="Password" className="form-input" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Password*</label>
              <input type="Password" placeholder="Password" className="form-input" />
            </div>
            <div className="flex flex-col gap-[1px]">
              <div className="flex flex-col gap-1">
                <label className="text-sm">Confirm Password*</label>
                <input type="Password" placeholder="Password" className="form-input" />
              </div>
              <p className="text-gray-500">Must be atleast 8 characters</p>
            </div>
          </form>
          </>
        )}
      </div>
      <div className="flex justify-end w-full">
        <p className="text-primary-700 text-xs font-semibold">Forgot password</p>
      </div>
      <Button variant="card">Log in</Button>
      <p className="text-color-gray-500 text-xs font-normal">Don't have an account? <span className="text-primary-700 underline">Sign up</span></p>
    </div>
  );
}