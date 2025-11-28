import { View, Text, ImageBackground, TouchableOpacity } from "react-native";

import image from '../assets/projeto/img1.png'
import { LinearGradient } from 'expo-linear-gradient';
import CirclePass from "components/circlePass";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "App";


export default function InitialImg() {

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
            <View className="px-7 pb-10 h-[50%] flex flex-col justify-end mb-6">
                <Text className="text-white text-center text-2xl mb-3" >Discover Deliciousness Anytime, Anywhere</Text>
                <Text className="text-white text-center mb-5" >Explore endless food options, order in seconds, and enjoy quick delivery straight to your door.</Text>
                <CirclePass number={1} />
         
                <TouchableOpacity onPress={()=>navigation.navigate("secondInitialScreen")} className="bg-[#EF6820] rounded-full justify-center items-center h-14" ><Text className="text-white" >Continue</Text></TouchableOpacity>
            </View>
        </ImageBackground>
  );
}