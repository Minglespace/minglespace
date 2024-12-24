
class Repo{

  static ACCESS_TOKEN = "accessToken";
  static USER_ROLE = "role";
  static USER_ID = "userId";

  static setItem(data){

    this.setRole(data.role);
    this.setUserId(data.id);
    this.setWithdrawalType(data.withdrawalType);
    
  }

  static clearItem(){

    localStorage.removeItem(this.ACCESS_TOKEN);
    localStorage.removeItem(this.USER_ROLE);
    localStorage.removeItem(this.USER_ID);

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

  static getAccessToken(){
    return localStorage.getItem(this.ACCESS_TOKEN);
  }

  static getRole(){
    return localStorage.getItem(this.USER_ROLE);
  }

  static getUserId(){
    return localStorage.getItem(this.USER_ID);
  }

  static isAuthenticated() {
    const accessToken = this.getAccessToken();
    return !!accessToken;
  }

  static isWithdrawalABLE() {
    const withdrawalType = this.getWithdrawalType();
    return withdrawalType === "ABLE";
  }

  static setWithdrawalType(withdrawalType){
    
    console.log("setWithdrawalType : ", withdrawalType);

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