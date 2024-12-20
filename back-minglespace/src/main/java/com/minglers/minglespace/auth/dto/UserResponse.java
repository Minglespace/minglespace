package com.minglers.minglespace.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.minglers.minglespace.auth.entity.User;
import com.minglers.minglespace.common.apistatus.AuthStatus;
import com.minglers.minglespace.common.entity.Image;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.modelmapper.ModelMapper;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@NoArgsConstructor
public class UserResponse extends DefaultResponse {

  Long id;
  String email;
  String name;
  String phone;
  String introduction;
  String position;
  String role;
  String profileImagePath;
  boolean socialLogin;

  public UserResponse(AuthStatus authStatus){
    super(authStatus);
  }

  public void map(ModelMapper modelMapper, User from){

    modelMapper.map(from, this);

    Image image = from.getImage();
    if(image != null){
      this.setProfileImagePath(image.getUripath());
    }

    this.setSocialLogin(from.isSocialProvider());
  }


}
