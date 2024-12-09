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
@RequestMapping("/images")
public class ImageController {
    private final ImageService imageService;

    //클라이언트에서 통하는 이미지 경로.
    //고민 > chatRoom, user, message에 활용되는 메시지를 구분하려면 service에서 저장할 때 uripath 처리를 수정해야함
    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/{imageName}")
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
//        try {
//            //url 디코딩 처리
//            String decodedImageName = URLDecoder.decode(imageName, "UTF-8");
//
//            // 파일이 저장된 경로
//            Path path = Paths.get("upload/" + decodedImageName);
//            // 이미지 파일 로드
//            Resource resource = new UrlResource(path.toUri());
//
//            //파일 MIME 타입 추측
//            String mimeType = URLConnection.guessContentTypeFromName(imageName);
//
//            if (mimeType == null) {
//                // MIME 타입이 추측되지 않으면 기본 이미지 MIME 타입을 사용
//                mimeType = "application/octet-stream";
//            }
//
//            if (resource.exists() || resource.isReadable()) {
//                return ResponseEntity.ok()
//                        .contentType(MediaType.parseMediaType(mimeType)) // 또는 적절한 이미지 타입으로 설정
//                        .body(resource);
//            } else {
//                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
//            }
//        } catch (MalformedURLException | UnsupportedEncodingException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
    }
}
