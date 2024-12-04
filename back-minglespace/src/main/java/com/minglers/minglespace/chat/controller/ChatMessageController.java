package com.minglers.minglespace.chat.controller;

import com.minglers.minglespace.chat.dto.ChatMessageDTO;
import com.minglers.minglespace.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@Log4j2
@RequiredArgsConstructor
public class ChatMessageController {
    private final ChatMessageService chatMessageService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @MessageMapping("/chat/{chatRoomId}")
    @SendTo("/topic/chat/{chatRoomId}")
    public ChatMessageDTO saveAndSendChatMessage(@PathVariable Long chatRoomId, @Payload ChatMessageDTO messageDTO){
        log.info("received message : "+messageDTO.getContent()+ " from "+messageDTO.getWriter());

        messageDTO.setChatRoomId(chatRoomId);
        Long savedId = chatMessageService.saveMessage(messageDTO);
        messageDTO.setId(savedId);
        return messageDTO;
    }
}
