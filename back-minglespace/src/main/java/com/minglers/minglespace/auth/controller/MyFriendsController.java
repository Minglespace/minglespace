package com.minglers.minglespace.auth.controller;

import com.minglers.minglespace.auth.dto.UserResponse;
import com.minglers.minglespace.auth.entity.UserFriend;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.auth.service.UserFriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.function.EntityResponse;

import java.util.List;

@RestController
@RequestMapping("/myFriends")
@RequiredArgsConstructor
public class MyFriendsController {

    private final UserFriendService userFriendService;
    private final JWTUtils jwtUtils;

    //친구 리스트 조회
    @GetMapping({"","/{searchKeyword}"})
    public ResponseEntity<List<UserResponse>> getMyFriendList(@RequestHeader("Authorization") String token,
                                                            @PathVariable(value="searchKeyword",required = false) String searchKeyword) {
        Long userId = jwtUtils.extractUserId(token.substring(7));
        return ResponseEntity.ok(userFriendService.getMyFriendList(userId,searchKeyword));
    }
    //친구 삭제
    @DeleteMapping("/{friendId}")
    public ResponseEntity<List<UserResponse>> remove(@RequestHeader("Authorization") String token,
                                         @PathVariable("friendId") Long friendId){
        Long userId = jwtUtils.extractUserId(token.substring(7));
        return ResponseEntity.ok(userFriendService.remove(userId, friendId));
    }

    //친추를 위한 유저 검색
    @GetMapping({"/userSearch","/userSearch/{searchKeyword}"})
    public ResponseEntity<List<UserResponse>> getNonFriendList(@RequestHeader("Authorization") String token,
                                                               @PathVariable(value="searchKeyword",required = false) String searchKeyword){
        Long userId = jwtUtils.extractUserId(token.substring(7));
        return ResponseEntity.ok(userFriendService.getNonFriendList(userId, searchKeyword));
    }

    //친구 신청
    @PostMapping("/{friendId}")
    public ResponseEntity<UserResponse> addFriend(@RequestHeader("Authorization") String token,
                            @PathVariable("friendId") Long friendId){
        Long userId = jwtUtils.extractUserId(token.substring(7));
     return ResponseEntity.ok(userFriendService.addFriend(userId,friendId));
    }
    //친구 수락
    @PutMapping("/accept/{friendId}")
    public void acceptFriend(@RequestHeader("Authorization") String token,
                             @PathVariable("friendId") Long friendId){
        Long userId = jwtUtils.extractUserId(token.substring(7));
    }
    //친구 거절

    //친구 신청목록

    //친구 요청온 목록
}
