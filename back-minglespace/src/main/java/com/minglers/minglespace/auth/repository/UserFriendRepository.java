package com.minglers.minglespace.auth.repository;

import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.entity.UserFriend;
import com.minglers.minglespace.auth.type.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserFriendRepository extends JpaRepository<UserFriend, Long> {
    Optional<UserFriend> findByUser(User user);

    @Query("SELECT u FROM UserFriend uf JOIN uf.friend u " +
            "WHERE uf.user.id = :userId AND uf.friendshipStatus = :friendshipStatus " +
            "AND (:searchKeyword IS NULL OR u.name LIKE %:searchKeyword%) " +
            "ORDER BY u.name ASC")
    List<User> findAllByUserIdAndStatus(@Param("userId") Long userId,
                                        @Param("friendshipStatus") FriendshipStatus friendshipStatus,
                                        @Param("searchKeyword") String searchKeyword);
}
