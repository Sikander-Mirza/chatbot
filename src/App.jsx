import { useState } from 'react'
import Chatbot from "../src/screens/chatbot";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <Chatbot />
    </>
  )
}

export default App
