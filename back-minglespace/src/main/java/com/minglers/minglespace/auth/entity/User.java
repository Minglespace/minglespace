package com.minglers.minglespace.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.workspace.entity.WSMember;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "user")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    private Image image;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<WSMember> wsMembers;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    private List<UserFriend> userFriends;

    @CreationTimestamp
    private LocalDateTime regDate;

    private boolean deleteFlag;

    private String verificationCode;

    @Column(nullable = false)
    private String role;
    //
    //=========================================================================
    // 회원가입창에서 유저가 입력하는 정보들
    @Column(unique = true, nullable = false)
    private String email;

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    private String position;

    private String introduction;
    //
    //=========================================================================
    //
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", email='" + email + '\'' +
//                ", image=" + image +
//                ", wsMembers=" + wsMembers +
//                ", userFriends=" + userFriends +
                ", password='" + password + '\'' +
                ", name='" + name + '\'' +
                ", phone='" + phone + '\'' +
                ", role='" + role + '\'' +
                ", regDate=" + regDate +
                ", position='" + position + '\'' +
                ", introduction='" + introduction + '\'' +
                ", deleteFlag=" + deleteFlag +
                ", verificationCode='" + verificationCode + '\'' +
                '}';
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }


}
