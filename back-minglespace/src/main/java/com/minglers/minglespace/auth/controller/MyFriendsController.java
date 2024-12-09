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

    @GetMapping({"","/{searchKeyword}"})
    public ResponseEntity<List<UserResponse>> getMyFriendList(@RequestHeader("Authorization") String token,
                                                            @PathVariable(value="searchKeyword",required = false) String searchKeyword) {
        Long userId = jwtUtils.extractUserId(token.substring(7));
        return ResponseEntity.ok(userFriendService.getMyFriendList(userId,searchKeyword));
    }
}
