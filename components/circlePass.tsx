import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "App";
import { useEffect } from "react";
import { Animated, View, TouchableOpacity } from "react-native";

export default function CirclePass ({number}:{number:number}) {

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
        }).start();
    }, [number]);

    return(
        <Animated.View className="flex flex-row items-center gap-3 justify-center mb-5" >
            <TouchableOpacity onPress={()=>navigation.navigate("initialScreen")} style={number === 1?{width:50, backgroundColor:'#EF6820'}:{width:10, backgroundColor:'white'}} className="h-3 rounded-full"></TouchableOpacity>
            <TouchableOpacity onPress={()=>navigation.navigate("secondInitialScreen")} style={number === 2?{width:50, backgroundColor:'#EF6820'}:{width:10, backgroundColor:'white'}} className="h-3 rounded-full"></TouchableOpacity>
            <TouchableOpacity onPress={()=>navigation.navigate("Home")} style={number === 3?{width:50, backgroundColor:'#EF6820'}:{width:10, backgroundColor:'white'}} className="h-3 rounded-full"></TouchableOpacity>
        </Animated.View>
    );
}