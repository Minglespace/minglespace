package com.minglers.minglespace.common.service;

import com.minglers.minglespace.auth.dto.DefaultResponse;
import com.minglers.minglespace.auth.dto.LoginRequest;
import com.minglers.minglespace.auth.dto.LoginResponse;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.NoSuchElementException;
import java.util.UUID;

@Log4j2
@RequiredArgsConstructor
@Service
public class AuthEmailService {

  private final JavaMailSender mailSender;
  private final UserRepository usersRepo;

  @Value("${spring.mail.username}")
  private String fromEmail;

  public void sendEmail(String code, String to, HttpServletRequest request) {

    // 이메일 인증 내용
    String subject = "이메일 인증";
    String confirmationUrl = getBaseUrl(request) + "/auth/confirm?code=" + code;
    String emailContent = "이메일 인증을 완료하려면 아래 링크를 클릭하세요:\n" + confirmationUrl;

    // 이메일 인증 링크 발송
    SimpleMailMessage message = new SimpleMailMessage();

    message.setFrom(fromEmail);
    message.setTo(to);
    message.setSubject(subject);
    message.setText(emailContent);

    mailSender.send(message);
  }


  private String getBaseUrl(HttpServletRequest request) {

    String url = "";

    // 서버를 합쳤을 경우에 주소를 서버쪽으로 사용한다.
    boolean isOneServer = false;
    if(isOneServer){
      String scheme = request.getScheme();
      String serverName = request.getServerName();
      int serverPort = request.getServerPort();
      url = scheme + "://" + serverName + ":" + serverPort;  // http://localhost:8080
    }else{
      url = "http://localhost:3000";
      //url = "http://localhost:3001";
    }

    log.info("getBaseUrl : {}", url);

    return url;
  }



  public DefaultResponse confirm(String code, String email) {

    DefaultResponse res = new DefaultResponse();

    try {

      // 유저 정보
      User user = usersRepo.findByEmail(email).orElseThrow();

      if(user.getVerificationCode().equals(email)){
        res.setStatus(HttpStatus.OK);
        res.setMsg("유저 이메일 인증 성공 : " + user.getEmail());
      }else{
        res.setStatus(HttpStatus.NOT_FOUND);
        res.setMsg("유저 이메일 인증 실패 : " + user.getEmail());
      }

      user.setVerificationCode("");
      usersRepo.save(user);
      
    } catch (Exception e) {
      res.setStatus(HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
      res.setMsg("서버 오류");
    }



    log.info("");
    log.info("");
    log.info("confirm");
    log.info(res.toString());
    log.info("");
    log.info("");

    return res;

  }

}




