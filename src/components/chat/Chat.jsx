import { useEffect, useRef, useState } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from "../../lib/upload";
import { format } from "timeago.js";

const Chat = () => {
  const [chat, setChat] = useState();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, isGroup } =
    useChatStore();

  const endRef = useRef(null);

  // Scroll to the bottom whenever messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  // Real-time listener for the current chat document
  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleKeyDown = (e) => {
  if (e.key === "Enter") {
    handleSend();
  }
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      // 1. Update the chat document with the new message
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      // 2. Determine who needs their "userchats" updated
      // If it's a group, we use the members list from the chat document
      // If it's private, we use the sender and receiver IDs
      const userIDs = isGroup ? chat.members : [currentUser.id, user.id];

      // 3. Update "userchats" for every relevant user
      const updatePromises = userIDs.map(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = text || "Sent an image";
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      });

      await Promise.all(updatePromises);

    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setImg({ file: null, url: "" });
      setText("");
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img 
            src={isGroup ? "./group-avatar.png" : user?.avatar || "./avatar.png"} 
            alt="avatar" 
          />
          <div className="texts">
            <span>
              {/* Show group name from database or username */}
              {isGroup ? chat?.groupName : user?.username}
            </span>
            <p>{isGroup ? "Group members are active" : "Personal chat"}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./more.png" alt="" />
        </div>
      </div>

      <div className="center">
        {chat?.messages?.map((message, index) => (
          <div
            className={
              message.senderId === currentUser?.id ? "message own" : "message"
            }
            key={index}
          >
            <div className="texts">
              {message.img && <img src={message.img} alt="" />}
              <p>{message.text}</p>
              {/* Use safe navigation for toDate() */}
              <span>{message.createdAt && format(message.createdAt.toDate())}</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
        </div>
        <input
          type="text"
          placeholder={
            (isCurrentUserBlocked || isReceiverBlocked) && !isGroup
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onKeyDown={handleKeyDown}
          onChange={(e) => setText(e.target.value)}
          disabled={(isCurrentUserBlocked || isReceiverBlocked) && !isGroup}
        />
        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </div>
        </div>
        <button
          className="sendButton"
          onClick={handleSend}
          disabled={(isCurrentUserBlocked || isReceiverBlocked) && !isGroup}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;