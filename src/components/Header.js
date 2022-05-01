import axios from "axios"
import { useEffect, useState } from "react"
import "./Header.css"

function Header(props) {
    const [userInfo, setUserInfo] = useState([])

    useEffect(() => {
        const jwtToken = localStorage.getItem("JWT_TOKEN")
        
        if(jwtToken) {
            axios.defaults.headers.common['Authorization'] = jwtToken
        }

        getUserInfo()
    }, [])

    
    const getUserInfo = async () => {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/info`)
        const result = response.data.getUserInfo.result
        
        if(result === "FAILED") {
            alert("유저 정보가 올바르지 않습니다.")
            props.setIsLogin(false)
        }

        setUserInfo(response.data.getUserInfo.userInfo)
    }
    
    const onLogoutButtonClick = () => {
        axios.defaults.headers.common['Authorization'] = ""
        localStorage.clear()
        // *** close
        props.ws.close()
        props.setIsLogin(false)
    }

    return (
        <header className="header">
            <div className="inner">
                <h1 className="header-logo">
                    <img src={require("../moimchat_logo_white.png")} />
                </h1>

                <div className="user-menu">
                    <span>{userInfo.name}</span>
                    <span>님, 환영합니다.</span>
                    <button onClick={onLogoutButtonClick}>로그아웃</button>
                </div>
            </div>
        </header>
    )
}

export default Header