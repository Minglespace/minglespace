package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.*;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.AuthException;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.auth.type.Provider;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.util.CookieManager;
import com.minglers.minglespace.workspace.entity.WSMember;
import com.minglers.minglespace.workspace.entity.WorkspaceInvite;
import com.minglers.minglespace.workspace.repository.WSMemberRepository;
import com.minglers.minglespace.workspace.repository.WorkspaceInviteRepository;
import com.minglers.minglespace.workspace.repository.WorkspaceRepository;
import com.minglers.minglespace.workspace.role.WSMemberRole;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.hibernate.PropertyValueException;
import org.modelmapper.ModelMapper;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.Optional;

@Log4j2
@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository usersRepo;
  private final JWTUtils jwtUtils;
  private final AuthenticationManager authenticationManager;
  private final PasswordEncoder passwordEncoder;
  private final ModelMapper modelMapper;
  private final WorkspaceInviteRepository workspaceInviteRepository;
  private final WSMemberRepository wsMemberRepository;

  public DefaultResponse signup(SignupRequest req) {
    try {
      // 이메일 중복 확인
      if (usersRepo.existsByEmail(req.getEmail())) {
        return new DefaultResponse().setStatus(AuthStatus.AlreadyJoinedEmail);
      }else{
        User user = new User();

        // 회원 가입 세팅
        modelMapper.map(req, user);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(req.getRole());
        user.setProvider(Provider.MINGLESPACE);

        // 디비 저장
        User userResult = usersRepo.save(user);

        // 만약 초대받아서 회원가입할경우 ws멤버에도 저장
        if(req.isInviteWorkspace()){
          Optional<WorkspaceInvite> workspaceInvite = workspaceInviteRepository.findByEmail(userResult.getEmail());
          workspaceInvite.ifPresent(invite -> wsMemberRepository.save(WSMember.builder()
                  .workSpace(invite.getWorkSpace())
                  .role(WSMemberRole.MEMBER)
                  .user(userResult)
                  .build()));
        }

        if (userResult.getId() > 0) {
          return new DefaultResponse().setStatus(AuthStatus.Ok);
        }else{
          return new DefaultResponse().setStatus(AuthStatus.DbInsertError);
        }
      }
    }catch (DataIntegrityViolationException e) {
      if (e.getCause() instanceof PropertyValueException cause) { // 데이터 무결성 위반 예외 처리 (예: not-null 필드가 null인 경우)
        String message = cause.getMessage();
        if (message != null && message.contains("not-null property references a null or transient value")) {
          String fieldName = message.substring(message.lastIndexOf('.') + 1);
          return new DefaultResponse().setStatus(AuthStatus.NullProperty, fieldName);
        } else {
          return new DefaultResponse().setStatus(AuthStatus.DbError);// 그 외 데이터 무결성 위반 예외 처리
        }
      } else {
        return new DefaultResponse().setStatus(AuthStatus.DbDataIntegrityViolation);// DataIntegrityViolationException 발생 시 다른 경우 처리
      }
    } catch (Exception e) {
      log.info("signup : {}", e);
      return new DefaultResponse().setStatus(AuthStatus.Exception);
    }
  }

  public LoginResponse login(LoginRequest req, HttpServletResponse response) {

    LoginResponse res = new LoginResponse();

    try {

      // 유저 정보
      Optional<User> userOpt = usersRepo.findByEmail(req.getEmail());
      if(!userOpt.isPresent()){
        res.setStatus(AuthStatus.NotFoundAccount);
        return res;
      }

      User user = userOpt.get();

      if(user.isSocialProvider()){
        res.setStatus(AuthStatus.AlreadyJoinedEmail);
        return res;
      }

      // 인증 시도
      authenticationManager.authenticate(
              new UsernamePasswordAuthenticationToken(
                      req.getEmail(),
                      req.getPassword())
      );


      String verificationCode = user.getVerificationCode();
      if( verificationCode == null || verificationCode.isEmpty()){
        // 토큰 생성
        String accessToken = jwtUtils.geneTokenAccess(user);
        String refreshToken = jwtUtils.geneTokenRefresh(user);

        // 응답 세팅
        modelMapper.map(user, res);

        // accessToken은 헤더에 넣어 준다.
        response.setHeader("Authorization", "Bearer " + accessToken);

        // refreshToken은 cookie에 넣어 준다.
        CookieManager.add(JWTUtils.REFRESH_TOKEN, refreshToken, JWTUtils.EXPIRATION_REFRESH, response);

        res.setStatus(AuthStatus.Ok, accessToken);
      }else{
        res.setStatus(AuthStatus.EmailVerificationFirst);
      }
    } catch (InternalAuthenticationServiceException e) {
      if (e.getCause() instanceof NoSuchElementException) {
        res.setStatus(AuthStatus.NotFoundAccount);// 사용자가 존재하지 않는 경우
      } else {
        res.setStatus(AuthStatus.AuthInternalError);// 인증 서비스 내부 오류
      }
    } catch (BadCredentialsException e) {
      res.setStatus(AuthStatus.MismatchPw); // 잘못된 자격 증명 (비밀번호 틀림)
    } catch (Exception e) {
      res.setStatus(AuthStatus.Exception);
    }

    return res;
  }

  public DefaultResponse deleteUser(Long userId) {

    DefaultResponse res = new DefaultResponse();

    try {
      Optional<User> opt = usersRepo.findById(userId);

      if (opt.isPresent()) {
        usersRepo.deleteById(userId);
        res.setStatus(AuthStatus.Ok);
      } else {
        res.setStatus(AuthStatus.NotFoundAccount);
      }
    } catch (Exception e) {
      res.setStatus(AuthStatus.Exception);
    }

    return res;
  }

  public UserResponse updateUser(User updateUser, Image image, boolean dontUse) {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    User user = (User) authentication.getPrincipal();

    Long userId = user.getId();

    return updateUser(userId, updateUser, image,dontUse);
  }

  public UserResponse updateUser(Long userId, User updateUser, Image image, boolean dontUse) {

    UserResponse res = new UserResponse();

    try {
      Optional<User> userOptional = usersRepo.findById(userId);

      if (userOptional.isPresent()) {
        User existingUser = userOptional.get();

        existingUser.change(modelMapper, image, passwordEncoder, updateUser, dontUse);

        User savedUser = usersRepo.save(existingUser);

        res.map(modelMapper, savedUser);

        res.setStatus(AuthStatus.Ok);
      } else {
        res.setStatus(AuthStatus.NotFoundAccount);
      }
    } catch (Exception e) {
      res.setStatus(AuthStatus.Exception);
    }

    return res;
  }

  public User getUserById(Long id) {

    Optional<User> opt = usersRepo.findById(id);

    try {
      if (opt.isPresent()) {
        return opt.get();
      } else {
        log.info("[MIRO] getUserById : ", AuthStatus.NotFoundAccount);
        return null;
      }
    }catch (Exception e){
      log.info("[MIRO] getUserById 에외 : ", AuthStatus.Exception);
      return null;
    }
  }

  public User getUserByEmail(String email) {

    Optional<User> opt = usersRepo.findByEmail(email);

    try {
      if (opt.isPresent()) {
        return opt.get();
      } else {
        log.info("[MIRO] getUserByEmail : ", AuthStatus.NotFoundAccount);
        return null;
      }
    }catch (Exception e){
      log.info("[MIRO] getUserByEmail 에외 : ", AuthStatus.Exception);
      return null;
    }
  }
}
