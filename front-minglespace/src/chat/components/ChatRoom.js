import React, { useEffect, useRef, useState } from "react";
import ChatRoomHeader from "./ChatRoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatApi from "../../api/chatApi";
import { useLocation, useNavigate } from "react-router-dom";
import Repo from "../../auth/Repo";
import { useWebSocket } from "../context/WebSocketContext";

const initChatRoomInfo = {
  chatRoomId: 0,
  name: "",
  imageUriPath: "",
  workSpaceId: 0,
  messages: [],
  participants: [],
};

const ChatRoom = ({
  isFold,
  wsMembers,
  workSpaceId,
  updateRoomParticipantCount,
  removeRoom,
}) => {
  const [chatRoomInfo, setChatRoomInfo] = useState(initChatRoomInfo);
  const [inviteMembers, setInviteMembers] = useState([]);
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMemberInfo, setCurrentMemberInfo] = useState(null); //participants에서 현재 유저 뽑아내기
  const [validChatRoomId, setValidChatRoomId] = useState(new URLSearchParams(useLocation().search).get("chatRoomId"));

  const location = useLocation();
  const navigate = useNavigate();
  const validChatRoomIdRef = useRef(validChatRoomId);

  useEffect(() => {
    console.log("chatroom _ 변경된 validId: ", validChatRoomId);
    validChatRoomIdRef.current = validChatRoomId;
    console.log("chatroom _ 변경되고나서 ref: ", validChatRoomIdRef.current);
  }, [validChatRoomId]);

  useEffect(() => {
    const chatRoomId = new URLSearchParams(location.search).get("chatRoomId");
    setValidChatRoomId(chatRoomId);
  }, [location.search]);


  useEffect(() => {
    console.log("Updated chatRoomInfo:", chatRoomInfo);  // 상태가 바뀔 때마다 콘솔로 확인
  }, [chatRoomInfo]);


  useEffect(() => {
    const currentChatRoomId = validChatRoomIdRef.current;
    if (!currentChatRoomId) {
      console.log("No chatRoomId provided, skipping server request.");

      return;
    }

    //채팅방 정보 서버에 요청
    const fetchRoomInfo = async () => {
      try {
        const roomInfo = await ChatApi.getChatRoom(workSpaceId, currentChatRoomId);
        console.log("chatRoom_ get info: ", roomInfo);
        setChatRoomInfo(roomInfo);

        const participantsIds = roomInfo.participants.map((participant) =>
          Number(participant.userId)
        );
        // console.log("participantsId: ", participantsIds);

        const nonParticipants = wsMembers.filter(
          (member) => !participantsIds.includes(Number(member.userId))
        );
        // console.log("wsmembers: ", wsMembers);
        // console.log("nonparticipants: ", nonParticipants);

        setInviteMembers(nonParticipants);

        //방 리더인지 확인
        const currentMemberInfo = roomInfo.participants.find(
          (participant) =>
            Number(participant.userId) === Number(Repo.getUserId())
        );
        setCurrentMemberInfo(currentMemberInfo);
        // console.log("chatroom_ currentmemberinfo:", currentMemberInfo);
        if (currentMemberInfo.chatRole === "CHATLEADER") {
          setIsRoomOwner(true);
        } else {
          setIsRoomOwner(false);
        }
      } catch (error) {
        console.error("error fetching get chatroominfo: ", error);
      }
    };

    fetchRoomInfo();

    setIsModalOpen(false);
  }, [workSpaceId, validChatRoomId, wsMembers]);


  const handleInvite = async (addMember) => {
    try {
      // console.log("add member wsmemberId: ", addMember.wsMemberId);
      await ChatApi.addMemberToRoom(workSpaceId, validChatRoomId, addMember.wsMemberId);

      //참여자 갱신
      const newParticipant = {
        ...addMember,
        chatRole: "CHATMEMBER",
      };
      const updatedParticipants = [
        ...chatRoomInfo.participants,
        newParticipant,
      ];

      setChatRoomInfo((prev) => ({
        ...prev,
        participants: updatedParticipants,
      }));

      //초대 목록 갱신
      const updatedInviteMembers = inviteMembers.filter(
        (member) => member.wsMemberId !== addMember.wsMemberId
      );

      setInviteMembers(updatedInviteMembers);

      //목록에 보이는 참여 카운트 갱신
      updateRoomParticipantCount(validChatRoomId, 1);

      // alert(addMember.name, "님 채팅방 초대 완료: ", data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("error fetching addMemberToRoom: ", error);
    }
  };

  const handleKick = async (kickMember) => {
    try {
      // console.log("kick member wsmemberId: ", kickMember.wsMemberId);
      await ChatApi.kickMemberFromRoom(
        workSpaceId,
        validChatRoomId,
        kickMember.wsMemberId
      );

      //참여 멤버 갱신
      const updatedParticipants = chatRoomInfo.participants.filter(
        (member) => member.wsMemberId !== kickMember.wsMemberId
      );

      setChatRoomInfo((prev) => ({
        ...prev,
        participants: updatedParticipants,
      }));

      const kickedMember = chatRoomInfo.participants.find(
        (member) => member.wsMemberId === kickMember.wsMemberId
      );

      setInviteMembers((prev) => [...prev, kickedMember]);

      updateRoomParticipantCount(validChatRoomId, -1);

      // alert(kickMember.name, "님 채팅방 강퇴 완료: ", data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("error fetching kickMemberToRoom: ", error);
    }
  };

  const handleDelegate = async (newLeader) => {
    console.log(`${newLeader.email} has been promoted to the leader.`);
    try {
      await ChatApi.delegateLeader(
        workSpaceId,
        validChatRoomId.current,
        newLeader.wsMemberId
      );

      //방장 위임 로컬 업데이트
      setChatRoomInfo((prev) => {
        const updatedParticipants = prev.participants.map((member) => {
          //현재 방장 역할 변경
          if (Number(member.userId) === Number(Repo.getUserId)) {
            return { ...member, chatRole: "CHATMEMBER" };
          }

          //새 방장 위임
          if (Number(member.wsMemberId) === Number(newLeader.wsMemberId)) {
            return { ...member, chatRole: "CHATLEADER" };
          }
          return member;
        });

        return {
          ...prev,
          participants: updatedParticipants,
        };
      });

      handleExit();
    } catch (error) {
      console.error("error fetching delegateChatLeader: ", error);
    }
  };

  const handleExit = async () => {
    try {
      const data = await ChatApi.leaveFromChat(workSpaceId, validChatRoomId);

      if (data) {
        removeRoom(validChatRoomId);
        setIsModalOpen(false);
        navigate(`${window.location.pathname}`); // chatRoomId 쿼리 파라미터를 제거
      }
    } catch (error) {
      console.error("error fetching exit: ", error);
    }
  };

  /////////////////websocket
  const handleNewMessage = (newMsg) => {
    const currentChatRoomId = validChatRoomIdRef.current;
    console.log("Received message:", newMsg);
    console.log("chatRoomId: ", currentChatRoomId, ", newMsg_crId: ", newMsg.chatRoomId);
    if (Number(currentChatRoomId) === Number(newMsg.chatRoomId)) {
      console.log("현 채팅방 맞음");
      console.log("chatRoomInfo: ", chatRoomInfo, " , setchatroominfo: ", setChatRoomInfo);
      // setChatRoomInfo(prev => {
      //   // ...prev,
      //   // messages: [...prev.messages, newMsg]

      //   const updatedMessages = [...prev.messages, newMsg];
      //   console.log("Updated messages: ", updatedMessages); // 상태 업데이트 전에 확인
      //   return { ...prev, messages: updatedMessages };
      // });

      setChatRoomInfo((prev) => {
        const updatedMessages = [...prev.messages, newMsg];
        console.log("Updated messages before set: ", updatedMessages); // 상태 업데이트 전에 확인

        return { ...prev, messages: updatedMessages };
      });

      // 상태 업데이트 후 확인
      setChatRoomInfo((prev) => {
        console.log("Chat room info updated:", prev);
        return prev;
      });

    }

  };

  const { isConnected, stompClientRef } = useWebSocket(
    validChatRoomId ?
      [{ path: `/topic/chatRooms/${validChatRoomId}/msg`, messageHandler: handleNewMessage }]
      : []
  );


  // 메시지 전송 처리 함수
  const handleSendMessage = (msg) => {
    // console.log("name type: ", msg);
    // console.log("wsMemberId type: ", currentMemberInfo.wsMemberId);
    // if (socketRef.current) {
    if (isConnected && stompClientRef.current) {
      const newMessage = {
        content: msg,
        isAnnouncement: false,  ////수정 필요
        mentionedUserIds: [],
        replyId: null,
        sender: currentMemberInfo.name,
        workspaceId: chatRoomInfo.workSpaceId,
        writerWsMemberId: currentMemberInfo.wsMemberId
      };

      console.log("Sending message:", JSON.stringify(newMessage));


      stompClientRef.current.publish({
        destination: `/app/messages/${validChatRoomId}`,
        body: JSON.stringify(newMessage),
      });
    } else {
      console.warn("websocket 미연결 or 메시지 빔");
    }
  };


  return (
    <div className={`chatroom-container ${isFold ? "folded" : ""}`}>
      <ChatRoomHeader
        chatRoomInfo={chatRoomInfo}
        inviteMembers={inviteMembers}
        isRoomOwner={isRoomOwner}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleInvite={handleInvite}
        handleKick={handleKick}
        handleDelegate={handleDelegate}
        handleExit={handleExit}
      />
      <div className="chat_messages">
        {/* 여기에 채팅 메시지들이 들어갑니다 */}
        <MessageList messages={chatRoomInfo.messages} currentMemberInfo={currentMemberInfo} /> {/* 전송된 메시지 목록 표시 */}
        <MessageInput onSendMessage={handleSendMessage} />
        {/*  메시지 전송 처리 */}
      </div>
    </div>
  );
};

export default ChatRoom;
