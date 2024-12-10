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

  console.log("wsMembers.", wsMembers);
  useEffect(() => {
    if (!chatRoomId) {
      console.log("No chatRoomId provided, skipping server request.");

      return;
    }

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

        //��리더�� �인
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

      //참여갱신
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

      //초� 목록 갱신
      const updatedInviteMembers = inviteMembers.filter(
        (member) => member.wsMemberId !== addMember.wsMemberId
      );

      setInviteMembers(updatedInviteMembers);

      //목록보이참여 카운갱신
      updateRoomParticipantCount(chatRoomId, 1);

      // alert(addMember.name, "채팅��초� �료: ", data);
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

      //초� 목록 갱신
      const kickedMember = chatRoomInfo.participants.find(
        (member) => member.wsMemberId === kickMember.wsMemberId
      );

      setInviteMembers((prev) => [...prev, kickedMember]);

      //목록보이참여 카운갱신
      updateRoomParticipantCount(chatRoomId, -1);

      // alert(kickMember.name, "채팅��강퇴 �료: ", data);
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

      //방장 �임 로컬 �데�트
      setChatRoomInfo((prev) => {
        const updatedParticipants = prev.participants.map((member) => {
          //�재 방장 �� 변��          if (Number(member.userId) === Number(Repo.getUserId)) {
          //   return { ...member, chatRole: "CHATMEMBER" };
          // }

          //방장 �임
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
      // alert(`�로방장�로 ${newLeader.name}�이 �정�었�니`);
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

        navigate(`${window.location.pathname}`); // chatRoomId 쿼리 �라미터륜거
      }
    } catch (error) {
      console.error("error fetching exit: ", error);
    }
  };

  const [messages, setMessages] = useState([
    { sender: "Alice", text: "Hello!", isCurrentUser: false },
    { sender: "Bob", text: "Hi!", isCurrentUser: false },
  ]);

  const [newMessage, setNewMessage] = useState("");

  // 메시지 �송 처리 �수
  const handleSendMessage = (newMessage) => {
    // �로메시지 객체��추�
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "User", text: newMessage, isCurrentUser: true },
    ]);
    console.log(messages);
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
        {/* �기채팅 메시지�이 �어갑니*/}
        <MessageList messages={messages} /> {/* �송메시지 목록 �시 */}
        <MessageInput onSendMessage={handleSendMessage} />
        {/* 메시지 �송 처리 */}
      </div>
    </div>
  );
};

export default ChatRoom;
