
class Repo{

  static ACCESS_TOKEN = "accessToken";
  static REFRESH_TOKEN = "refreshToken";
  static USER_ROLE = "role";
  static USER_ID = "userId";

  static setItem(data){

    this.setRole(data.role);
    this.setUserId(data.id);
    
  }

  static clearItem(){

    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.USER_ROLE);
    localStorage.removeItem(this.USER_ID);

  }

  static setAccessToken(accessToken){
    if(accessToken)
      localStorage.setItem(this.ACCESS_TOKEN, accessToken)
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


};

export default Repo;