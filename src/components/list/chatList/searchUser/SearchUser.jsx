import "./searchUser.css";
import { db } from "../../../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { useUserStore } from "../../../../lib/userStore";
import { toast } from "react-toastify";

const SearchUser = () => {
  // result will now hold either a user or a group object
  const [result, setResult] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { currentUser } = useUserStore();

  useEffect(() => {
    const search = async () => {
      if (!text.trim()) {
        setResult(null);
        return;
      }

      setLoading(true);
      try {
        // 1. Search for Users
        const userRef = collection(db, "users");
        const userQ = query(userRef, where("username", "==", text.trim()));
        const userSnap = await getDocs(userQ);

        if (!userSnap.empty) {
          const foundUser = { ...userSnap.docs[0].data(), id: userSnap.docs[0].id, type: "user" };
          if (foundUser.id !== currentUser.id) {
            setResult(foundUser);
            setLoading(false);
            return;
          }
        }

        // 2. Search for Groups (if no user found)
        const chatRef = collection(db, "chats");
        const groupQ = query(
          chatRef, 
          where("isGroup", "==", true), 
          where("groupName", "==", text.trim())
        );
        const groupSnap = await getDocs(groupQ);

        if (!groupSnap.empty) {
          const foundGroup = { ...groupSnap.docs[0].data(), id: groupSnap.docs[0].id, type: "group" };
          setResult(foundGroup);
        } else {
          setResult(null);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 500);
    return () => clearTimeout(timeoutId);
  }, [text, currentUser.id]);

  const handleAction = async () => {
    if (!result) return;

    try {
      if (result.type === "user") {
        // --- PRIVATE CHAT LOGIC ---
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats");
        const newChatRef = doc(chatRef);

        await setDoc(newChatRef, {
          createdAt: serverTimestamp(),
          messages: [],
          isGroup: false,
          members: [currentUser.id, result.id],
        });

        await updateDoc(doc(userChatsRef, result.id), {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: currentUser.id,
            updatedAt: Date.now(),
          }),
        });

        await updateDoc(doc(userChatsRef, currentUser.id), {
          chats: arrayUnion({
            chatId: newChatRef.id,
            lastMessage: "",
            receiverId: result.id,
            updatedAt: Date.now(),
          }),
        });

        
      } else {
        // --- JOIN GROUP LOGIC ---
        // Check if user is already a member
        if (result.members?.includes(currentUser.id)) {
          return toast.info("You are already in this group");
        }

        const batch = writeBatch(db);
        const chatRef = doc(db, "chats", result.id);
        const userChatsRef = doc(db, "userchats", currentUser.id);

        // Update members array in the chat document
        batch.update(chatRef, {
          members: arrayUnion(currentUser.id),
        });

        // Add group to the current user's chat list
        batch.update(userChatsRef, {
          chats: arrayUnion({
            chatId: result.id,
            lastMessage: "You joined the group",
            receiverId: "",
            groupName: result.groupName,
            isGroup: true,
            updatedAt: Date.now(),
          }),
        });

        await batch.commit();
      }

      setText("");
      setResult(null);
    } catch (err) {
      console.error("Action error:", err);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="searchUser">
      <div className="form">
        <input
          type="text"
          placeholder="Search users or groups..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="button" disabled={loading}>
          {loading ? "..." : "Find"}
        </button>
      </div>

      {result && (
        <div className="user">
          <div className="detail">
            <img 
              src={result.type === "user" ? (result.avatar || "./avatar.png") : "./group-avatar.png"} 
              alt="avatar" 
            />
            <span>{result.type === "user" ? result.username : result.groupName}</span>
            <small style={{color: "gray", marginLeft: "10px"}}>
              ({result.type})
            </small>
          </div>
          <button onClick={handleAction} className="add-btn">
            {result.type === "user" ? "Message" : "Join Group"}
          </button>
        </div>
      )}
      
      {!result && text.length > 0 && !loading && (
        <span className="no-results">Nothing found</span>
      )}
    </div>
  );
};

export default SearchUser;