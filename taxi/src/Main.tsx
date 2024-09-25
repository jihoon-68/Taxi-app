import {SafeAreaView, StyleSheet, Text} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome'


import MainList from './Main_List';
import MainMap from './Main_Map';
import MainSetting from './Main_Setting';

function Main() : JSX.Element {
  console.log('Main');
  
  const BottomTad = createBottomTabNavigator();
  return(
    <BottomTad.Navigator>
      <BottomTad.Screen name='MainMap' component={MainMap} 
      options={{headerShown: false,
        tabBarIcon:({color,size})=>(<Icon name='map' size={size} color={color}/>)
      }}/>
      <BottomTad.Screen name='MainList' component={MainList} 
      options={{headerShown: false,
        tabBarIcon:({color,size})=>(<Icon name='phone' size={size} color={color}/>)
      }}/>
      <BottomTad.Screen name='MainSetting' component={MainSetting} 
      options={{headerShown: true , title:'환경설정',
        tabBarIcon:({color,size})=>(<Icon name='cog' size={size} color={color}/>)
      }}/>
    </BottomTad.Navigator>
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

export default Main;