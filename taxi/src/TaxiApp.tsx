import {SafeAreaView, StyleSheet, Text, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import messaging from "@react-native-firebase/messaging"
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

import Intro from './Intro';
import Login from './Login';
import Register from './Register';
import Main from './Main';
import NickName from './Main_Setting_NickName';

messaging().setBackgroundMessageHandler(async remoteMessage=>{
  console.log('[Background Remote Message]',remoteMessage)
})

function TaxiApp() : JSX.Element {
  console.log('test');
  
  const Stack= createStackNavigator();

  const getFcmToken = async()=>{
    const fcmToken = await messaging().getToken()
    await AsyncStorage.setItem("fcmToken",fcmToken)
    console.log(">> fcmToken = "+fcmToken)
  }
  useEffect(()=>{
    getFcmToken()
    messaging().onMessage(remoteMessage=>{
      console.log('[Remote Message]' , JSON.stringify(remoteMessage))

      let title=""
      let body=""

      if(remoteMessage.notification&& remoteMessage.notification.title){
        title=remoteMessage.notification.title
      }

      if(remoteMessage.notification&& remoteMessage.notification.body){
        body=remoteMessage.notification.body
      }

      if(remoteMessage){
        Alert.alert(title,body,[{text:'확인',style:'cancel'}])
      }

    })
  })

  return(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name='Intro' component={Intro}
        options={{headerShown:false}} />
        <Stack.Screen name='Login' component={Login}
        options={{headerShown:false}} />
        <Stack.Screen name='Register' component={Register}
        options={{headerShown:true , title:'회원가입'}}/>
        <Stack.Screen name='Main' component={Main}
        options={{headerShown:false}} />
        <Stack.Screen name='NickName' component={NickName}
        options={{headerShown:false}} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  text:{
    fontSize:18,
    color: 'black'
  },
  textB:{
    fontSize:15,
    color: 'blue'
  }
})

export default TaxiApp;