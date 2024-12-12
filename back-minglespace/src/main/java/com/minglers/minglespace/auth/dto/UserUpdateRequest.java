package com.minglers.minglespace.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.minglers.minglespace.common.entity.Image;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserUpdateRequest {

  private String email;
  private String password;
  private String name;
  private String phone;
  private String position;
  private String introduction;
  private boolean dontUseProfileImage;

}
