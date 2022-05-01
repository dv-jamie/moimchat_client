import axios from "axios"
import { useRef, useState } from "react"
import "./Dialog.css"

function Dialog(props) {
    const conversationNameRef = useRef()
    const conversationCodeRef = useRef()
    const [inputValue, setInputValue] = useState("")

    const dialogContent = props.chatButtonType === "enter"
        ? {
            "label": "참여코드",
            "placeholder": "참여코드를 입력하세요.",
            "button": "입장하기",
        }
        : {
            "label": "대화방 이름",
            "placeholder": "생성할 대화방의 이름을 입력하세요.",
            "button": "만들기",
        }

    const onInputChange = () => {
        if(props.chatButtonType === "make") {
            setInputValue(conversationNameRef.current.value)
        }
        if(props.chatButtonType === "enter") {
            setInputValue(conversationCodeRef.current.value)
        }
    }

    const onCancleButtonClick = () => {
        props.setShowDialog(false)
        setInputValue("")
    }
    
    const onEnterButtonClick = async () => {
        if(inputValue.length === 0) {
            return alert("참여코드를 입력해주세요")
        }

        const response = await axios.post(`${process.env.REACT_APP_API_URL}/chat/join-conversation`, {
            code: inputValue
        })
        const result = response.data.result
        
        if(result === "NON_EXISTENT") {
            return alert("대화방이 존재하지 않습니다. 참여코드를 확인해주세요.")
        }
        if(result === "FAILED") {
            return alert("이미 참여 중인 대화방입니다")
        }

        const conversationId = response.data.joinConversation.createdSystemMessage.conversation_id

        props.onListClick(conversationId)
        props.setShowDialog(false)
        setInputValue("")
    }
    
    const onMakeButtonClick = async () => {
        if(inputValue.length === 0) {
            return alert("대화방 이름을 입력해주세요")
        }
        
        await axios.post(`${process.env.REACT_APP_API_URL}/chat/conversation`, {
            name: inputValue
        })

        props.setShowDialog(false)
        setInputValue("")
    }
    
    return (
        <div className={props.showDialog ? "dialog-back" : "dialog-back hide"}>
            <div className="dialog">
                <div className="dialog-body">
                    <label>{dialogContent.label}</label>
                    <input
                        type="text"
                        placeholder={dialogContent.placeholder}
                        value={inputValue}
                        ref={props.chatButtonType === "make"
                            ? conversationNameRef
                            : conversationCodeRef
                        }
                        onChange={onInputChange}
                    />
                    <div className="dialog-button-area">
                        <button onClick={onCancleButtonClick}>취소</button>
                        <button
                            onClick={props.chatButtonType === "make"
                                ? onMakeButtonClick
                                : onEnterButtonClick
                            }
                        >
                            {dialogContent.button}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dialog