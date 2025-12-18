import { useState } from 'react'
import './ChatList.css' 

const ChatList = () => {
  const [plusMode, setPlusMode] = useState(true)

  return (
    <div className='chatList'>
      <div className="search">
        <div className="searchBar">
          <input type="text" placeholder='Search' />
          <img src="./search.png" alt="" />
        </div>
        <img  
          src={ plusMode ? "./plus.png" : "./minus.png"}
          onClick={() => setPlusMode((prev) => !prev)}
          className='plus' 
          alt=""
        />
      </div>
      <div className="item">
        <img src="./avatar.png" alt="" />
        <div className="texts">
          <span>Jane Doe</span>
          <p>Hello!</p>
        </div>
      </div>
            <div className="item">
        <img src="./avatar.png" alt="" />
        <div className="texts">
          <span>Jane Doe</span>
          <p>Hello!</p>
        </div>
      </div>
            <div className="item">
        <img src="./avatar.png" alt="" />
        <div className="texts">
          <span>Jane Doe</span>
          <p>Hello!</p>
        </div>
      </div>
            <div className="item">
        <img src="./avatar.png" alt="" />
        <div className="texts">
          <span>Jane Doe</span>
          <p>Hello!</p>
        </div>
      </div>
            <div className="item">
        <img src="./avatar.png" alt="" />
        <div className="texts">
          <span>Jane Doe</span>
          <p>Hello!</p>
        </div>
      </div>
            <div className="item">
        <img src="./avatar.png" alt="" />
        <div className="texts">
          <span>Jane Doe</span>
          <p>Hello!</p>
        </div>
      </div>
    </div>
  )
}

export default ChatList