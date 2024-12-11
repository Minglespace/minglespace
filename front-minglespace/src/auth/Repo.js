
class Repo{

  static ACCESS_TOKEN = "accessToken";
  static REFRESH_TOKEN = "refreshToken";
  static USER_ROLE = "role";
  static USER_ID = "userId";

  static setItem(data){
    this.setAccessToken(data.accessToken);
    this.setRefreshToken(data.refreshToken);
    this.setRole(data.role);
    this.setUserId(data.id);


    this.setAccessTokenForAbuse(data.accessToken);
    this.setRefreshTokenForAbuse(data.refreshToken);
    

  }

  static clearItem(){

    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
    localStorage.removeItem(this.USER_ROLE);
    localStorage.removeItem(this.USER_ID);

  }

  static setAccessToken(accessToken){
    if(accessToken)
      localStorage.setItem(this.ACCESS_TOKEN, accessToken)
  }
  
  static setRefreshToken(refreshToken){
    if(refreshToken)
      localStorage.setItem(this.REFRESH_TOKEN, refreshToken)
  }
  
  static setRole(role){
    if(role)
      localStorage.setItem(this.USER_ROLE, role)
  }
  
  static setUserId(userId){
    if(userId)
      localStorage.setItem(this.USER_ID, userId)
  }

  static getAccessToken(){
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  static getRefreshToken(){
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  static getRole(){
    return localStorage.getItem(this.USER_ROLE);
  }

  static getUserId(){
    return localStorage.getItem(this.USER_ID);
  }


  // 인증 체크
  static isAuthenticated() {
    const accessToken = this.getAccessToken();
    return !!accessToken;
  }

  // 관리자 체크
  static isAdmin() {
    const role = this.getRole();
    return this.isAuthenticated() && role === "ADMIN";
  }

  // 사용자 체크
  static isUser() {
    const role = this.getRole();
    return this.isAuthenticated() && role === "USER";
  }

  //
  static setProfileColor(color){
    if(color){
      localStorage.setItem("profileColor", color);
    }
  }

  static getProfileColor() {
    return localStorage.getItem("profileColor");
  }

  static clearProfileColor(){
    localStorage.removeItem("profileColor");
  }


  // for test
  static setAccessTokenForAbuse(accessToken){
    if(accessToken)
      localStorage.setItem("accessToken_for_abuse", accessToken)
  }
  
  static setRefreshTokenForAbuse(refreshToken){
    if(refreshToken)
      localStorage.setItem("refreshToken_for_abuse", refreshToken)
  }
  
  static getAccessTokenForAbuse(){
    return localStorage.getItem("accessToken_for_abuse");
  }

  static getRefreshTokenForAbuse(){
    return localStorage.getItem("refreshToken_for_abuse");
  }

};

export default Repo;