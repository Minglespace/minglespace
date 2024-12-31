package com.minglers.minglespace.common.controller;

import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.service.ImageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/upload")
public class ImageController {
  private final ImageService imageService;

  //클라이언트에서 통하는 이미지 경로.
  @GetMapping({"/images/{fileName}", "/files/{fileName}"})
  public ResponseEntity<Resource> getImage(@PathVariable String fileName, HttpServletRequest request) {
    String requestURI = request.getRequestURI();
    String directory = requestURI.contains("/images/") ? "images" : "files";
    try {
      Resource resource = imageService.getFile(fileName, directory);

      if (resource.exists() || resource.isReadable()) {
        String mimeType = imageService.getMimeType(fileName);
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


  //파일 저장
  @PostMapping("/files")
  public ResponseEntity<Map<String, List<Long>>>uploadFile(@RequestPart("files") List<MultipartFile> files) throws IOException{
    List<Image> savedFiles = imageService.uploadChatFiles(files);
    List<Long> imageIds = savedFiles.stream().map(Image::getId).toList();
    Map<String, List<Long>> res = new HashMap<>();
    res.put("imageIds", imageIds);
    return ResponseEntity.ok(res);
  }
}
