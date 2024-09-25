import {SafeAreaView, StyleSheet, Text,TouchableOpacity, FlatList} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

function MainSetting() : JSX.Element {
  console.log('MainSetting');
  const Navigation = useNavigation<StackNavigationProp<ParamListBase>>()

  const onLogout =()=>{
    AsyncStorage.removeItem('userId').then(()=>{
      Navigation.popToTop()
    })
  }

  let arrSetMenu=[{id:0,name:'로그아웃'},{id:1,name:'닉네임 설정'}]


  return(
    <SafeAreaView style={styles.container}>
      <FlatList style={{width:'100%'}}
        data={arrSetMenu}
        renderItem={(item)=>{
          //console.log("row ="+ JSON.stringify(row))
          if(item.item.id === 0){
            return(
              <TouchableOpacity style={styles.container} onPress={onLogout}>
                <Text style={styles.TextForm}>{item.item.name}</Text>
              </TouchableOpacity>
            )
          }else if(item.item.id === 1){
            return(
              <TouchableOpacity style={styles.container} onPress={()=>{Navigation.navigate('NickName')}}>
                <Text style={styles.TextForm}>{item.item.name}</Text>
              </TouchableOpacity>
            )
          }
          return null
        }}
        keyExtractor={(item:any)=>item.id}
        />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent:'center',
    alignItems: 'center',
  },
  TextForm:{
    borderWidth:1,
    borderColor:'#3498db',
    padding:20,
    width:'100%',
    fontSize:20,
    textAlign:'center',
    color:'#3498db',
    marginBottom:2
  }
})

export default MainSetting;