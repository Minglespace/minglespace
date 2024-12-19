package com.minglers.minglespace.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.minglers.minglespace.auth.type.Provider;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.workspace.entity.WSMember;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY)
  private Image image;

  @OneToMany(mappedBy = "user", fetch =FetchType.LAZY)
  private List<WSMember> wsMembers;

  @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
  private List<UserFriend> userFriends;

  @Column(nullable = false)
  private String role;

  @CreationTimestamp
  private LocalDateTime regDate;

  private boolean deleteFlag;

  private String verificationCode;

  @Enumerated(EnumType.STRING)
  private Provider provider;

  //=============================================================
  // 유저 입력 필드
  @Column(unique = true)
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

  //=============================================================

  public boolean isMingleSpaceProvider(){
    return (this.getProvider() == Provider.MINGLESPACE);
  }

  //=============================================================

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
