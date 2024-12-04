package com.minglers.minglespace.chat.service;

import com.minglers.minglespace.chat.dto.ChatMessageDTO;
import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.entity.ChatRoom;
import com.minglers.minglespace.chat.repository.ChatMessageRepository;
import com.minglers.minglespace.chat.repository.ChatRoomRepository;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
public class ChatMessageServiceImpl implements ChatMessageService {
    private final ChatMessageRepository chatMessageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final WSMemberRepository wsMemberRepository;

    // 메시지 저장
    @Override
    public Long saveMessage(ChatMessageDTO messageDTO) {
        ChatRoom chatRoom = chatRoomRepository.findById(messageDTO.getChatRoomId()).orElseThrow();
        WSMember wsMember = wsMemberRepository.findById(messageDTO.getWriter()).orElseThrow();
        ChatMessage parentMsg = chatMessageRepository.findById(messageDTO.getReplyId()).orElseThrow();

        ChatMessage chatMessage = ChatMessage.builder()
                .content(messageDTO.getContent())
                .wsMember(wsMember)
                .chatRoom(chatRoom)
                .parentMessage(parentMsg)
                .date(LocalDateTime.now())
                .build();
        return chatMessageRepository.save(chatMessage).getId();
    }

    // 방 메시지 가져오기
    @Override
    public List<ChatMessageDTO> getMessagesByChatRoom(ChatRoom chatRoom) {
        log.info("getMessagesByChatRoom_chatRoomId : " + chatRoom);
        List<ChatMessage> messages = chatMessageRepository.findByChatRoom(chatRoom);
        log.info("getMessagesByChatRoom_ msg : " + messages);

        List<ChatMessageDTO> dtos = messages.stream()
                .map(msg -> {
                    Long replyId = (msg.getParentMessage() != null) ? msg.getParentMessage().getId() : null;
                    return ChatMessageDTO.builder()
                            .id(msg.getId())
                            .chatRoomId(msg.getChatRoom().getId())
                            .date(msg.getDate())
                            .content(msg.getContent())
                            .replyId(replyId)
                            .writer(msg.getWsMember().getId())
                            .build();
                })
                .collect(Collectors.toList());
        return dtos;
    }
}
