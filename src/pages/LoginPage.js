import axios from "axios"
import { useRef } from "react"
import { Link } from "react-router-dom"


function LoginPage(props) {
    const uidRef = useRef()
    const upwRef = useRef()
    
    const onLoginButtonClick = async () => {
        let uid = uidRef.current.value
        let upw = upwRef.current.value

        if(uid.length === 0 || upw. length === 0) {
            return alert("아이디와 비밀번호를 모두 입력해주세요")
        }

        const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/login`, {
            uid: uid,
            upw: upw
        })

        const result = response.data.login.result
        const jwtToken = response.data.login.token

        if(result === "FAILED") {
            alert("회원정보가 존재하지 않거나 일치하지 않습니다.")
            return
        }

        props.setIsLogin(true)
        localStorage.setItem("JWT_TOKEN", jwtToken)
    }

    return (
        <>
            <div className="form-wrap">
                <h1 className="home-logo">
                    <img src={require("../moimchat_logo.png")} />
                </h1>

                <div className="form">
                    <div className="input-row">
                        <label>아이디</label>
                        <input type="text" placeholder="아이디를 입력해주세요" ref={uidRef} />
                    </div>
                    <div className="input-row">
                        <label>비밀번호</label>
                        <input type="password" placeholder="비밀번호를 입력해주세요" ref={upwRef} />
                    </div>
                    <div className="button-wrap">
                        <button className="login-button" onClick={onLoginButtonClick}>로그인하기</button>
                    </div>
                </div>

                <p className="join-link">아직 회원이 아니신가요? <Link to="/join">회원가입하기</Link></p>
            </div>
        </>
    )
}

export default LoginPage