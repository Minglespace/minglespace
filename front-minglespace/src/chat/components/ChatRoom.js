import React, { useEffect, useState } from "react";
import ChatRoomHeader from "./ChatRoomHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatApi from "../../api/chatApi";
import { useLocation, useNavigate } from "react-router-dom";
import Repo from "../../auth/Repo";

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
  const chatRoomId = new URLSearchParams(useLocation().search).get(
    "chatRoomId"
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!chatRoomId) {
      console.log("No chatRoomId provided, skipping server request.");

      return;
    }

    // 채팅방 정보 서버에 요청
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

        //방 리더인지 확인
        const currentMemberInfo = roomInfo.participants.find(
          (participant) =>
            Number(participant.userId) === Number(Repo.getUserId())
        );
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
      const data = await ChatApi.addMemberToRoom(
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

      const updatedInviteMembers = inviteMembers.filter(
        (member) => member.wsMemberId !== addMember.wsMemberId
      );

      setInviteMembers(updatedInviteMembers);

      updateRoomParticipantCount(chatRoomId, 1);

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
  ]);

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
  const handleSendMessage = (messageText) => {
    const newMessage = {
      text: messageText,
      replies: [],
      sender: "User",
      isCurrentUser: true,
      message_id: messages.length + 1,
    };

    if (replyToMessage) {
      // 답글이 달린 메시지 처리
      const updatedMessages = messages.map((msg) => {
        if (msg.message_id === replyToMessage.message_id) {
          return {
            ...msg,
            replies: [...msg.replies, { sender: "User", text: messageText }],
          };
        }
        return msg;
      });
      setMessages(updatedMessages);
    } else {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    }

    // 메시지 전송 후 입력창 초기화
    setNewMessage("");
    setReplyToMessage(null); // 답글 상태 초기화
    console.log("현재 메시지 목록: ", messages);
  };

  // 메시지를 클릭하면 해당 메시지를 선택
  const handleMessageClick = (messageId) => {
    setSelectedMessageId(messageId);
  };

  // 답글을 작성하는 함수
  const handleReplyChange = (event) => {
    setReplyToMessage(event.target.value);
  };

  const handlePostReply = () => {
    if (selectedMessageId !== null && setReplyToMessage.trim() !== "") {
      // 답글을 작성한 메시지 ID에 추가
      const newMessages = messages.map((message) => {
        if (message.message_id === selectedMessageId) {
          return {
            ...message,
            replies: [
              ...message.replies,
              { user: "User3", content: setReplyToMessage },
            ],
          };
        }
        return message;
      });

      setMessages(newMessages);
      setReplyToMessage(""); // 답글 작성 후 입력 필드 초기화
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
        setReplyToMessage={setReplyToMessage} // 답글 달고 싶은 메시지 설정
      />

      <MessageInput
        onSendMessage={handleSendMessage}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        replyToMessage={replyToMessage}
        setReplyToMessage={setReplyToMessage}
      />

      {/*  메시지 전송 처리 */}
    </div>
  );
};

export default ChatRoom;
