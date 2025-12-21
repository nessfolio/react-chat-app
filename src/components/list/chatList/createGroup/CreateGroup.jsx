import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import './createGroup.css';
import { useState } from "react";
import { useUserStore } from "../../../../lib/userStore";
import { db } from "../../../../lib/firebase";
import { toast } from "react-toastify";

const CreateGroup = () => {
  const { currentUser } = useUserStore();
  const [user, setUser] = useState(null);
  const [groupName, setGroupName] = useState("");
  // Initialize the members array with the current user object
  const [members, setMembers] = useState([
    { id: currentUser.id, username: currentUser.username }
  ]);

  // Search for a user
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        const docId = querySnapShot.docs[0].id;
        const docData = querySnapShot.docs[0].data();
        // Make sure to add the id to the user object
        setUser({ ...docData, id: docId });
      } else {
        toast.error("User not found!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Add user to the members list
  const handleAddMember = () => {
    if (members.some((m) => m.id === user.id)) {
      toast.info("User already added");
      return;
    }
    setMembers((prev) => [...prev, { id: user.id, username: user.username }]);
    setUser(null); // Clear search result after adding
  };

  // Finalize group creation
  const handleAdd = async () => {
    if (!groupName) return toast.warn("Please enter a group name!");
    if (members.length < 2) return toast.warn("Add at least one more member!");

    const batch = writeBatch(db);
    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      // 1. Create a reference for a new chat (with auto-ID)
      const newChatRef = doc(chatRef);

      // 2. Chat document data
      batch.set(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
        isGroup: true,
        groupName: groupName,
        adminId: currentUser.id,
        lastMessage: "",
      });

      // 3. Update chat lists for all members using a Batch
      members.forEach((member) => {
        const userChatDocRef = doc(userChatsRef, member.id);
        batch.update(userChatDocRef, {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "Group created",
            receiverId: "", // Empty for groups because there are multiple recipients
            groupName: groupName,
            isGroup: true,
            updatedAt: Date.now(),
          }),
        });
      });

      await batch.commit(); // Execute all operations at once

      toast.success("Group created successfully!");
      setMembers([{ id: currentUser.id, username: currentUser.username }]);
      setGroupName("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create group.");
    }
  };

  return (
    <div className="createGroup">
      <h2>Create a group</h2>
      <input 
        type="text" 
        placeholder='Group Name' 
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)} 
      />
      
      <h3>Add members</h3>
      <div className="chooseMembers">
        <form onSubmit={handleSearch}>
          <input type="text" placeholder="Search user by username" name="username" />
          <button type="submit">Search</button>
        </form>
        {user && (
          <div className="user">
            <div className="detail">
              <img src={user.avatar || "./avatar.png"} alt="" />
              <span>{user.username}</span>
            </div>
            <button onClick={handleAddMember}>Add to list</button>
          </div>
        )}
      </div>

      <div className="membersList">
        <h3>Selected ({members.length}):</h3>
        <div className="scrollList">
            {members.map((member) => (
            <div key={member.id} className="memberItem">
                <span>{member.username} {member.id === currentUser.id && "(You)"}</span>
            </div>
            ))}
        </div>
      </div>

      <button onClick={handleAdd} className="createGroupButton">
        Create Group
      </button>
    </div>
  );
};

export default CreateGroup;