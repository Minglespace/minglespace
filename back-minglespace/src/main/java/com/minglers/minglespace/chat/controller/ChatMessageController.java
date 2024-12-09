package com.minglers.minglespace.chat.controller;

import com.minglers.minglespace.chat.config.interceptor.CustomHandShakeInterceptor;
import com.minglers.minglespace.chat.dto.ChatMessageDTO;
import com.minglers.minglespace.chat.entity.ChatMessage;
import com.minglers.minglespace.chat.service.ChatMessageService;
import com.minglers.minglespace.chat.service.MsgReadStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@Log4j2
@RequiredArgsConstructor
public class ChatMessageController {
    private final ChatMessageService chatMessageService;
    private final MsgReadStatusService msgReadStatusService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final CustomHandShakeInterceptor customHandShakeInterceptor;

    @MessageMapping("/chat/{chatRoomId}")
    @SendTo("/topic/chat/{chatRoomId}")
    public ChatMessageDTO saveAndSendChatMessage(@PathVariable Long chatRoomId,
                                                 @Payload ChatMessageDTO messageDTO,
                                                 StompHeaderAccessor headerAccessor){
        //이미 핸드셰이크 단계에서 jwt를 검증했기 때문에 accessor를 이용해 websocket세션에서 userId를 가져온다.
        Authentication authentication = (Authentication) headerAccessor.getUser();
        Long writerUserId = (Long) authentication.getPrincipal();

        if (writerUserId == null){
            log.error("user ID not found in websocket session");
            return null;
        }

        log.info("received message : "+messageDTO.getContent()+ " from "+writerUserId);

        try{
            messageDTO.setChatRoomId(chatRoomId);

            ChatMessage savedMsg = chatMessageService.saveMessage(messageDTO, writerUserId);
            messageDTO.setId(savedMsg.getId());

            //MsgReadStatus테이블에 추가
            msgReadStatusService.createMsgForMembers(savedMsg);

            return messageDTO;
        }catch (Exception e){
            log.error("메시지 저장 중 오류 발생: ",e);
//            String sessionId = customHandShakeInterceptor.getSessionForUser(writerUserId);
            //예외 발생 시 클라이언트에게 오류 메시지 발송
            simpMessagingTemplate.convertAndSendToUser(
                    writerUserId.toString(), "/queue/errors", "Error saving message: "+e.getMessage()
            );
            return null;
        }

    }
}
