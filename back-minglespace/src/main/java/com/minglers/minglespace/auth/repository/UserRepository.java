package com.minglers.minglespace.auth.repository;

import com.minglers.minglespace.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Long> {
}
