import "./userInfo.css"
import { useUserStore } from "../../../lib/userStore";
import { auth } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const Userinfo = () => {
  const { currentUser } = useUserStore();
  const { resetChat } = useChatStore();

  const handleSignOut = () => {
    auth.signOut();
    resetChat()
  }

  return (
    <div className='userInfo'>
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
      <button className="signout" onClick={handleSignOut}>Sign out</button>
    </div>
  )
}

export default Userinfo