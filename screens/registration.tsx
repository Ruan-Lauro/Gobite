import { SafeAreaView, View, Text, TouchableOpacity, Animated } from "react-native";
import { MoveLeft } from "lucide-react-native";
import Input from "components/input";
import { useState, useRef, useEffect } from "react";
import Buttons from "components/button";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "App";
import {SessionStorage} from '../hooks/login';
import {UserStorage} from '../hooks/user';

export default function Registration() {

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [erroR, setErroR] = useState('');

  const navigate = useNavigation<NavigationProp<RootStackParamList>>();

  function formatphone (value: string) {
        let digits = value.replace(/\D/g, "");
        if (digits.length > 11) digits = digits.slice(0, 11);

        if (digits.length <= 11) {
            if (digits.length <= 2) return digits;
            if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        } else {
            return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
        }
  }

  const handleRegistration = async () => {
    console.log('Aqui')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErroR('Formato do e-mail errado');
      return;
    }
    if (!/^\(\d{2}\) \d{4,5}-\d{5}$/.test(phone)) {
      setErroR('Formato do número errado');
      return;
    }if(!fullName.trim()){
      setErroR('The name is missing');
      return;
    }
    if(!password.trim()){
      setErroR('The password is missing');
      return;
    }
    if(!email.trim()){
      setErroR('The e-mail is missing');
      return;
    }
    if(!phone.trim()){
      setErroR('The phone number is missing');
      return;
    }

    setErroR('');
    try {
      const user = await UserStorage.saveUser({
        email, 
        name: fullName, 
        phone, 
        password: password,
    
      });
      if(typeof user !== 'string' && user && user.id){
       const login = await SessionStorage.loginUser(email, password, true);
       if(typeof login !== 'string' && login && login.token){
          console.log(login);
          navigate.navigate('Location');
       }
      }
    } catch (error) {
      if (error instanceof Error) {
        setErroR(error.message
          
        ); 
      } else {
        setErroR(String(error)); 
      }
    }

  }

  return (
    <SafeAreaView>
      <View className="mt-14 px-5">
        <TouchableOpacity onPress={()=>navigate.goBack()} className="bg-orange w-12 h-12 flex items-center justify-center rounded-full">
          <MoveLeft width={30} color={"white"} />
        </TouchableOpacity>

        <Text className="text-3xl font-bold mt-10 mb-1">Create an Account</Text>
        <Text className="text-lg text-black/70">
          Join us today and unlock endless possibilities. It’s quick, easy, and just a step away!
        </Text>

        <View className="flex flex-col w-full mt-10 gap-7">
            <Input
                placeholder="Enter your name.."
                value={fullName}
                onchange={setFullName}
                Secure={false}
                type="name"
                name="Full Name"
              />
              <Input
                placeholder="Enter your email address.."
                value={email}
                onchange={setEmail}
                Secure={false}
                type="emailAddress"
                name="E-mail"
              />
            <Input
              placeholder="Enter your phone number.."
              value={phone}
              onchange={
                (e)=>{
                    const formatted = formatphone(e); 
                    setPhone(formatted);
                }
              }
              Secure={false}
              type="telephoneNumber"
              name="Phone Number"
            />
          <Input
                placeholder="Enter your password..."
                value={password}
                onchange={setPassword}
                Secure={true}
                type="password"
                name="Password"
              />
        </View>

        {erroR !== '' && (
          <Text className="text-[16px] text-red-500 mt-5 text-center" >{erroR}</Text>
        )}

        <Buttons authentication={handleRegistration} textButton="Sing Up" Condition className={`${erroR !== ''?'mt-5':'mt-10'}`} />

        <TouchableOpacity className="w-full flex items-center mt-3" onPress={()=>navigate.navigate('Login')}>
          <Text className="text-[14px]">
           Already have an account? <Text className="text-orange">Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
