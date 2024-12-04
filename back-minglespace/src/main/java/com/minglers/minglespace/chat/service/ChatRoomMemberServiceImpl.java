package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.ChatRoomMemberDTO;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.chat.entity.ChatRoomMember;
import com.minglers.minglespace.chat.repository.ChatRoomMemberRepository;
import com.minglers.minglespace.chat.repository.ChatRoomRepository;
import com.minglers.minglespace.chat.role.ChatRole;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomMemberServiceImpl implements ChatRoomMemberService {

    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final WSMemberRepository wsMemberRepository;
    private final ChatRoomService chatRoomService;

    @Override
    @Transactional
    public void updateIsLeftFromLeave(Long chatRoomId, Long wsMemberId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId).orElseThrow(() -> new RuntimeException("해당하는 채팅방이 없습니다.."));
        WSMember member = wsMemberRepository.findById(wsMemberId).orElseThrow(() -> new RuntimeException("해당하는 멤버가 없습니다. "));

        if (!chatRoomMemberRepository.existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(chatRoomId, wsMemberId)) {
            throw new IllegalArgumentException("채팅방에 참여하지 않은 유저입니다.");
        }

        int updateResult = chatRoomMemberRepository.updateIsLeftStatus(true, chatRoomId, wsMemberId);
        if (updateResult == 0) {
            throw new IllegalArgumentException("Failed to mark user as left. User not found in the chat room.");
        }

        boolean isChatRoomEmpty = !chatRoomMemberRepository.existsByChatRoomIdAndIsLeftFalse(chatRoomId);
        if (isChatRoomEmpty) {
            chatRoomService.deleteChatRoomData(chatRoomId);
        }
    }

    @Override
    @Transactional
    public void addUserToRoom(Long chatRoomId, Long wsMemberId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId).orElseThrow(() -> new RuntimeException("해당하는 채팅방이 없습니다.."));
        WSMember member = wsMemberRepository.findById(wsMemberId).orElseThrow(() -> new RuntimeException("해당하는 멤버가 없습니다. "));

        if (chatRoomMemberRepository.existsByChatRoomIdAndWsMemberId(chatRoomId, wsMemberId)) {
            chatRoomMemberRepository.updateIsLeftStatus(false, chatRoomId, wsMemberId);
        } else {
            ChatRoomMember chatRoomMember = ChatRoomMember.builder()
                    .chatRoom(chatRoom)
                    .chatRole(ChatRole.CHATMEMBER)
                    .wsMember(member)
                    .date(LocalDateTime.now())
                    .build();

            chatRoom.addChatRoomMember(chatRoomMember);
            chatRoomMemberRepository.save(chatRoomMember);
        }
    }

    @Override
    @Transactional
    public void kickMemberFromRoom(Long chatRoomId, Long wsMemberId) {
        if (!chatRoomMemberRepository.existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(chatRoomId, wsMemberId)) {
            throw new IllegalArgumentException("채팅방에 참여하지 않은 유저입니다.");
        }

        chatRoomMemberRepository.updateIsLeftStatus(true, chatRoomId, wsMemberId);
    }

    @Override
    public List<ChatRoomMemberDTO> getParticipantsByChatRoomId(Long chatRoomId) {
        List<ChatRoomMember> chatRoomMembers = chatRoomMemberRepository.findByChatRoomId(chatRoomId);

        return chatRoomMembers.stream()
                .map(member -> {
                    ChatRoomMemberDTO dto = ChatRoomMemberDTO.builder()
                            .id(member.getWsMember().getId())
                            .email(member.getWsMember().getUser().getEmail())
                            .build();
                    dto.setChatRole(member.getChatRole());
                    return dto;
                }).collect(Collectors.toList());
    }

    @Override
    public boolean isRoomLeader(Long chatRoomId, Long wsMemberId) {
        Long leaderId = chatRoomMemberRepository.findChatLeaderByChatRoomId(chatRoomId);
        return wsMemberId.equals(leaderId);
    }

    @Override
    public void delegateLeader(Long chatRoomId, Long newLeaderId, Long leaderId) {
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId).orElseThrow(() -> new IllegalArgumentException("채팅방이 존재하지 않습니다."));
        ChatRoomMember chatRoomMember = chatRoomMemberRepository.findByChatRoomIdAndWsMemberId(chatRoomId, leaderId)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

        if (!chatRoomMember.getChatRole().equals(ChatRole.CHATLEADER)) {
            throw new IllegalStateException("방장만 방장 권한을 위임할 수 있습니다.");
        }

        ChatRoomMember newLeader = chatRoomMemberRepository.findByChatRoomIdAndWsMemberId(chatRoomId, newLeaderId)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

        chatRoomMember.setChatRole(ChatRole.CHATMEMBER);
        newLeader.setChatRole(ChatRole.CHATLEADER);

        chatRoomMemberRepository.save(chatRoomMember);
        chatRoomMemberRepository.save(newLeader);
    }

    @Override
    public boolean existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(Long chatRoomId, Long wsMemberId) {
        return chatRoomMemberRepository.existsByChatRoomIdAndWsMemberIdAndIsLeftFalse(chatRoomId, wsMemberId);
    }
}
