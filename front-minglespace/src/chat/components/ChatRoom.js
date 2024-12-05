import React, { useEffect, useState } from "react";
import ChatRoomHeader from "./ChatRoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatApi from "../../api/chatApi";
import { useLocation } from "react-router-dom";

// private List<ChatMessageDTO> messages;
// private List<ChatRoomMemberDTO> participants;

const initChatRoomInfo = {
  chatRoomId:0,
  name:"",
  imageUriPath:"",
  workSpaceId:0,
  messages:[],
  participants:[]
};
const ChatRoom = ({ isFold, wsmembers, workSpaceId }) => {
  const [chatRoomInfo, setChatRoomInfo] = useState(initChatRoomInfo);
  const [inviteMembers, setInviteMembers] = useState([]);
  const chatRoomId = new URLSearchParams(useLocation().search).get("chatRoomId");

  useEffect(()=>{
    const fetchRoomInfo = async () => {
      try{
        const roomInfo = await ChatApi.getChatRoom(workSpaceId, chatRoomId);
        console.log("chatRoom_ get info: ", roomInfo);
        setChatRoomInfo(roomInfo);
        
        const participantsIds = roomInfo.participants.map(participant => participant.userId);

        const nonParticipants = wsmembers.filter(member => !participantsIds.includes(member.userId));

        setInviteMembers(nonParticipants);

      }catch(error){
        console.error("error fetching get chatroominfo: ",error);
      }
    };

    fetchRoomInfo();
  },[workSpaceId, chatRoomId]);

  return (
    <div className={`chatroom_container ${isFold ? "folded" : ""}`}>
      <ChatRoomHeader chatRoomInfo={chatRoomInfo} inviteMembers={inviteMembers}/>
      <div className="chat_messages">
        {/* 여기에 채팅 메시지들이 들어갑니다 */}

        <MessageList />
        <MessageInput />
      </div>
    </div>
  );
};

export default ChatRoom;
