import { createContext, useContext, useEffect, useState } from "react";
import { useChatApp } from "./ChatAppContext";
import ChatApi from "../../api/chatApi";
import Repo from "../../auth/Repo";
import React from "react";
import { useNavigate } from "react-router-dom";

const ChatRoomContext = createContext();

export const useChatRoom = () => useContext(ChatRoomContext);

const initChatRoomInfo = {
	chatRoomId: 0,
	name: "",
	imageUriPath: "",
	workSpaceId: 0,
	messages: [],
	participants: [],
	msgHasMore: false,
};

export const ChatRoomProvider = ({ children }) => {
	const { workspaceId, chatRoomId, wsMemberState, updateRoomParticipantCount, removeRoom } = useChatApp();


	const [chatRoomInfo, setChatRoomInfo] = useState(initChatRoomInfo);
	const [inviteMembers, setInviteMembers] = useState([]);
	const [isRoomOwner, setIsRoomOwner] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentMemberInfo, setCurrentMemberInfo] = useState(null);
	const [showAlert, setShowAlert] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		console.log("Updated chatRoomInfo:", chatRoomInfo); // 상태가 바뀔 때마다 콘솔로 확인
	}, [chatRoomInfo]);

	const groupMessagesByDate = (messages) => {
		return messages.reduce((groups, message) => {
			const date = message.date.slice(0, 10);
			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(message);
			return groups;
		}, {});
	};

	const fetchRoomInfo = async () => {
		try {
			const roomInfo = await ChatApi.getChatRoom(workspaceId, chatRoomId);
			console.log("chatRoom_ get info: ", roomInfo);
			roomInfo.messages.reverse();
			setChatRoomInfo(roomInfo);

			const participantsIds = roomInfo.participants.map((participant) =>
				Number(participant.userId)
			);
			// console.log("participantsId: ", participantsIds);

			const nonParticipants = wsMemberState.filter(
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

	const handleInvite = async (addMember) => {
		try {
			// console.log("add member wsmemberId: ", addMember.wsMemberId);
			await ChatApi.addMemberToRoom(
				workspaceId,
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
				workspaceId,
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

	///message
	const handleRegisterAnnouncement = async (message) => {
		try {
			await ChatApi.registerAnnouncementMsg(chatRoomId, message.id);

			setChatRoomInfo((prev) => {
				const updatedMessages = prev.messages.map((msg) =>
					Number(msg.id) === Number(message.id)
						? { ...msg, isAnnouncement: true }
						: { ...msg, isAnnouncement: false }
				);
				return { ...prev, messages: updatedMessages };
			});
		} catch (error) {
			console.error("chatroom _ 공지 등록 에러: ", error);
		}
	};

	const handleDeleteMessage = async (message) => {
		try {
			await ChatApi.deleteMessage(chatRoomId, message.id);

			setChatRoomInfo((prev) => {
				const updatedMessages = prev.messages.filter(
					(msg) => Number(msg.id) !== Number(message.id)
				);
				return { ...prev, messages: updatedMessages };
			});
		} catch (error) {
			console.error("chatroom _ 공지 등록 에러: ", error);
		}
	};

	const handleDelegate = async (newLeader) => {
		// console.log(`${newLeader.email} has been promoted to the leader.`);
		try {
			await ChatApi.delegateLeader(
				workspaceId,
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
		} catch (error) {
			console.error("error fetching delegateChatLeader: ", error);
		}
	};

	const handleExit = async () => {
		try {
			const data = await ChatApi.leaveFromChat(workspaceId, chatRoomId);

			if (data) {
				removeRoom(chatRoomId);
				setIsModalOpen(false);
				navigate(`${window.location.pathname}`); // chatRoomId 쿼리 파라미터를 제거
			}
		} catch (error) {
			console.error("error fetching exit: ", error);
		}
	};

	const showAlertMessage = (message) => {
		setAlertMessage(message);
		setShowAlert(true);
		setTimeout(() => {
			setShowAlert(false);
		}, 5000);
	};

	return (
		<ChatRoomContext.Provider
			value={{
				fetchRoomInfo,
				chatRoomInfo,
				setChatRoomInfo,
				inviteMembers,
				isRoomOwner,
				currentMemberInfo,
				handleInvite,
				handleKick,
				isModalOpen,
				setIsModalOpen,
				handleRegisterAnnouncement,
				handleDeleteMessage,
				handleDelegate,
				handleExit,
				groupMessagesByDate,
				showAlertMessage,
				showAlert,
				alertMessage
			}}
		>
			{children}
		</ChatRoomContext.Provider>
	)
};

