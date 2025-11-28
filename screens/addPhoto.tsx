import { SafeAreaView, View, Text, TouchableOpacity, Button, Image } from "react-native";
import { MoveLeft } from "lucide-react-native";
import Buttons from "components/button";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "App";
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from "react";
import { Camera  } from 'lucide-react-native';
import {UserStorage} from '../hooks/user';
import {SessionStorage} from '../hooks/login';

export default function addPhoto() {

  const navigate = useNavigation<NavigationProp<RootStackParamList>>();
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
     const userShow = showUser();
  }, []);

  const showUser = async () => {
    const user = await SessionStorage.getCurrentSession();
    console.log(user);
  }


  const handleLogin = async () => {
    const session = await SessionStorage.getCurrentSession();
    
    const allUsers = await UserStorage.getAllUsers();
    const currentUser = allUsers.find(u => u.id === session?.user.id);
    
    if (!currentUser) {
      console.error('User not found');
      return;
    }

    const updatedUser = await UserStorage.updateUser({
      ...currentUser, 
      img: image!,     
    });

    if (typeof updatedUser === 'boolean' && updatedUser) {
      navigate.navigate('Dashboard');
    }
  };

   const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView>
      <View className="mt-14 px-5 flex flex-col justify-normal">
        <TouchableOpacity onPress={()=>navigate.goBack()} className="bg-orange w-12 h-12 flex items-center justify-center rounded-full">
          <MoveLeft width={30} color={"white"} />
        </TouchableOpacity>

        <Text className="text-3xl font-bold mt-10 mb-1">Add a Profile Photo!</Text>
        <Text className="text-lg text-black/70">
          Add a photo to personalize your profile and make your experience more engaging.
        </Text>


        <View className="w-full flex items-center rounded-full mt-20" >
            {image?(
                <View className="w-72 h-72 bg-gray-200 rounded-full flex items-center justify-center relative">
                    <Image source={{ uri: image }} className="w-full h-full rounded-full" />
                    <View className="absolute flex items-center justify-center bottom-5 right-2 bg-orange p-3 rounded-full w-14 h-14" onTouchEnd={pickImage}>
                        <Camera  width={40} color={"white"} />
                    </View>
                </View>
            ):(
                <View className="w-72 h-72 bg-gray-200 rounded-full flex items-center justify-center relative">
                    <Image source={require('../assets/gafiel.jpg')} className="w-full h-full rounded-full" />
                    <View className="absolute flex items-center justify-center bottom-5 right-2 bg-orange p-3 rounded-full w-14 h-14" onTouchEnd={pickImage}>
                        <Camera  width={40} color={"white"} />
                    </View>
                </View>
            )}
            
        </View>

        <Buttons 
          authentication={handleLogin} 
          textButton={'Continue'} 
          Condition={true}
          className="mt-[70%]"
        />

       
      </View>
    </SafeAreaView>
  );
}