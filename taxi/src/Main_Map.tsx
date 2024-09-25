import {SafeAreaView, StyleSheet, Text, View,Modal ,TouchableOpacity,Alert} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useState, useRef } from 'react';
import MapView,{PROVIDER_GOOGLE , Marker,Polyline, } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import api from './API'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation , ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
function MainMap() : JSX.Element {
  console.log('MainMap');
  
  const navigation =useNavigation<StackNavigationProp<ParamListBase>>()
  
  const callTaxi =async()=>{
    let userId = await AsyncStorage.getItem('userId')||""
    let startAddr = autoCompete1.current.getAddressText()
    let endAddr = autoCompete2.current.getAddressText()

    let startLat = `${marker1.latitude}`
    let startLng = `${marker1.longitude}`
    let endLat = `${marker2.latitude}`
    let endLng = `${marker2.longitude}`

    if(!(startAddr&&endAddr)){
      Alert.alert("알람","출발지/도착지가 모두 입력되어야합니다.",[
        {text:'확인',style:'cancel'}])
      return
    }
    api.call(userId,startLat,startLng,startAddr,endLat,endLng,endAddr)
    .then(res=>{
      let {code,message} =res.data[0]
      let title ="알람"
      if(code==0){
        navigation.navigate('MainList')
      }else{
        title="오류"
      }

      Alert.alert(title,message,[
        {text:'확인',style:'cancel'}
      ])
    })
    .catch(e=>{})
  }



  const [loading, setloading] = useState(false)
  const [selectedLatLng,setselectedLatLng] = useState({
    latitude:0, longitude:0
  })
  const [selectedAddress,setSelectedAddress] =useState('')
  
  
  const mapRef : any = useRef(null)
  
  const [initialRegion,setInitialRegion] =useState({
    latitude: 37.5666612,
    longitude: 126.9783785,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421
  })
  
  const [showBtn,setShowBtn]=useState(false);
  
  let query ={
    key:"AIzaSyCeAMAxJ_qUwfEQsPP5v7Nrs1bfj_Eb9kw",
    language:"ko",
    components: "country:kr"
  }
  
  const handleLongPress = async (event: any)=>{
    const {coordinate} =event.nativeEvent
    
    setselectedLatLng(coordinate)
    
    setloading(true)
    
    api.geoCoding(coordinate,query.key)
    .then(res=>{
      setSelectedAddress(res.data.results[0].formatted_address)
      setShowBtn(true)
      setloading(false)
    })
    .catch(e=>{
      console.log("err = " +JSON.stringify(e))
      setloading(false)
    })
  }
  
  const autoCompete1: any = useRef(null)
  const autoCompete2: any = useRef(null)
  
  const handleAddMarker = (title:string)=>{
    if(selectedAddress){
      if(title=="출발지"){
        setMarker1(selectedLatLng)
        if(autoCompete1.current){
          autoCompete1.current.setAddressText(selectedAddress)
        }
      }else{
        setMarker2(selectedLatLng)
        if(autoCompete2.current){
          autoCompete2.current.setAddressText(selectedAddress)
        }
      }
      setShowBtn(false)
    }
  }
  
  
  const [marker1,setMarker1] = useState({latitude:0,longitude:0})
  const [marker2,setMarker2] = useState({latitude:0,longitude:0})

  const onSelectAddr = (data:any,details:any, type:string)=>{
    if (details) {
      let lat = details.geometry. location.lat
      let lng = details.geometry.location.lng

      if(type == "start"){
        setMarker1({latitude:lat, longitude: lng})
        if(marker2.latitude == 0){
          setInitialRegion({
            latitude:lat, longitude:lng,
            latitudeDelta:0.0073, longitudeDelta:0.0064
          })
        }
      }else{
        setMarker2({latitude:lat,longitude:lng})
        if(marker1.latitude == 0){
          setInitialRegion({
            latitude:lat, longitude:lng,
            latitudeDelta:0.0073, longitudeDelta:0.0064
          })
        }
      }
    }
  }

  if(marker1.latitude !=0&&marker2.latitude!=0){
    if(mapRef.current){
      mapRef.current.fitToCoordinates([marker1,marker2],{
        edgePadding:{top:120,right:50, bottom:50, left:50},
        animated:true
      })
    }
  }

  const setMyLocation =() =>{
    setloading(true)

    Geolocation.getCurrentPosition((position)=>{
      const {latitude,longitude} = position.coords

      let coords={latitude, longitude}
      setMarker1(coords)
      setInitialRegion({latitude:0, longitude:0, latitudeDelta:0, longitudeDelta:0})
      setInitialRegion({latitude:latitude, longitude:longitude,
        latitudeDelta:0.0073, longitudeDelta:0.0064
      })
      api.geoCoding(coords, query.key)
      .then(res=>{
        let addr = res.data.results[0].formatted_address
        autoCompete1.current.setAddressText(addr)
        setloading(false)
      })
      .catch(e=>{
        console.log(JSON.stringify(e))
        setloading(false)
      })
    },
    (e)=>{
      setloading(false)
      console.log(e)
    },
    {
      enableHighAccuracy:false,
      timeout:10000,
      maximumAge:1000
    }
    )
  }

  return(
    <SafeAreaView style={styles.container}>
    {/**지도*/}
      <MapView style={styles.container} provider={PROVIDER_GOOGLE} 
      region={initialRegion} ref={mapRef} 
      onLongPress={handleLongPress}
      onPress={()=>{setShowBtn(false)}}
      >
        <Marker coordinate={marker1} title='출발 위치'/>
        <Marker coordinate={marker2} title='도착위치' pinColor='blue'/>
        {marker1.latitude !=0 && marker2.latitude!=0&&(
          <Polyline
          coordinates={[marker1, marker2]}
          strokeColor='blue'
          strokeWidth={3}/>
        )}
      </MapView>
      <View style={{position:'absolute', width:'100%', height:'100%',padding:10}}>
        <View style={{position:'absolute',padding:wp(2)}}>
          <View style={{width:wp(75)}}>
            <GooglePlacesAutocomplete
              ref={autoCompete1}
              onPress={(data,detail)=> onSelectAddr(data,detail,'start')}
              minLength={2}
              placeholder='출발지 검색'
              query={query}
              keyboardShouldPersistTaps={"handled"}
              fetchDetails={true}
              enablePoweredByContainer={false}
              onFail={(e)=>console.log(e)}
              onNotFound={()=>console.log("no results")}
              styles={{autocompleteStles}}
              />
          </View>
          <View style={{width:wp(75)}}>
            <GooglePlacesAutocomplete
              ref={autoCompete2}
              onPress={(data,detail)=> onSelectAddr(data,detail,'end')}
              minLength={2}
              placeholder='도착지 검색'
              query={query}
              keyboardShouldPersistTaps={"handled"}
              fetchDetails={true}
              enablePoweredByContainer={false}
              onFail={(e)=>console.log(e)}
              onNotFound={()=>console.log("no results")}
              styles={{autocompleteStles}}
              />
          </View>
        </View>
        <TouchableOpacity style={[styles.button,
        {position:'absolute',width:wp(18),top:wp(2),right:wp(2),height:90, justifyContent:'center'}]}
        onPress={callTaxi}
        >
          <Text style={styles.buttonText}>호출</Text>
        </TouchableOpacity>
      </View>
      
      {/**내 위치 */}
      <TouchableOpacity style={[{position:'absolute', bottom:20, right:20}]}>
        <Icon name="crosshairs" size={40} color={'#3498db'} onPress={setMyLocation}/>
      </TouchableOpacity>

      {showBtn&&<View style={{position:'absolute',top:hp(50)-45,left:wp(50)-75, height:90, width:150}}>
        <TouchableOpacity style={[styles.button,{flex:1,marginVertical:1}]}
        onPress={()=>handleAddMarker('출발지')}>
          <Text style={styles.buttonText}>출발지 등록</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button,{flex:1}]}
        onPress={()=>handleAddMarker('도착지')}>
          <Text style={styles.buttonText}>도착지 등록</Text>
        </TouchableOpacity>
      </View>
      }


      <Modal transparent={true} visible={loading}>
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
          <Icon name='spinner' size={50} color="blue"/>
          <Text style={{backgroundColor:'white',color:'black', height:20}}>Loading...</Text>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const autocompleteStles = StyleSheet.create({

  textInputContainer:{
    width:'100%',
    backgroundColor:'#e9e9e9',
    borderRadius:8,
    height:40
  },
  textInput:{
    height:40,
    color: '#5d5d5d',
    fontSize: 16
  },
  finedPlaces:{
    color:'#1faadb',
    zIndex: 1
  }
})

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
  input:{
    height: 40,
    borderWidth:2,
    borderColor: 'gray',
    marginVertical:1,
    padding:10
  }
})

export default MainMap;