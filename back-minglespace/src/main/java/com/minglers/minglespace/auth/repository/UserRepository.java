package com.minglers.minglespace.auth.repository;

import com.minglers.minglespace.auth.entity.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
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
            "AND u.deleteFlag = false " +
            "AND (:searchKeyword IS NULL OR u.email LIKE CONCAT('%', :searchKeyword, '%') ESCAPE '\\') " +
            "ORDER BY u.name ASC")
    Slice<User> findNonFriends(@Param("userId") Long userId, @Param("searchKeyword") String searchKeyword, Pageable pageable);
}
