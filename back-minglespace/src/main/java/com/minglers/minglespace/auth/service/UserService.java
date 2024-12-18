package com.minglers.minglespace.auth.service;

import com.minglers.minglespace.auth.dto.*;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.exception.AuthException;
import com.minglers.minglespace.auth.repository.UserRepository;
import com.minglers.minglespace.auth.security.JWTUtils;
import com.minglers.minglespace.common.apitype.MsStatus;
import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.util.CookieManager;
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

  public DefaultResponse signup(SignupRequest req) {
    try {
      // 이메일 중복 확인
      if (usersRepo.existsByEmail(req.getEmail())) {
        return new DefaultResponse().setStatus(MsStatus.AlreadyJoinedEmail);
      }else{
        User user = new User();

        // 회원 가입 세팅
        modelMapper.map(req, user);
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setRole(req.getRole());
        user.setProvider("minglespace");

        // 디비 저장
        User userResult = usersRepo.save(user);

        if (userResult.getId() > 0) {
          return new DefaultResponse().setStatus(MsStatus.Ok);
        }else{
          return new DefaultResponse().setStatus(MsStatus.DbInsertError);
        }
      }
    }catch (DataIntegrityViolationException e) {
      if (e.getCause() instanceof PropertyValueException cause) { // 데이터 무결성 위반 예외 처리 (예: not-null 필드가 null인 경우)
        String message = cause.getMessage();
        if (message != null && message.contains("not-null property references a null or transient value")) {
          String fieldName = message.substring(message.lastIndexOf('.') + 1);
          return new DefaultResponse().setStatus(MsStatus.NullProperty, fieldName);
        } else {
          return new DefaultResponse().setStatus(MsStatus.DbError);// 그 외 데이터 무결성 위반 예외 처리
        }
      } else {
        return new DefaultResponse().setStatus(MsStatus.DbDataIntegrityViolation);// DataIntegrityViolationException 발생 시 다른 경우 처리
      }
    } catch (Exception e) {
      return new DefaultResponse().setStatus(MsStatus.Exception);
    }
  }

  public LoginResponse login(LoginRequest req, HttpServletResponse response) {

    LoginResponse res = new LoginResponse();

    try {

      // 인증 시도
      authenticationManager.authenticate(
              new UsernamePasswordAuthenticationToken(
                      req.getEmail(),
                      req.getPassword())
      );

      // 유저 정보
      User user = usersRepo.findByEmail(req.getEmail()).orElseThrow();

      if(user.getVerificationCode().isEmpty()){
        // 토큰 생성
        String accessToken = jwtUtils.geneTokenAccess(user);
        String refreshToken = jwtUtils.geneTokenRefresh(user);

        // 응답 세팅
        modelMapper.map(user, res);

        // accessToken은 헤더에 넣어 준다.
        response.setHeader("Authorization", "Bearer " + accessToken);

        // refreshToken은 cookie에 넣어 준다.
        CookieManager.add(JWTUtils.REFRESH_TOKEN, refreshToken, JWTUtils.EXPIRATION_REFRESH, response);

        res.setStatus(MsStatus.Ok, accessToken);
      }else{
        res.setStatus(MsStatus.EmailVerificationFirst);
      }
    } catch (InternalAuthenticationServiceException e) {
      if (e.getCause() instanceof NoSuchElementException) {
        res.setStatus(MsStatus.NotFoundAccount);// 사용자가 존재하지 않는 경우
      } else {
        res.setStatus(MsStatus.AuthInternalError);// 인증 서비스 내부 오류
      }
    } catch (BadCredentialsException e) {
      res.setStatus(MsStatus.MismatchPw); // 잘못된 자격 증명 (비밀번호 틀림)
    } catch (Exception e) {
      res.setStatus(MsStatus.Exception);
    }

    return res;
  }

  public DefaultResponse deleteUser(Long userId) {

    DefaultResponse res = new DefaultResponse();

    try {
      Optional<User> opt = usersRepo.findById(userId);

      if (opt.isPresent()) {
        usersRepo.deleteById(userId);
        res.setStatus(MsStatus.Ok);
      } else {
        res.setStatus(MsStatus.NotFoundAccount);
      }
    } catch (Exception e) {
      res.setStatus(MsStatus.Exception);
    }

    return res;
  }

  public UserResponse updateUser(User updateUser, Image image) {

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    User user = (User) authentication.getPrincipal();

    Long userId = user.getId();

    return updateUser(userId, updateUser, image);
  }

  public UserResponse updateUser(Long userId, User updateUser, Image image) {

    UserResponse res = new UserResponse();

    try {
      Optional<User> userOptional = usersRepo.findById(userId);

      if (userOptional.isPresent()) {
        User existingUser = userOptional.get();

        modelMapper.map(updateUser, existingUser);

        if (updateUser.getPassword() != null && !updateUser.getPassword().isEmpty()) {
          existingUser.setPassword(passwordEncoder.encode(updateUser.getPassword()));
        }

        existingUser.setImage(image);

        User savedUser = usersRepo.save(existingUser);

        modelMapper.map(savedUser, res);

        res.setStatus(MsStatus.Ok);
      } else {
        res.setStatus(MsStatus.NotFoundAccount);
      }
    } catch (Exception e) {
      res.setStatus(MsStatus.Exception);
    }

    return res;
  }

  public User getUserById(Long id) {

    Optional<User> opt = usersRepo.findById(id);

    try {
      if (opt.isPresent()) {
        return opt.get();
      } else {
        throw new AuthException(HttpStatus.NOT_FOUND.value(), "유저를 찾을 수 없습니다");
      }
    }catch (Exception e){
      throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "예외 : 유저를 찾을 수 없습니다");
    }
  }

  public User getUserByEmail(String email) {

    Optional<User> opt = usersRepo.findByEmail(email);

    try {
      if (opt.isPresent()) {
        return opt.get();
      } else {
        throw new AuthException(HttpStatus.NOT_FOUND.value(), "유저를 찾을 수 없습니다");
      }
    }catch (Exception e){
      throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR.value(), "예외 : 유저를 찾을 수 없습니다");
    }
  }

//    public UserResponse getUserById(Long id) {
//
//        UserResponse res = getUserResponse(usersRepo.findById(id));
//
//        log.info("");
//        log.info("");
//        log.info("getUserById");
//        log.info(res.toString());
//        log.info("");
//        log.info("");
//
//        return res;
//    }
//
//    public UserResponse getUserByEmail(String email) {
//
//        UserResponse res = getUserResponse(usersRepo.findByEmail(email));
//
//        log.info("");
//        log.info("");
//        log.info("getUserByEmail");
//        log.info(res.toString());
//        log.info("");
//        log.info("");
//
//        return res;
//    }

//    private UserResponse getUserResponse (Optional<User> optionalUser){
//
//        UserResponse res = new UserResponse();
//
//        try {
//
//            if (optionalUser.isPresent()) {
//
//                modelMapper.map(optionalUser.get(), res);
//
//                res.setStatus(HttpStatus.OK);
//                res.setMsg("유저 찾기 성공: " + res.getEmail());
//            } else {
//                res.setStatus(HttpStatus.NOT_FOUND);
//            }
//        }catch (Exception e){
//            res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR);
//        }
//
//        return res;
//    }
}
