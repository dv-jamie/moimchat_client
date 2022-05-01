import axios from "axios"
import { useEffect, useRef, useState } from "react"
import Moment from "react-moment"
import Dialog from "../components/Dialog"
import Header from "../components/Header"
import "./ChatPage.css"

function ChatPage(props) {
    const wsRef = useRef(null)
    const jwtTokenRef = useRef(null)
    const searchRef = useRef(null)
    const checkedConversationIds = useRef([])
    const messageWrapRef = useRef()
    const messageEndRef = useRef()
    const [messageInputText, setMessageInputText] = useState()
    const [userInfo, setUserInfo] = useState([])
    const [showDialog, setShowDialog] = useState(false)
    const [chatButtonType, setChatButtonType] = useState("")
    const [myAllConversations, setMyAllConversations] = useState([])
    const [mySearchedConversations, setMySearchedConversations] = useState([])
    const [isSearched, setIsSearched] = useState(false)
    const [clickedConversationId, setClickedConversationId] = useState(null)
    const [myConversationById, setMyConversationById] = useState([])
    const [messages, setMessages] = useState([])
    const [joinedUsers, setJoinedUsers] = useState([])
    const [lastDisplayMessages, setLastDisplayMessages] = useState({})
    const [isClickLeftButton, setIsClickLeftButton] = useState(false)
    
    useEffect(() => {
        jwtTokenRef.current = localStorage.getItem("JWT_TOKEN")
        if(jwtTokenRef.current) {
            axios.defaults.headers.common['Authorization'] = jwtTokenRef.current
            getMyAllConversations()
        }
    }, [showDialog])
    
    // 로그인 시(토큰 있을 경우) 웹소켓 생성
    useEffect(() => {
        if(jwtTokenRef.current) {
            wsRef.current = new WebSocket(`${process.env.REACT_APP_WS_URL}?token=${jwtTokenRef.current}`)
            wsRef.current.onopen = () => {
                console.log("ws open")
            }
        }    
    }, [])
    
    if(jwtTokenRef.current) {
        wsRef.current.onmessage = (message) => {
            const parsedMessage = JSON.parse(message.data)
            const type = parsedMessage.type
            const userName = parsedMessage.userName

            switch (type) {
                case "CREATE_MESSAGE": {
                    const createdMessage = parsedMessage.createMessage.createdMessage
                    const conversationId = createdMessage.conversation_id
                    const messageId = createdMessage.id
                    const userId = createdMessage.user_id
                    const text = createdMessage.text
                    const sentAt = createdMessage.sent_at

                    // 대화방 켜져있는 상태에서만 메시지 업데이트
                    if(clickedConversationId === createdMessage.conversation_id) {
                        setMessages([...messages, {
                            id: messageId,
                            user_id: userId,
                            conversation_id: conversationId,
                            text: text,
                            sent_at: sentAt,
                            user_name: userName
                        }])
                    }

                    // 대화방 목록의 마지막 메시지 미리보기 업데이트
                    setLastDisplayMessages(prevState => ({
                        ...prevState,
                        [conversationId]: {
                            id: messageId,
                            text,
                            sent_at: sentAt
                        }
                    }))

                    // 스크롤 위치
                    scrollToBottom("smooth")
                    
                    break;
                }
                case "JOIN_CONVERSATION": {
                    const createdSystemMessage = parsedMessage.joinConversation.createdSystemMessage
                    
                    if(clickedConversationId === createdSystemMessage.conversation_id) {
                        setMessages([...messages, {
                            id: createdSystemMessage.id,
                            user_id: createdSystemMessage.user_id,
                            conversation_id: createdSystemMessage.conversation_id,
                            text: createdSystemMessage.text,
                            sent_at: createdSystemMessage.sent_at,
                            user_name: "ADMIN",
                        }])

                        // 스크롤 위치
                        scrollToBottom("smooth")
    
                        // 참여자 목록에 추가
                        setJoinedUsers([...joinedUsers, {
                            id: parsedMessage.userId,
                            name: userName
                        }])
                    }

                    break;
                }
                case "LEFT_CONVERSATION": {
                    const createdSystemMessages = parsedMessage.leftConversation.createdSystemMessages
                    
                    createdSystemMessages.forEach(createdSystemMessage => {
                        // 대화방 켜져있는 상태에서만 메시지 업데이트
                        if(clickedConversationId === createdSystemMessage.conversation_id) {
                            setMessages([...messages, {
                                id: createdSystemMessage.id,
                                user_id: createdSystemMessage.user_id,
                                conversation_id: createdSystemMessage.conversation_id,
                                text: createdSystemMessage.text,
                                sent_at: createdSystemMessage.sent_at,
                                user_name: "ADMIN",
                            }])
                        }

                        // 스크롤 위치
                        scrollToBottom("smooth")
        
                        // 참여자 목록에서 name 일치할 경우 삭제
                        setJoinedUsers(joinedUsers.filter(v => v.name !== userName))
                    })

                    break;
                }

            }
        };
    }

    useEffect(() => {
        getUserInfo()
    }, [])

    const getUserInfo = async () => {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/user/info`)
        
        setUserInfo(response.data.getUserInfo.userInfo)
    }

    const getMyAllConversations = async () => {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat/conversation`)
        const myAllConversations = response.data.getMyConversations.myConversations
        
        const lastDisplayMessagesObject = {}
        myAllConversations.forEach(myConversation => {
            lastDisplayMessagesObject[myConversation.id] = {
                id: myConversation.last_display_message_id,
                text: myConversation.last_display_message_text,
                sent_at: myConversation.last_display_message_sent_at,
            }
        })
        
        setMyAllConversations(myAllConversations)
        setLastDisplayMessages(lastDisplayMessagesObject)
    }

    const scrollToBottom = (behavior) => {
        messageEndRef.current.scrollIntoView({ behavior: behavior })
    }

    // 대화방 검색 기능
    let myConversations = isSearched ? mySearchedConversations : myAllConversations
    
    const onSearchButtonClick = () => {
        const keyword = searchRef.current.value.toUpperCase()
        setMySearchedConversations(myAllConversations.filter(v => v.name.includes(keyword)))
        keyword.length === 0 ? setIsSearched(false) : setIsSearched(true)
    }
    //

    // 입장하기 or 만들기 버튼 클릭 시
    const onButtonClickByType = (type) => {
        setShowDialog(true)
        setChatButtonType(type)
        setIsSearched(false)
    }
    //

    const onListClick = async (conversationId) => {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/chat/${conversationId}/conversation`)
        const getMyConversationById = response.data.getMyConversationById

        setMyConversationById(getMyConversationById.myConversationById)
        setMessages(getMyConversationById.messages)
        setJoinedUsers(getMyConversationById.joinedUsers)
        setClickedConversationId(conversationId)
        setMessageInputText("")
        scrollToBottom("auto")
    }

    // 메시지 전송 기능
    const onMessageInputTextChange = e => {
        setMessageInputText(e.target.value)
    }

    const onSendMessageButton = (conversationId) => {
        if(!messageInputText) return alert("메시지를 입력해주세요")

        if(wsRef) {
            wsRef.current.send(JSON.stringify({
                type: "CREATE_MESSAGE",
                user_id: userInfo.id,
                conversation_id: conversationId,
                text: messageInputText
            }))
        }

        setMessageInputText("")
    }
    //

    // 대화방 나가기 기능
    const onLeftIconClick = () => {
        if(isClickLeftButton) setIsClickLeftButton(false)
        setIsClickLeftButton(true)
    }

    const onCancleLeftButtonClick = () => {
        setIsClickLeftButton(false)
    }

    const onCheckboxChange = (conversationId) => {
        const idx = checkedConversationIds.current.indexOf(conversationId)

        if(idx === -1) checkedConversationIds.current.push(conversationId)
        if(idx !== -1) checkedConversationIds.current.splice(idx, 1)
    }

    const onLeftConfirmButtonClick = () => {
        if(wsRef) {
            wsRef.current.send(JSON.stringify({
                type: "LEFT_CONVERSATION",
                user_id: userInfo.id,
                checkedConversationIds: checkedConversationIds.current
            }))
        }

        let filteredMyConversations = [...myAllConversations]
        checkedConversationIds.current.forEach(checkedConversationId => {
            filteredMyConversations = filteredMyConversations.filter(v => v.id != checkedConversationId)
        })

        checkedConversationIds.current = []
        setMyAllConversations(filteredMyConversations)
        setIsClickLeftButton(false)
        setClickedConversationId(null)
    }
    //

    return (
        <div className="wrap">
            <Header ws={wsRef.current} isLogin={props.isLogin} setIsLogin={props.setIsLogin} />
            <Dialog 
                showDialog={showDialog}
                setShowDialog={setShowDialog}
                chatButtonType={chatButtonType}
                onListClick={onListClick}
            />

            <div className="container">
                <div className="snb">
                    <div className="chat-list-header">
                        <ul className="chat-buttons">
                            <li onClick={() => onButtonClickByType("enter")}>
                                <span className="material-icons">login</span>
                                <button>입장하기</button>
                            </li>
                            <li onClick={() => onButtonClickByType("make")}>
                                <span className="material-icons">add</span>
                                <button>만들기</button>
                            </li>
                        </ul>

                        <div className="chat-search-wrap">
                            <input type="text" placeholder="대화방 이름 검색" ref={searchRef} />
                            <button onClick={onSearchButtonClick}>검색</button>
                        </div>
                    </div>

                    <div className="chat-list-body">
                        <ul className="chat-list-wrap">
                            {myConversations.map(myConversation => {
                                const isClickedConversationId = clickedConversationId === myConversation.id ? true : false

                                return (
                                    <li
                                        key={myConversation.id}
                                        className={isClickedConversationId ? "chat-list clicked-chat-list" : "chat-list"}
                                        onClick={() => onListClick(myConversation.id)}
                                    >
                                        {/* 나가기 아이콘 클릭 시(true) => show */}
                                        <div className={isClickLeftButton ? "check-wrap" : "check-wrap hide"}>
                                            <input type="checkbox" onChange={() => onCheckboxChange(myConversation.id)} />
                                        </div>
                                        
                                        <div className="text-wrap">
                                            <div className="title-area">
                                                <span className="chat-title chat-list-title">{myConversation.name}</span>
                                                {!lastDisplayMessages[myConversation.id]
                                                    ? ""
                                                    : lastDisplayMessages[myConversation.id].id === 0
                                                        ? ""
                                                        : <Moment format="HH:mm">
                                                            {lastDisplayMessages[myConversation.id].sent_at}
                                                        </Moment>
                                                }
                                            </div>
                                            <div className="text-area">
                                                {!lastDisplayMessages[myConversation.id]
                                                    ? ""
                                                    : <p className="message-preview">
                                                        {lastDisplayMessages[myConversation.id].text}
                                                    </p>
                                                }
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    <div className="chat-list-footer">
                        {/* 나가기 아이콘 클릭 시(true) => hide */}
                        <span
                            className={isClickLeftButton ? "material-icons left-icon hide" : "material-icons left-icon"}
                            onClick={onLeftIconClick}
                        >
                            logout
                        </span>

                        {/* 나가기 아이콘 클릭 시(true) => show */}
                        <div className={isClickLeftButton ? "left-wrap": "left-wrap hide"}>
                            <span className="left-conversation" onClick={onLeftConfirmButtonClick}>나가기</span>
                            <span className="cancle-left-button" onClick={onCancleLeftButtonClick}>취소</span>
                        </div>
                    </div>
                </div>

                {!clickedConversationId
                    ? <div className="content">
                        <div className="non-content">대화방을 선택해주세요.</div>
                    </div>
                    : <div className="content">
                        {myConversationById.map(conversation => {
                            return (
                                <div key={conversation.id} className="content-header">
                                    <h2 className="chat-title">
                                        {conversation.name}
                                    </h2>
                                    <ul className="chat-desc">
                                        <li>
                                            <span className="material-icons icon">vpn_key</span>
                                            {conversation.code}
                                        </li>
                                        <li>ㆍ</li>
                                        <li>
                                            <span className="material-icons icon">person</span>
                                            {joinedUsers.length}
                                        </li>
                                    </ul>
                                </div>
                            )
                        })}

                        <div className="chat-area">
                            <ul className="message-wrap" ref={messageWrapRef}>
                                {messages.map(message => {
                                    const isMyMessage = userInfo.id === message.user_id ? true : false

                                    return (
                                        <li key={message.id} className={message.user_id === 1 ? "system-message-area" : "message-area"}>
                                            <div className="message-ballon-wrap">
                                                <div className={isMyMessage || message.user_id === 1 ? "hide" : "name"}>
                                                    {message.user_name}
                                                </div>
                                                <div className={isMyMessage
                                                    ? "message-ballon sent-message-ballon"
                                                    : message.user_id === 1
                                                        ? "system-message-ballon"
                                                        : "message-ballon received-message-ballon"}
                                                >
                                                    <p>{message.text}</p>
                                                    {message.user_id === 1
                                                        ? ""
                                                        : <Moment format="HH:mm">
                                                            {message.sent_at}
                                                        </Moment>
                                                    }
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                                <div ref={messageEndRef}></div>
                            </ul>
                        </div>

                        <div className="chat-write-area">
                            <textarea placeholder="메시지를 입력하세요." onChange={e => onMessageInputTextChange(e)} value={messageInputText || ""}></textarea>
                            <button onClick={() => onSendMessageButton(clickedConversationId)} >전송</button>
                        </div>
                    </div>
                }

                {!clickedConversationId
                    ? <div className="aside">
                        <div className="non-content">대화방을 선택해주세요.</div>
                    </div>
                    : <div className="aside">
                        <div className="aside-header">참여자 목록</div>

                        <ul className="joined-user-list">
                            {joinedUsers.map(user => {
                                return (
                                    <li key={user.id} className="joined-user">{user.name}</li>
                                )
                            })}
                        </ul>
                    </div>
                }
            </div>
        </div>
    )
}

export default ChatPage