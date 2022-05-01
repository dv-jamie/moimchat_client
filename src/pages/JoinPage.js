import axios from "axios"
import { useRef } from "react"
import { useNavigate } from "react-router-dom"

function JoinPage() {
    const navi = useNavigate()
    const uidRef = useRef()
    const upwRef = useRef()
    const upwConfirmRef = useRef()
    const nameRef = useRef()
    
    const onJoinButtonClick = async () => {
        let uid = uidRef.current.value
        let upw = upwRef.current.value
        let upwConfirm = upwConfirmRef.current.value
        let name = nameRef.current.value

        if(uid.length === 0 || upw.length === 0 || upwConfirm.length === 0 || name.length === 0)
            return alert("모든 항목을 입력해주세요.")
        if(upw !== upwConfirm)
            return alert("비밀번호를 확인해 주세요.")

        const response = await axios.post(`${process.env.REACT_APP_API_URL}/user/join`, { uid, upw, name })

        if(response.data.join.result === "DUPLICATED_ID")
            return alert("존재하는 아이디입니다.")
        
        if(response.data.join.result === "SUCCESS") {
            alert("회원가입이 완료되었습니다.")
            navi("/")
        }
    }

    const onCancelButtonClick = () => {
        navi("/")
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
                    <div className="input-row">
                        <label>비밀번호 확인</label>
                        <input type="password" placeholder="비밀번호를 한 번 더 입력해주세요" ref={upwConfirmRef} />
                    </div>
                    <div className="input-row">
                        <label>별명</label>
                        <input type="text" placeholder="별명을 입력해주세요" ref={nameRef} />
                    </div>
                    <div className="button-wrap">
                        <button className="cancel-button" onClick={onCancelButtonClick}>취소하기</button>
                        <button className="join-button" onClick={onJoinButtonClick}>회원가입하기</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default JoinPage