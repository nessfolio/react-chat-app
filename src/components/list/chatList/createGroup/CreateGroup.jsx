import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import './createGroup.css';
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";
import { db } from "../../../../lib/firebase";
import { toast } from "react-toastify";

const CreateGroup = () => {
    const [user, setUser] = useState(null);
    const { currentUser } = useUserStore();
    const [members, setMembers] = useState([currentUser.username, ]);
    const [groupName, setGroupName] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");

      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddMember = () => {
    if (members.includes(user.username)) {
      toast.info("User already added");
      return;
    }
    setMembers([...members, user.username])
  };

  const handleAdd = () => {
    if (!groupName) return toast.info("Please enter a group name!");

  };

  return (
    <div className="createGroup">
      <h2>Create a group</h2>
      <input type="text" placeholder='name' onChange={(e) => setGroupName(e.target.value)} />
      <h2>Choose members</h2>

      <div className="chooseMembers">
        <form onSubmit={handleSearch}>
          <input type="text" placeholder="Search user" name="username" />
          <button>Search</button>
        </form>
        {user && (
          <div className="user">
            <div className="detail">
              <img src={user.avatar || "./avatar.png"} alt="" />
              <span>{user.username}</span>
            </div>
            <button onClick={handleAddMember}>Add</button>
          </div>
        )}
      </div>

      <div className="membersList">
        <h3>Members:</h3>
        {members.map((member, index) => (
          <div key={index} className="memberItem">
            <span>{member}</span>
          </div>
        ))}
      </div>

      <button onClick={handleAdd} className="createGroupButton">Create Group</button>
    </div>
  );
};

export default CreateGroup;