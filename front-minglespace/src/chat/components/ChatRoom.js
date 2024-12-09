import React, { useEffect, useRef, useState } from "react";
import ChatRoomHeader from "./ChatRoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatApi from "../../api/chatApi";
import { useLocation, useNavigate } from "react-router-dom";
import Repo from "../../auth/Repo";
import SockJS from "sockjs-client";
import { HOST_URL } from "../../api/Api";
import { Client, Stomp } from "@stomp/stompjs";

const initChatRoomInfo = {
  chatRoomId: 0,
  name: "",
  imageUriPath: "",
  workSpaceId: 0,
  messages: [],
  participants: []
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

  const chatRoomId = new URLSearchParams(useLocation().search).get("chatRoomId");

  const navigate = useNavigate();
  const websocketRef = useRef(null); ///websocket 연결 클라이언트 저장

  useEffect(() => {
    if (!chatRoomId) {
      console.log("No chatRoomId provided, skipping server request.");
      return;
    }

    //채팅방 정보 서버에 요청
    const fetchRoomInfo = async () => {
      try {
        const roomInfo = await ChatApi.getChatRoom(workSpaceId, chatRoomId);
        // console.log("chatRoom_ get info: ", roomInfo);
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

        /////////////////받아온 메시지 저장 필요///////////////

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
  }, [workSpaceId, chatRoomId, wsMembers]);


  const handleInvite = async (addMember) => {
    try {
      // console.log("add member wsmemberId: ", addMember.wsMemberId);
      const data = await ChatApi.addMemberToRoom(workSpaceId, chatRoomId, addMember.wsMemberId);

      //참여자 갱신
      const newParticipant = {
        ...addMember,
        chatRole: "CHATMEMBER"
      };
      const updatedParticipants = [...chatRoomInfo.participants, newParticipant];

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
      updateRoomParticipantCount(chatRoomId, 1);

      // alert(addMember.name, "님 채팅방 초대 완료: ", data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("error fetching addMemberToRoom: ", error);
    }
  };

  const handleKick = async (kickMember) => {
    try {
      // console.log("kick member wsmemberId: ", kickMember.wsMemberId);
      const data = ChatApi.kickMemberFromRoom(
        workSpaceId,
        chatRoomId,
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

      //초대 목록 갱신
      const kickedMember = chatRoomInfo.participants.find(
        (member) => member.wsMemberId === kickMember.wsMemberId
      );

      setInviteMembers((prev) => [...prev, kickedMember]);

      //목록에 보이는 참여 카운트 갱신
      updateRoomParticipantCount(chatRoomId, -1);

      // alert(kickMember.name, "님 채팅방 강퇴 완료: ", data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("error fetching kickMemberToRoom: ", error);
    }
  };

  const handleDelegate = async (newLeader) => {
    try {
      const data = await ChatApi.delegateLeader(
        workSpaceId,
        chatRoomId,
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
      const data = await ChatApi.leaveFromChat(workSpaceId, chatRoomId);

      if (data) {
        removeRoom(chatRoomId);
        setIsModalOpen(false);
        navigate(`${window.location.pathname}`); // chatRoomId 쿼리 파라미터를 제거
      }
    } catch (error) {
      console.error("error fetching exit: ", error);
    }
  };

  // const [messages, setMessages] = useState([
  //   { sender: "Alice", text: "Hello!", isCurrentUser: false },
  //   { sender: "Bob", text: "Hi!", isCurrentUser: false },
  // ]);

  // const [newMessage, setNewMessage] = useState("");

  /////////////////////websocket 연결///////////////////
  useEffect(() => {
    if (!chatRoomId) {
      console.log("No chatRoomId provided, skipping server request.");
      return;
    }

    //이전 연결 있으면 제거
    if (websocketRef.current && websocketRef.current.active) {
      websocketRef.current.deactivate();
      websocketRef.current = null;
    }

    const socket = new SockJS(`${HOST_URL}/ws`);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${Repo.getAccessToken()}`,
      },
      onConnect: () => {
        console.log(`채팅방 ${chatRoomId}번 websocket 연결 완료`);

        ///구독 연결 
        stompClient.subscribe(`/topic/chat/${chatRoomId}`, (msg) => {
          const newMsg = JSON.parse(msg.body);

          setChatRoomInfo(prev => ({
            ...prev,
            messages: [...prev.messages, newMsg]
          }));

        });

      },
      onWebSocketError: (error) => {
        console.log(`채팅방 ${chatRoomId}번 websocket 연결 오류:`, error);
      },
      withCredentials: true, //쿠키, 인증정보 포함
    });

    stompClient.activate();
    websocketRef.current = stompClient;

    //언마운트시 연결 종료
    return () => {
      if (websocketRef.current) {
        websocketRef.current.deactivate();
        websocketRef.current = null;
      }
    };

  }, [chatRoomId]);

  // 메시지 전송 처리 함수
  const handleSendMessage = (msg) => {
    // console.log("name type: ", msg);
    // console.log("wsMemberId type: ", currentMemberInfo.wsMemberId);
    if (websocketRef.current) {
      const newMessage = {
        content: msg,
        isAnnouncement: false,  ////수정 필요
        mentionedUserIds: null,
        replyId: null,
        sender: currentMemberInfo.name,
        //workspaceId
        writerWsMemberId: 6
        // writerWsMemberId: currentMemberInfo.wsMemberId
      };

      console.log("Sending message:", JSON.stringify(newMessage));


      websocketRef.current.publish({
        destination: `/app/chat/${chatRoomId}`,
        body: JSON.stringify(newMessage),
      });
    } else {
      console.warn("websocket 미연결 or 메시지 빔");
    }
  };


  return (
    <div className={`chatroom_container ${isFold ? "folded" : ""}`}>
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
        {/* 메시지 전송 처리 */}
      </div>
    </div>
  );
};

export default ChatRoom;
