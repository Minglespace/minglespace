import React, { useEffect, useRef, useState } from "react";
import ChatRoomHeader from "./ChatRoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatApi from "../../api/chatApi";
import { useLocation, useNavigate } from "react-router-dom";
import Repo from "../../auth/Repo";
import SockJS from "sockjs-client";
import { HOST_URL } from "../../api/Api";
import { Client } from "@stomp/stompjs";

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
  const [replyToMessage, setReplyToMessage] = useState(null); //답글을 달 메시지 상태
  const [chatRoomId, setChatRoomId] = useState(
    new URLSearchParams(useLocation().search).get("chatRoomId")
  );

  const location = useLocation();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    const newchatRoomId = new URLSearchParams(location.search).get(
      "chatRoomId"
    );
    setChatRoomId(newchatRoomId);
  }, [location.search]);

  useEffect(() => {
    console.log("Updated chatRoomInfo:", chatRoomInfo); // 상태가 바뀔 때마다 콘솔로 확인
  }, [chatRoomInfo]);

  useEffect(() => {
    if (!chatRoomId) {
      console.log("No chatRoomId provided, skipping server request.");

      return;
    }

    //채팅방 정보 서버에 요청
    const fetchRoomInfo = async () => {
      try {
        const roomInfo = await ChatApi.getChatRoom(workSpaceId, chatRoomId);
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
  }, [workSpaceId, chatRoomId, wsMembers]);

  const handleInvite = async (addMember) => {
    try {
      // console.log("add member wsmemberId: ", addMember.wsMemberId);
      await ChatApi.addMemberToRoom(
        workSpaceId,
        chatRoomId,
        addMember.wsMemberId
      );

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
      await ChatApi.kickMemberFromRoom(
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

      const kickedMember = chatRoomInfo.participants.find(
        (member) => member.wsMemberId === kickMember.wsMemberId
      );

      setInviteMembers((prev) => [...prev, kickedMember]);

      updateRoomParticipantCount(chatRoomId, -1);

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

  const handleRegisterAnnouncement = async (message) => {
    try {
      await ChatApi.registerAnnouncementMsg(chatRoomId, message.id);

      setChatRoomInfo((prev) => {
        const updatedMessages = prev.messages.map((msg) =>
          Number(msg.id) === Number(message.id) ? { ...msg, isAnnouncement: true } : { ...msg, isAnnouncement: false })
        return { ...prev, messages: updatedMessages };
      })
    } catch (error) {
      console.error("chatroom _ 공지 등록 에러: ", error);
    }
  }

  /////////////////////websocket 연결///////////////////
  useEffect(() => {
    if (!chatRoomId) {
      console.log("No chatRoomId provided, skipping server request.");
      return;
    }

    // 이전 연결 있으면 제거
    if (socketRef.current) {
      //&& socketRef.current.active
      socketRef.current.deactivate();
      socketRef.current = null;
    }

    const socket = new SockJS(`${HOST_URL}/ws`);

    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${Repo.getAccessToken()}`,
      },
      onConnect: () => {
        console.log(`채팅방 ${chatRoomId}번 websocket 연결 완료`);

        ///채팅 실시간 메시지 구독
        stompClient.subscribe(`/topic/chatRooms/${chatRoomId}/msg`, (msg) => {
          const newMsg = JSON.parse(msg.body);
          console.log("chatRoom_ new msg: ", newMsg);

          setChatRoomInfo((prev) => ({
            ...prev,
            messages: [...prev.messages, newMsg],
          }));
        });
        //메시지 읽음 실시간 구독
        stompClient.subscribe(`/topic/chatRooms/${chatRoomId}/read-status`, (readstatus) => {
          const readStatusData = JSON.parse(readstatus.body);
          console.log("읽음 처리 메시지", readStatusData);

          ///특정 유저가 실시간으로 읽은 메시지 상태 반영
          setChatRoomInfo((prev) => ({
            ...prev,
            messages: prev.messages.map((message) => ({
              ...message,
              unReadMembers: message.unReadMembers.filter(
                (member) => Number(member.wsMemberId) !== Number(readStatusData.wsMemberId)
              ),
            })),
          }));
        });
      },
      onWebSocketError: (error) => {
        console.log(`채팅방 ${chatRoomId}번 websocket 연결 오류:`, error);
        alert("실시간 연결 오류가 발생했습니다. 다시 시도");
        window.location.reload();
      },
      reconnectDelay: 5000, // 5초마다 자동 재연결 시도
      heartbeatIncoming: 4000, // 서버에서 4초마다 ping
      heartbeatOutgoing: 4000, // 클라이언트에서 4초마다 pong
      withCredentials: true, //쿠키, 인증정보 포함
    });

    stompClient.activate();
    socketRef.current = stompClient;

    //언마운트시 연결 종료
    return () => {
      if (socketRef.current) {
        socketRef.current.deactivate();
        socketRef.current = null;
      }
    };
  }, [chatRoomId]);


  // 메시지 전송 처리 함수 
  const handleSendMessage = (newMessage) => {

    if (socketRef && socketRef.current) {
      const sendMessage = {
        content: newMessage.content,
        isAnnouncement: false,
        mentionedUserIds: [], ///구현 필요
        replyId: newMessage.replyId,
        sender: currentMemberInfo.name,
        workspaceId: chatRoomInfo.workSpaceId,
        writerWsMemberId: currentMemberInfo.wsMemberId,
      };

      console.log("Sending message:", JSON.stringify(sendMessage));

      socketRef.current.publish({
        destination: `/app/messages/${chatRoomId}`,
        body: JSON.stringify(sendMessage),
      });
    } else {
      console.warn("websocket 미연결 or 메시지 빔");
    }

  };


  // 메시지를 클릭하면 해당 메시지를 선택
  const handleMessageClick = (messages) => {
    console.log("답장할 메시지:", messages);
    // setSelectedMessageId(messageId);
    setReplyToMessage(messages);
    console.log("입력창에 표시된 답장 대상:", `${messages.text}`);
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

      <MessageList
        messages={chatRoomInfo.messages}
        onMessageClick={handleMessageClick}
        currentMemberInfo={currentMemberInfo}
        onRegisterAnnouncement={handleRegisterAnnouncement}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        replyToMessage={replyToMessage}
        setReplyToMessage={setReplyToMessage}
      />
    </div>
  );
};

export default ChatRoom;
