import { useEffect, useRef, useState } from 'react';
import './Chat.css'
import EmojiPicker from 'emoji-picker-react';

const Chat = () => {
const [open, setOpen] = useState(false);
const [text, setText] = useState('');

const endRef = useRef(null)

useEffect(() => {
  endRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [])

function handleEmoji(e) {
  setText(prev => prev + e.emoji)
}


  return (
    <div className='chat'>

      <div className="top">
        <div className="user">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>Jane Doe</span>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      <div className="center">
        <div className="message">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos sequi repellendus, ipsa aspernatur fugiat nam omnis voluptatem eaque laborum soluta qui quaerat, iure dicta nulla consequuntur placeat minima odit temporibus.
            </p>
            <span>00:02</span>
          </div>
        </div>
        <div className="message own">
          <div className="texts">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos sequi repellendus, ipsa aspernatur fugiat nam omnis voluptatem eaque laborum soluta qui quaerat, iure dicta nulla consequuntur placeat minima odit temporibus.
            </p>
            <span>00:02</span>
          </div>
        </div>
        <div className="message">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos sequi repellendus, ipsa aspernatur fugiat nam omnis voluptatem eaque laborum soluta qui quaerat, iure dicta nulla consequuntur placeat minima odit temporibus.
            </p>
            <span>00:02</span>
          </div>
        </div>
        <div className="message own">
          <div className="texts">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos sequi repellendus, ipsa aspernatur fugiat nam omnis voluptatem eaque laborum soluta qui quaerat, iure dicta nulla consequuntur placeat minima odit temporibus.
            </p>
            <span>00:02</span>
          </div>
        </div>
        <div className="message">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos sequi repellendus, ipsa aspernatur fugiat nam omnis voluptatem eaque laborum soluta qui quaerat, iure dicta nulla consequuntur placeat minima odit temporibus.
            </p>
            <span>00:02</span>
          </div>
        </div>
        <div className="message own">
          <div className="texts">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos sequi repellendus, ipsa aspernatur fugiat nam omnis voluptatem eaque laborum soluta qui quaerat, iure dicta nulla consequuntur placeat minima odit temporibus.
            </p>
            <span>00:02</span>
          </div>
        </div>
        <div className="message">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos sequi repellendus, ipsa aspernatur fugiat nam omnis voluptatem eaque laborum soluta qui quaerat, iure dicta nulla consequuntur placeat minima odit temporibus.
            </p>
            <span>00:02</span>
          </div>
        </div>
        <div className="message own">
          <div className="texts">
          <img src="bg.jpg" alt="" />
            <p>
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quos sequi repellendus, ipsa aspernatur fugiat nam omnis voluptatem eaque laborum soluta qui quaerat, iure dicta nulla consequuntur placeat minima odit temporibus.
            </p>
            <span>00:02</span>
          </div>
        </div>
        <div ref={endRef}></div>
      </div>

      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input 
          type="text" placeholder='Message' 
          value={text}
          onChange={e=>setText(e.target.value)} 
        />
        <div className="emoji">
          <img 
            src="./emoji.png" alt="" 
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="emojiPicker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
          </div>
        </div>
        <button className="sendButton">Send</button>
      </div>

    </div>
  )
}

export default Chat