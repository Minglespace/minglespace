package com.minglers.minglespace.chat.controller;

import com.minglers.minglespace.chat.dto.ChatMessageDTO;
import com.minglers.minglespace.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/chatRooms/{chatRoomId}/messages")
public class ChatMessageRestController {
  private final ChatMessageService chatMessageService;

  @GetMapping("/search")
  public List<ChatMessageDTO> searchMessages(@PathVariable("chatRoomId") Long chatRoomId,
                                             @RequestParam List<String> keywords){
    return chatMessageService.searchMessages(chatRoomId, keywords);
  }
}
