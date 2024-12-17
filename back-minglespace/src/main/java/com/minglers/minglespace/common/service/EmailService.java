package com.minglers.minglespace.common.service;

import com.minglers.minglespace.common.util.MsConfig;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Log4j2
@RequiredArgsConstructor
@Service
public class EmailService {

    protected final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;


    public void send(String to, String subject, String emailContent) throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        try {
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(emailContent, true);  // true로 설정하여 HTML로 전송

            mailSender.send(message);
        } catch (MessagingException e) {
            log.error("MessagingException : {}", e);
            e.printStackTrace();
        }
    }


    protected String getBaseUrl(HttpServletRequest request) {

        String url = "";

        // 서버를 합쳤을 경우에 주소를 서버쪽으로 사용한다.
        boolean isOneServer = false;
        if(isOneServer){
            String scheme = request.getScheme();
            String serverName = request.getServerName();
            int serverPort = request.getServerPort();
            url = scheme + "://" + serverName + ":" + serverPort;  // http://localhost:8080
        }else{
            url = MsConfig.getClientUrl();
        }

        return url;
    }


}
