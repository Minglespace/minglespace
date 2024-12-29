
class Repo{

  static ACCESS_TOKEN = "accessToken";
  static USER_ROLE = "role";
  static USER_ID = "userId";
  static USER_NAME = "userName";

  static setItem(data){

    this.setRole(data.role);
    this.setUserId(data.id);
    this.setWithdrawalType(data.withdrawalType);
    
  }

  static clearItem(){

    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.USER_ROLE);
    localStorage.removeItem(this.USER_ID);
    localStorage.removeItem(this.USER_NAME);

    Repo.clearWithdrawalType();
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

  static setUserName(userName){
    if(userName)
      localStorage.setItem(this.USER_NAME, userName)
  }

  static getAccessToken(){
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  static getRole(){
    return localStorage.getItem(this.USER_ROLE);
  }

  static getUserId(){
    return localStorage.getItem(this.USER_ID);
  }

  static getUserName(){
    return localStorage.getItem(this.USER_NAME);
  }

  static isAuthenticated() {
    const accessToken = this.getAccessToken();
    return !!accessToken;
  }

  static setWithdrawalType(withdrawalType){
    if(withdrawalType){
      localStorage.setItem("WithdrawalType", withdrawalType);
    }
  }

  static getWithdrawalType() {
    return localStorage.getItem("WithdrawalType");
  }
  
  static clearWithdrawalType(){
    localStorage.removeItem("WithdrawalType");
  }

  static setProfileColor(color){
    if(color){
      localStorage.setItem(Repo.getUserName(), color);
    }
  }

  static getProfileColor() {
    return localStorage.getItem(Repo.getUserName());
  }

  static clearProfileColor(){
    localStorage.removeItem(Repo.getUserName());
  }


};

export default Repo;