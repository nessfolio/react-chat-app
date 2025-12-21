import "./login.css";
import SignUp from "./signUp/SignUp";
import SignIn from "./signIn/SignIn";
import { useState } from "react";

const Login = () => {
  const [chosen, setChosen] = useState('SignIn')

  return (
    <div className="login">
      <div className="chooser">
        <span onClick={() => setChosen('SignIn')}>Sign in</span>
        <span onClick={() => setChosen('SignUp')}>Sign up</span>
      </div>
      {
        chosen === 'SignIn' 
        ? <SignIn /> 
        : <SignUp />
      }
    </div>
  );
};

export default Login;
