package com.minglers.minglespace.auth.repository;

import com.minglers.minglespace.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    //친구제외한 유저조회
    @Query("SELECT u FROM User u " +
            "WHERE u.id <> :userId " +
            "AND u.id NOT IN (SELECT f.friend.id FROM UserFriend f WHERE f.user.id = :userId) " +
            "AND (:searchKeyword IS NULL OR u.email LIKE %:searchKeyword%)")
    List<User> findNonFriends(@Param("userId") Long userId, @Param("searchKeyword") String searchKeyword);
}
