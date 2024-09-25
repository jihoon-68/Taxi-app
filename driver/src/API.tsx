import axios from "axios";

const instance = axios.create({
  baseURL: 'http://172.30.1.32:3000',
  timeout: 10000,
})

export default {
  
  login(id:string, pw:string,fcmToken:string){
    return instance.post('/driver/login',{driverId:id,driverPw:pw,fcmToken:fcmToken})
  },

  register(id:string, pw:string,fcmToken:string){
    return instance.post('/driver/register',{driverId:id,driverPw:pw,fcmToken:fcmToken})
  },

  list(id:string){
    return instance.post('/driver/list',{driverId:id})
  },
  accept(driverId:string, callId:string, userId:string){
    return instance.post('/driver/accept',{driverId:driverId, callId:callId,userId:userId})
  } 

}