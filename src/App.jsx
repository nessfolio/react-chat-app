import './App.css'
import List from './components/list/List.jsx'
import Chat from './components/chat/Chat.jsx'
import Detail from './components/detail/Detail.jsx'

function App() {

  return (
    <div className='container'>
      <List />
      <Chat />
      <Detail />
    </div>
  )
}

export default App
