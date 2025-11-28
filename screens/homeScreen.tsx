import { View, Text, ImageBackground, TouchableOpacity } from "react-native";

import image from '../assets/projeto/img3.png'
import { LinearGradient } from 'expo-linear-gradient';
import CirclePass from "components/circlePass";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "App";
import { StorageUtils } from "hooks/utils";

export default function HomeScreen() {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
        <ImageBackground source={image} resizeMode="cover" className="h-full w-full flex items-center justify-end brightness-[-20]" >
            <LinearGradient
                className="w-full h-[100%] absolute bottom-0 left-0"
                locations={[0,0.88,1]}
                colors={[ "transparent","#111111","#111111"]}
                start={{ x: 1, y: 0 }}
                end={{ x: 1, y: 1 }}
                
               >
                </LinearGradient>
            <View className="px-7 pb-10 h-[50%] flex flex-col justify-end mb-4">
                <Text className="text-white text-center text-2xl mb-3" >Track & Enjoy Every Bite of the Journey</Text>
                <Text className="text-white text-center mb-5" >From breakfast to dinner, find your favorite dishes and get them delivered fast and fresh.</Text>
                <CirclePass number={3} />
                <TouchableOpacity onPress={async ()=> {
                    // StorageUtils.clearAllData();
                    // const value = await StorageUtils.exportAllData();
                    // console.log(value);
                    navigation.navigate('Login')
                } } className="bg-orange rounded-full justify-center items-center h-14" ><Text className="text-white" >Get Start</Text></TouchableOpacity>
                <TouchableOpacity onPress={()=>navigation.navigate('Registration')} >
                    <Text className="text-white my-3 text-center" >Don’t have an account? <Text className="font-semibold" >Sign In</Text></Text> 
                </TouchableOpacity>
                   
                
            </View>
        </ImageBackground>
  );
}