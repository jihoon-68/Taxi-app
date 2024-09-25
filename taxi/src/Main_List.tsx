import {SafeAreaView, StyleSheet, Text ,FlatList, View, RefreshControl, Modal,Alert} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useState ,useEffect} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './API'
import messaging from "@react-native-firebase/messaging"

function MainList() : JSX.Element {
  console.log('MainList');
  
  const [callList, setCallList] = useState([])
  const [loading, setLoading] = useState(false)
  
  useFocusEffect(React.useCallback(()=>{
    requestCallList()
  },[]))

  const requestCallList = async()=>{
    setLoading(true)
    let userId = await AsyncStorage.getItem('userId')||""

    api.list(userId)
    .then(res=>{
      let {code,message,data} =res.data[0]

      if(code == 0){
        setCallList(data)
      }else{
        Alert.alert('오류',message,[{
          text:'확인',
          onPress:()=> console.log('cancel pressed'),
          style:'cancel'
        }])
      }
      setLoading(false)
    })
    .catch(e=>{
      console.log(JSON.stringify(e))
      setLoading(false)
    })
    
  }

  
  const Header =()=>(
    <View style={styles.header}>
      <Text style={[styles.headerText,{width:wp(80)}]}>출발지 / 도착지</Text>
      <Text style={[styles.headerText,{width:wp(20)}]}>상태</Text>
    </View>
  )

  const ListItem =(row:any)=>{
    console.log("row = "+ JSON.stringify(row))

    return(
      <View style={{flexDirection:'row', marginBottom:5, width:wp(100)}}>
        <View style={{width:wp(80)}}>
          <Text style={styles.TextForm}>{row.item.start_addr}</Text>
          <Text style={[styles.TextForm, {borderTopWidth:0}]}>{row.item.end_addr}</Text>
          <Text style={styles.TextForm}>{row.item.formatted_time}</Text>
        </View>

        <View style={{width:wp(20),alignItems:'center',justifyContent:'center'}}>
          {row.item.call_state=="RES" ?
          (<Text style={{color:'blue'}}>{row.item.call_state}</Text>):
          (<Text style={{color:'gray'}}>{row.item.call_state}</Text>)}
        </View>
      </View>
    )
  }

  useEffect(()=>{
    const message = messaging().onMessage(remoteMessage=>{
      console.log("[Remote Message]" , JSON.stringify(remoteMessage))
      requestCallList()
    })
    return message
  })

  return(
    <SafeAreaView style={styles.continue}>
      <FlatList style={{flex:1}}
      data={callList}
      ListHeaderComponent={Header}
      renderItem={ListItem}
      keyExtractor={(item:any)=> item.id}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={requestCallList}/>
      }
      />
      <Modal transparent={true} visible={loading}>
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
          <Icon name='spinner' size={50} color={'#3498db'}/>
          <Text style={{color:'black'}}>Loading...</Text>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  continue:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    width:'100%',
    backgroundColor:'white'
  },
  header:{
    flexDirection:'row',
    height:50,
    marginBottom:5,
    backgroundColor:'#3498db',
    color: 'white',
    alignItems: 'center'
  },
  headerText:{
    fontSize:18,
    textAlign:'center',
    color: 'white',
  },
  TextForm:{
    flex:1,
    borderWidth:1,
    borderColor:'#3498db',
    height:hp(5),
    paddingLeft:10,
    paddingRight:10
  }
})

export default MainList;