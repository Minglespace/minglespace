package com.minglers.minglespace.chat.controller;

import com.minglers.minglespace.chat.service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/chatRooms/{chatRoomId}/messages")
public class ChatMessageController {
  private final ChatMessageService chatMessageService;

  @GetMapping("/search")
  public List<Long> searchMessages(@PathVariable("chatRoomId") Long chatRoomId,
                                             @RequestParam List<String> keywords){
    return chatMessageService.searchMessages(chatRoomId, keywords);
  }

  @PutMapping("/{messageId}/announcement")
  public ResponseEntity<String> setAnnouncement(@PathVariable("chatRoomId") Long chatRoomId,
                                        @PathVariable("messageId") Long messageId){
    return ResponseEntity.ok().body(chatMessageService.updateAnnouncement(chatRoomId, messageId));
  }

  @DeleteMapping("/{messageId}")
  public ResponseEntity<String> deleteMessage(@PathVariable("chatRoomId") Long chatRoomId,
                                              @PathVariable("messageId") Long messageId){
    return ResponseEntity.ok().body(chatMessageService.deleteMessage(chatRoomId, messageId));
  }
}
