package com.minglers.minglespace.common.controller;

import com.minglers.minglespace.common.service.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/upload")
public class ImageController {
  private final ImageService imageService;

  //클라이언트에서 통하는 이미지 경로.
  //고민 > chatRoom, user, message에 활용되는 메시지를 구분하려면 service에서 저장할 때 uripath 처리를 수정해야함
  @CrossOrigin(origins = "http://localhost:3000")
  @GetMapping("/images/{imageName}")
  public ResponseEntity<Resource> getImage(@PathVariable String imageName) {
    try {
      Resource resource = imageService.getImage(imageName);

      if (resource.exists() || resource.isReadable()) {
        String mimeType = imageService.getMimeType(imageName);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType)) // 또는 적절한 이미지 타입으로 설정
                .body(resource);
      } else {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
      }
    } catch (IOException e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }

  }
}
