import {SafeAreaView, StyleSheet, Text, View, TextInput ,TouchableOpacity, Alert} from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState, useEffect } from "react";

const NickName =() =>{
  const [nickName,setNickName]=useState('')
  const [inputnickName,setInputNickName]=useState('')
  
  useEffect(()=>{
    const loadNickName =async()=>{
      try{
        const storedNickName = await AsyncStorage.getItem('nickName')

        if(storedNickName !== null){
          setNickName(storedNickName)
        }
      }
      catch(e){
        console.error('Failed to load nickname',e)
      }
    }
    loadNickName()
  })
  
  const saveNickName = async()=>{
    if(inputnickName === ''){
      Alert.alert('오류','닉네임을 입력해주세요')
      return
    }

    try{
      await AsyncStorage.setItem('nickName',inputnickName)
      setNickName(inputnickName)
      Alert.alert('성공','닉네임이 저장되었습니다')
    }
    catch(e){
      console.error('Failed to seave nickname',e)
      Alert.alert('오류','닉네임 저장에 실패했습니다')
    }
  }


  return(
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <TextInput style={styles.input} placeholder="닉네임 입력"
        value={inputnickName}
        onChangeText={(newNickName)=>setInputNickName(newNickName)}/>
        <TouchableOpacity style={styles.button} onPress={saveNickName}>
          <Text style={styles.buttonText}>저장하기</Text>
        </TouchableOpacity>
        <Text style={styles.Text}>
          {nickName? `현재 닉네임: ${nickName}`:'닉네임이 설정되지 않았습니다'}
        </Text>
      </View>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent:'center',
    alignItems: 'center',
    width:'100%'
  },
  button:{
    backgroundColor:'#3498db',
    paddingVertical: 10,
    paddingHorizontal:20,
    borderRadius:5,
  },
  buttonDisable:{
    backgroundColor:'gray',
    paddingVertical: 10,
    paddingHorizontal:20,
    borderRadius:5,
  },
  buttonText:{
    color: 'white',
    fontSize:16,
    textAlign:'center'
  },
  Text:{
    color: 'black',
    fontSize:16,
    textAlign:'center'
  },
  input:{
    height: 40,
    borderWidth:2,
    borderColor: 'gray',
    marginVertical:1,
    padding:10
  }
})

export default NickName;