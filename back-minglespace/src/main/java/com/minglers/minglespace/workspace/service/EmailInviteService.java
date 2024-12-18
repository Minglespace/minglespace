package com.minglers.minglespace.workspace.service;

import com.minglers.minglespace.common.service.EmailService;
import jakarta.mail.MessagingException;
import lombok.extern.log4j.Log4j2;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Log4j2
@Service
public class EmailInviteService extends EmailService {


  public EmailInviteService(JavaMailSender mailSender) {
    super(mailSender);
  }

  @Async
  public CompletableFuture<String> sendEmail(String workspaceName,String url, String to){
    try {
      String subject = "You have been invited to Mingle Space Workspace";
      String emailContent ="<html>"
              + "<body style='font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333;'>"
              + "<div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border-radius: 8px;'>"
              + "<h2 style='color: #4CAF50;'>You have been invited to Mingle Space Workspace</h2>"
              + "<p>안녕하세요!<br> 밍글 스페이스 워크스페이스 <strong>"+workspaceName+"</strong>에 초대 되었습니다.</p>"
              + "<p> 아래 링크를 통하여 워크스페이스에 참여하세요!</p><br/>"
              + "<p><a href='" + url + "' style='color: #1E88E5;'><i>여기를 클릭하세요!</i></a></p>"
              + "<p style='margin-top: 30px;'>감사합니다,<br>Team Mingle Space</p>"
              + "</div>"
              + "</body>"
              + "</html>";;

      send(to,subject, emailContent);


    } catch (MessagingException | MailSendException e){
      log.error(e.getMessage());
      return CompletableFuture.completedFuture("fail");
    } catch (MailException e){
      log.error(e.getMessage());
      return CompletableFuture.completedFuture("fail");
    }

    return CompletableFuture.completedFuture("success");
  }
}
