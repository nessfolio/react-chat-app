import React, { useState } from 'react'
import './signIn.css'
import { toast } from 'react-toastify';
import {
    signInWithEmailAndPassword,
  } from "firebase/auth";
import { auth } from '../../../lib/firebase';


const SignIn = () => {

    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData);
    
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
          console.log(err);
          toast.error(err.message);
        } finally {
          setLoading(false);
        }
    };
  return (
    <div className="item">
        <h2>Welcome back,</h2>
        <form onSubmit={handleLogin}>
        <input type="text" placeholder="Email" name="email" />
        <input type="password" placeholder="Password" name="password" />
        <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
        </form>
    </div>
  )
}

export default SignIn