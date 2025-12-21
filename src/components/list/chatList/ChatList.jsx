import { useEffect, useState } from "react";
import "./chatList.css";
import { useUserStore } from "../../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";
import SearchUser from "./searchUser/SearchUser";
import CreateGroup from "./createGroup/CreateGroup";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    // Listen to real-time updates in the user's chat list
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data()?.chats || [];

        const promises = items.map(async (item) => {
          // If it's a group, we don't need to fetch a specific receiver's data
          if (item.isGroup) {
            return item;
          }

          // If it's a private chat, fetch the receiver's user information
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        // Sort chats by the most recent update
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    // Prepare the chats array for Firestore by removing the expanded 'user' object
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    // Mark the selected chat as seen
    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });

      // Update the global chat store state
      // If it's a group, we pass null as the user object
      changeChat(chat.chatId, chat.isGroup ? null : chat.user);
    } catch (err) {
      console.log("Error updating seen status:", err);
    }
  };

  // Filter chats based on the search input (checks group names or usernames)
  const filteredChats = chats.filter((c) => {
    const nameToSearch = c.isGroup ? c.groupName : c.user?.username;
    return nameToSearch?.toLowerCase().includes(input.toLowerCase());
  });

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        
        {/* Your existing SearchUser component for finding single users */}
        <SearchUser />

        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {filteredChats.map((chat) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          {/* Render group icon if it's a group, otherwise user avatar */}
          <img
            src={
              chat.isGroup
                ? "./group-avatar.png"
                : chat.user?.blocked?.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user?.avatar || "./avatar.png"
            }
            alt=""
          />
          <div className="texts">
            {/* Render group name if it's a group, otherwise username */}
            <span>
              {chat.isGroup
                ? chat.groupName
                : chat.user?.blocked?.includes(currentUser.id)
                ? "User"
                : chat.user?.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <CreateGroup />}
    </div>
  );
};

export default ChatList;