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
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URLConnection;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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
    File tempFolder = new File(uploadPath);

    if (!tempFolder.exists()){
      boolean folderCreated = tempFolder.mkdirs();
      if (folderCreated){
        System.out.println("upload folder created at: "+ tempFolder.getAbsolutePath());
      }else{
        System.out.println("failed to create upload folder at: "+tempFolder.getAbsolutePath());
      }
    }

    //이미지 폴더 생성
    File imagesFolder = new File(uploadPath + File.separator + "images");
    if(!imagesFolder.exists()){
      boolean folderCreated = imagesFolder.mkdirs();
      if(folderCreated){
        log.info("images folder created at: ", imagesFolder.getAbsolutePath());
      }else{
        log.error("failed to create images folder at: " + imagesFolder.getAbsolutePath());
      }
    }

    System.out.println("upload path: "+ tempFolder.getAbsolutePath());
    uploadPath = tempFolder.getAbsolutePath();
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


  //여러 파일 처리 - test 필요
  @Override
  public List<Image> uploadImages(List<MultipartFile> files) throws IOException{
    List<Image> imageList = new ArrayList<>();

    for (MultipartFile file : files){
      imageList.add(uploadImage(file));
    }

    return imageList;
  }

  // 서버에 저장할 파일 이름 (중복 방지)
  public static String UPDATED_NAME(String originalName){
    return  System.currentTimeMillis() + "_" + originalName;
  }
  // 파일 저장 경로
  public static String LOCAL_PATH(String uploadPath, String updatedName){
    return uploadPath + File.separator + "images" + File.separator + updatedName;
  }
  // 클라이언트에서 파일을 불러올 때 URI 경로
  public static String URI_PATH(String updatedName){
    return "/upload/images/" + updatedName;
  }

  // URL로부터 이미지를 다운로드하여 저장
  public Image uploadImageFromUrl(String imageUrl) throws IOException, InterruptedException {

    // 이미지 파일 이름 추출 (URL에서 파일명만 추출)
    String originalName = StringUtils.getFilename(imageUrl);
    String updatedName  = UPDATED_NAME(originalName);
    String localPath    = LOCAL_PATH(uploadPath, updatedName);
    String uriPath      = URI_PATH(updatedName);

    log.info("originalName : " + originalName);
    log.info("updatedName: " + updatedName);
    log.info("localPath: " + localPath);
    log.info("uriPath: " + uriPath);

    // URL에서 이미지를 다운로드하여 로컬 파일로 저장
    downloadImage(imageUrl, localPath);

    // Image 엔티티 생성
    Image image = new Image();
    image.setOriginalname(originalName);
    image.setUpdatename(updatedName);
    image.setLocalpath(localPath);
    image.setUripath(uriPath);

    // 이미지 정보를 DB에 저장
    return imageRepository.save(image);
  }

  // URL에서 이미지를 다운로드하는 메서드
  private void downloadImage(String imageUrl, String localPath) throws IOException, InterruptedException {
    // HTTP 클라이언트 사용하여 이미지 다운로드
    HttpClient client = HttpClient.newHttpClient();
    HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(imageUrl))
            .build();
    HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());

    // 다운로드 받은 이미지를 로컬 파일로 저장
    InputStream inputStream = response.body();
    Path targetPath = Path.of(localPath);
    Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
    inputStream.close();
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
  public Resource getImage(String imageName) throws IOException {
    String decodedImageName = URLDecoder.decode(imageName, StandardCharsets.UTF_8);

    Path path = Paths.get(uploadPath + File.separator + "images" + File.separator + decodedImageName);
    return new UrlResource(path.toUri());
  }

  @Override
  public String getMimeType(String imageName) {
    return URLConnection.guessContentTypeFromName(imageName) != null ?
            URLConnection.guessContentTypeFromName(imageName) : "application/octet-stream";
  }
}
