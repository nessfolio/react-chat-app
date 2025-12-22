import React, { useState } from 'react'
import { toast } from "react-toastify";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import upload from "../../../lib/upload";
import { auth, db } from '../../../lib/firebase';

const SignUp = () => {

    const [avatar, setAvatar] = useState({
        file: null,
        url: "",
      });


    const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const [loading, setLoading] = useState(false);
    
const handleRegister = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    // 1. VALIDATE FORM INPUTS
    if (!username || !email || !password) {
      toast.info("Please enter all fields!");
      return; // The 'finally' block will still run after this return
    }

    if (!avatar.file) {
      toast.info("Please upload an avatar!");
      return;
    }

    // 2. CHECK IF USERNAME IS UNIQUE
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      toast.info("Username is already taken. Select another username");
      return;
    }

    // 3. CREATE USER IN FIREBASE AUTH
    const res = await createUserWithEmailAndPassword(auth, email, password);

    // 4. UPLOAD AVATAR TO STORAGE
    const imgUrl = await upload(avatar.file);

    // 5. CREATE USER DOCUMENT IN FIRESTORE
    await setDoc(doc(db, "users", res.user.uid), {
      username,
      email,
      avatar: imgUrl,
      id: res.user.uid,
      blocked: [],
    });

    // 6. INITIALIZE USER CHATS DOCUMENT
    await setDoc(doc(db, "userchats", res.user.uid), {
      chats: [],
    });

    toast.success("Account created! You can login now!");
  } catch (err) {
    console.error(err);
    toast.error(err.message);
  } finally {
    // This runs regardless of success, failure, or early returns
    setLoading(false);
  }
};
  return (
    <div className="item">
        <h2>Create an Account</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="" />
            Upload an image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
        </form>
    </div>
  )
}

export default SignUp