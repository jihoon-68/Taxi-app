import {SafeAreaView, StyleSheet, Text, TouchableOpacity} from 'react-native';
import { useNavigation,ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/FontAwesome'
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';


function Intro() : JSX.Element {
  console.log('Intro');

  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

  useFocusEffect(React.useCallback(()=>{
    setTimeout(async ()=>{
      
      let userId = await AsyncStorage.getItem('userId')
      
      let isAytoLogin = userId? true:false;

      if(isAytoLogin){
        navigation.push('Main');
      }else{
        navigation.push('Login');
      }
    },2000)
  },[]))

  return(
    <SafeAreaView style={styles.container}>
      <Icon name='drivers-license' size={100} color={'#3498db'}/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent:'center',
    alignItems: 'center'
  }
})

export default Intro;