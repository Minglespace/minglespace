package com.minglers.minglespace.auth.entity;

import com.minglers.minglespace.auth.type.FriendshipStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "userfriend", uniqueConstraints = { @UniqueConstraint(columnNames = {"user_id", "friend_id"}) })
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
public class UserFriend {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "friend_id")
    private User friend;

    @Enumerated(EnumType.STRING)
    private FriendshipStatus friendshipStatus;

}
