﻿import React, { useEffect, useRef, useState } from "react";
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

        ///구독 연결
        stompClient.subscribe(`/topic/chatRooms/${chatRoomId}/msg`, (msg) => {
          const newMsg = JSON.parse(msg.body);
          console.log("chatRoom_ new msg: ", newMsg);

          setChatRoomInfo((prev) => ({
            ...prev,
            messages: [...prev.messages, newMsg],
          }));
        });
      },
      onWebSocketError: (error) => {
        console.log(`채팅방 ${chatRoomId}번 websocket 연결 오류:`, error);
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
  // const handleSendMessage = (msg) => {
  //   // console.log("name type: ", msg);
  //   // console.log("wsMemberId type: ", currentMemberInfo.wsMemberId);
  //   // if (socketRef.current) {
  //   if (socketRef && socketRef.current) {
  //     const newMessage = {
  //       content: msg,
  //       isAnnouncement: false, ////수정 필요
  //       mentionedUserIds: [],
  //       replyId: null,
  //       sender: currentMemberInfo.name,
  //       workspaceId: chatRoomInfo.workSpaceId,
  //       writerWsMemberId: currentMemberInfo.wsMemberId,
  //     };

  //     console.log("Sending message:", JSON.stringify(newMessage));

  //     socketRef.current.publish({
  //       destination: `/app/messages/${chatRoomId}`,
  //       body: JSON.stringify(newMessage),
  //     });
  //   } else {
  //     console.warn("websocket 미연결 or 메시지 빔");
  //   }
  // };

  const [messages, setMessages] = useState([
    {
      message_id: 1,
      sender: "Alice",
      text: "Hello!",
      isCurrentUser: false,
      replies: [],
    },
    {
      message_id: 2,
      sender: "Bob",
      text: "Hi there!",
      isCurrentUser: false,
      replies: [],
    },
    {
      message_id: 3,
      sender: "sun",
      text: "Hi there!",
      replies: [],
      isCurrentUser: false,
    },
  ]);

  /////답글 부분
  const [newMessage, setNewMessage] = useState("");
  const [replyToMessage, setReplyToMessage] = useState(null); //답글을 달 메시지 상태
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  // 메시지에 답글 추가하는 함수
  const onAddReply = (messageIndex, replyText) => {
    const updatedMessages = [...messages]; // 기존 메시지 배열 복사
    const message = updatedMessages[messageIndex];

    // 해당 메시지에 답글 추가
    message.replies.push({
      sender: "User",
      text: replyText,
      isCurrentUser: true,
    });
    setMessages(updatedMessages); // 업데이트된 메시지 배열로 상태 갱신
    setNewMessage(""); // 새 메시지 입력창 비우기
    setReplyToMessage(null); // 답글 작성 후 상태 초기화
  };

  // 메시지 전송 처리 함수
  const handleSendMessage = (newMessage) => {
    const messageWithId = {
      ...newMessage,
      message_id: messages.length + 1, // 고유 ID 생성
      sender: "나", // 예시로 "나"를 보낸 사람으로 설정
      isCurrentUser: true, // 현재 사용자 메시지 여부
    };

    setMessages((prevMessages) => [...prevMessages, messageWithId]); // 메시지 추가
  };

  // 메시지를 클릭하면 해당 메시지를 선택
  const handleMessageClick = (messages) => {
    console.log("답장할 메시지:", messages);
    // setSelectedMessageId(messageId);
    setReplyToMessage(messages);
    setNewMessage(`@${messages.text}`);
    console.log("입력창에 표시된 답장 대상:", `${messages.text}`);
  };

  // 답글을 작성하는 함수
  const handleReplyChange = (event) => {
    setReplyToMessage(event.target.value);
  };

  const handlePostReply = () => {
    if (
      selectedMessageId !== null &&
      replyToMessage &&
      replyToMessage.trim() !== ""
    ) {
      const newMessages = messages.map((message) => {
        if (message.message_id === selectedMessageId) {
          return {
            ...message,
            replies: [
              ...message.replies,
              { user: "User3", content: replyToMessage },
            ],
          };
        }
        return message;
      });

      setMessages(newMessages);
      setReplyToMessage(""); // 답글 입력 필드 초기화
    } else {
      alert("답글을 달 메시지를 선택하거나 내용을 입력하세요.");
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

      <MessageList
        messages={messages || []}
        // messages={chatRoomInfo.messages}
        setReplyToMessage={setReplyToMessage} // 답글 달고 싶은 메시지 설정
        onMessageClick={handleMessageClick}
        currentUser="나 "
        currentMemberInfo={currentMemberInfo}
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        replyToMessage={replyToMessage}
        setReplyToMessage={setReplyToMessage}
      />
    </div>
  );
};

export default ChatRoom;
