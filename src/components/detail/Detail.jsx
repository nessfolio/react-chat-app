import { arrayRemove, arrayUnion, collection, doc, getDoc, onSnapshot, updateDoc, writeBatch } from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore";
import { useEffect, useState } from "react"; // ADD THIS
import "./detail.css";

const Detail = () => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock, resetChat, isGroup } =
    useChatStore();
  const { currentUser } = useUserStore();
  
  // State to store group details and member information
  const [groupData, setGroupData] = useState(null);
  const [memberUsers, setMemberUsers] = useState([]);

  // 1. Fetch group data (adminId and members list)
  useEffect(() => {
    if (!isGroup || !chatId) return;

    const unSub = onSnapshot(doc(db, "chats", chatId), async (res) => {
      const data = res.data();
      setGroupData(data);

      // Fetch user details for each member ID
      if (data?.members) {
        const userPromises = data.members.map(async (id) => {
          const userDoc = await getDoc(doc(db, "users", id));
          return { ...userDoc.data(), id: userDoc.id };
        });
        const users = await Promise.all(userPromises);
        setMemberUsers(users);
      }
    });

    return () => unSub();
  }, [chatId, isGroup]);

  // 2. Logic to remove a member (Admin only)
  const handleRemoveMember = async (targetUserId) => {
    if (!groupData || groupData.adminId !== currentUser.id) return;

    const batch = writeBatch(db);

    try {
      // Remove user ID from the chat's member array
      const chatRef = doc(db, "chats", chatId);
      batch.update(chatRef, {
        members: arrayRemove(targetUserId)
      });

      // Remove the chat from the target user's userchats
      const targetUserChatRef = doc(db, "userchats", targetUserId);
      const targetUserDoc = await getDoc(targetUserChatRef);

      if (targetUserDoc.exists()) {
        const userChats = targetUserDoc.data().chats;
        const updatedChats = userChats.filter(c => c.chatId !== chatId);
        batch.update(targetUserChatRef, { chats: updatedChats });
      }

      await batch.commit();
      console.log("Member removed successfully");
    } catch (err) {
      console.log("Error removing member:", err);
    }
  };

    const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="detail">
      <div className="user">
        <img src={isGroup ? "./group-avatar.png" : user?.avatar || "./avatar.png"} alt="" />
        <h2>{isGroup ? groupData?.groupName : user?.username}</h2>
        <p>{isGroup ? "Group Chat" : "Personal Chat"}</p>
      </div>
      
      <div className="info">
        {isGroup && (
          <div className="membersSection">
            <h3>Group Members ({memberUsers.length})</h3>
            <div className="membersList">
              {memberUsers.map((m) => (
                <div key={m.id} className="memberItem">
                  <div className="memberDetail">
                    <img src={m.avatar || "./avatar.png"} alt="" />
                    <span>{m.username} {m.id === groupData?.adminId && "(Admin)"}</span>
                  </div>
                  
                  {/* Show Remove button only if current user is admin and not removing themselves */}
                  {groupData?.adminId === currentUser.id && m.id !== currentUser.id && (
                    <button className="removeBtn" onClick={() => handleRemoveMember(m.id)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!isGroup && (
          <button onClick={handleBlock}>
            {isCurrentUserBlocked ? "You are Blocked!" : isReceiverBlocked ? "User blocked" : "Block User"}
          </button>
        )}
      </div>
    </div>
  );
};

export default Detail;