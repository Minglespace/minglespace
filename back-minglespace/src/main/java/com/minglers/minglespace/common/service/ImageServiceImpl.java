package com.minglers.minglespace.common.service;

import com.minglers.minglespace.common.entity.Image;
import com.minglers.minglespace.common.repository.ImageRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Log4j2
public class ImageServiceImpl implements ImageService{
  private final ImageRepository imageRepository;

  @Value("${org.zerock.upload.path}")
  private String uploadPath;

  //폴더 없으면 생성
  @PostConstruct
  public void init(){
    File uploadFolder = new File(uploadPath);

    File imagesFolder = new File(uploadPath + File.separator + "images");
    File filesFolder = new File(uploadPath + File.separator + "files");

    if (!imagesFolder.exists() && imagesFolder.mkdirs()) {
      log.info("images folder created at: " + imagesFolder.getAbsolutePath());
    } else if (!imagesFolder.exists()) {
      log.error("failed to create images folder at: " + imagesFolder.getAbsolutePath());
    }

    if (!filesFolder.exists() && filesFolder.mkdirs()) {
      log.info("files folder created at: " + filesFolder.getAbsolutePath());
    } else if (!filesFolder.exists()) {
      log.error("failed to create files folder at: " + filesFolder.getAbsolutePath());
    }

    System.out.println("upload path: "+ uploadFolder.getAbsolutePath());
    uploadPath = uploadFolder.getAbsolutePath();
  }

  //단일 파일 처리
  @Override
  public Image uploadImage(MultipartFile file) throws IOException {
    // 파일 이름
    String originalName = file.getOriginalFilename();
    log.info("uploadImage_originFilename: "+ originalName);

    // 서버에 저장할 파일 이름 _ 중복 방지
    String updatedName = System.currentTimeMillis() + "_" + originalName;
    log.info("uploadImage_renameFilename : "+ updatedName);

    // 파일 저장 경로
    String localPath = uploadPath + File.separator + "images" + File.separator + updatedName;
    String uriPath = "/upload/images/" + updatedName;  // 클라이언트에서 파일을 불러올 때 URI 경로

    // 로컬에 파일 저장
    File destFile = new File(localPath); //실제 저장할 파일 객체
    file.transferTo(destFile); //업로드 file에서 데이터 추출해 destFile에 저장

    // Image 엔티티 생성
    Image image = new Image();
    image.setOriginalname(originalName);
    image.setUpdatename(updatedName);
    image.setLocalpath(localPath);
    image.setUripath(uriPath);

    // 이미지 정보를 DB에 저장
    return imageRepository.save(image);
  }


  // 파일 조회 (Read)
  @Override
  public Image getImageById(Long id) {
    return imageRepository.findById(id).orElse(null);
  }

  // 파일 삭제 (Delete) - test 필요
  @Override
  public void deleteImage(Long id) {
    Image image = getImageById(id);
    if (image != null) {
      File file = new File(image.getLocalpath());
      if (file.exists()) {
        file.delete();
      }
      imageRepository.delete(image);
    }
  }

  @Override
  public Resource getFile(String fileName, String directory) throws IOException {
    String decodedImageName = URLDecoder.decode(fileName, StandardCharsets.UTF_8);

    Path path = Paths.get(uploadPath + File.separator + directory + File.separator + decodedImageName);
    return new UrlResource(path.toUri());
  }

  @Override
  public String getMimeType(String imageName) {
    return URLConnection.guessContentTypeFromName(imageName) != null ?
            URLConnection.guessContentTypeFromName(imageName) : "application/octet-stream";
  }

  @Override
  public Image uploadChatFile(MultipartFile file) throws IOException {
    String originalName = file.getOriginalFilename();
    String updatedName = System.currentTimeMillis() + "_" + originalName;
    String localPath = uploadPath + File.separator + "files" + File.separator + updatedName;
    String uriPath = "/upload/files/" + updatedName;

    File destFile = new File(localPath);
    file.transferTo(destFile);

    Image image = new Image();
    image.setOriginalname(originalName);
    image.setUpdatename(updatedName);
    image.setLocalpath(localPath);
    image.setUripath(uriPath);

    // 이미지 정보를 DB에 저장
    return imageRepository.save(image);
  }

  @Override
  public List<Image> uploadChatFiles(List<MultipartFile> files) throws IOException{
    List<Image> imageList = new ArrayList<>();
    for (MultipartFile file : files){
      imageList.add(uploadChatFile(file));
    }
    return imageList;
  }

}
