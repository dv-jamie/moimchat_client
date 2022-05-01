import { useEffect, useState } from "react"
import ChatPage from "./ChatPage"
import LoginPage from "./LoginPage"

function HomePage() {
    const [isLogin, setIsLogin] = useState(false)
    
    useEffect(() => {
        const jwtToken = localStorage.getItem("JWT_TOKEN")
        
        if(jwtToken) {
            setIsLogin(true)
        }
    }, [])

    return (
        <>
            {isLogin
                ? <ChatPage isLogin={isLogin} setIsLogin={setIsLogin} />
                : <LoginPage isLogin={isLogin} setIsLogin={setIsLogin} />
            }
        </>
    )
}

export default HomePage