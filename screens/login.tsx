import { SafeAreaView, View, Text, TouchableOpacity, Animated, Alert } from "react-native";
import { MoveLeft } from "lucide-react-native";
import Input from "components/input";
import { useState, useRef, useEffect } from "react";
import Buttons from "components/button";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "App";
import { SessionStorage } from "../hooks/login"; 
import {useLocation} from "../hooks/useLocation";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [typeLogin, setTypeLogin] = useState<"e-mail" | "phone">("e-mail");
  const [isLoading, setIsLoading] = useState(false);

  const{getSavedLocations} = useLocation({ idUser: "1"});

  const navigate = useNavigation<NavigationProp<RootStackParamList>>();

  const sliderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(sliderAnim, {
      toValue: typeLogin === "e-mail" ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [typeLogin]);

  const translateX = sliderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["7%", "100%"],
  });

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

  const validateFields = (): boolean => {
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return false;
    }

    if (typeLogin === "e-mail") {
      if (!email.trim()) {
        Alert.alert("Error", "Please enter your email address");
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert("Error", "Please enter a valid email address");
        return false;
      }
    } else {
      if (!phone.trim()) {
        Alert.alert("Error", "Please enter your phone number");
        return false;
      }
      
      const phoneDigits = phone.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        Alert.alert("Error", "Please enter a valid phone number");
        return false;
      }
    }

    return true;
  };

  const handleLogin = async () => {
     
    if (!validateFields()) {
      return;
    }

    setIsLoading(true);

    try {
      const loginValue = typeLogin === "e-mail" ? email : phone; 
      
      const session = await SessionStorage.loginUser(loginValue, password, true);

      if (session) {
        Alert.alert(
          "Success", 
          `Welcome back, ${session.user.name}!`,
          [
            {
              text: "OK",
              onPress: async () => {
                const userLocation = await getSavedLocations(session.user.id);
                if(userLocation && userLocation.length > 0){
                  navigate.navigate('Dashboard');
                }else{
                  navigate.navigate('Location');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          "Login Failed", 
          "Invalid credentials. Please check your email/phone and password.",
          [{ text: "Try Again" }]
        );
      }

    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Error", 
        "An error occurred during login. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setEmail("");
    setPhone("");
  }, [typeLogin]);
  

  return (
    <SafeAreaView>
      <View className="mt-14 px-5">
        <TouchableOpacity onPress={()=>navigate.goBack()} className="bg-orange w-12 h-12 flex items-center justify-center rounded-full">
          <MoveLeft width={30} color={"white"} />
        </TouchableOpacity>

        <Text className="text-3xl font-bold mt-10 mb-1">Welcome Back!</Text>
        <Text className="text-lg text-black/70">
          Enter your registered account to sign in
        </Text>

        <View className="flex-row items-center w-full py-2 px-2 bg-orange rounded-[10px] h-16 mt-10 relative overflow-hidden">
          <Animated.View
            style={{
              position: "absolute",
              width: "50%",
              height: "100%",
              backgroundColor: "white",
              borderRadius: 10,
              transform: [{ translateX }],
            }}
          />

          <TouchableOpacity
            onPress={() => setTypeLogin("e-mail")}
            className="w-1/2 h-full flex items-center justify-center rounded-[10px]"
            disabled={isLoading}
          >
            <Text
              className={`font-semibold ${
                typeLogin === "e-mail" ? "text-orange" : "text-white"
              }`}
            >
              E-mail
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTypeLogin("phone")}
            className="w-1/2 h-full flex items-center justify-center rounded-[10px]"
            disabled={isLoading}
          >
            <Text
              className={`font-semibold ${
                typeLogin === "phone" ? "text-orange" : "text-white"
              }`}
            >
              Phone Number
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex flex-col w-full mt-10 gap-10">
          {typeLogin === "e-mail" ? (
            <>
              <Input
                placeholder="Enter your email address.."
                value={email}
                onchange={setEmail}
                Secure={false}
                type="emailAddress"
                name="E-mail"
              />
              
            </>
          ) : (
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
          )}

          <Input
                placeholder="Enter your password..."
                value={password}
                onchange={setPassword}
                Secure={true}
                type="password"
                name="Password"
              />
        </View>

        <TouchableOpacity className="w-full flex items-end mt-1">
          <Text className="text-orange text-[14px]">Forgot password?</Text>
        </TouchableOpacity>

        <Buttons 
          authentication={handleLogin} 
          textButton={isLoading ? "Signing in..." : "Sign in"} 
          Condition={!isLoading}
          className="mt-10"
        />

        <TouchableOpacity 
          className="w-full flex items-center mt-3" 
          onPress={()=>{navigate.navigate('Registration')}}
          disabled={isLoading}
        >
          <Text className="text-[14px]">
            Don't have an account? <Text className="text-orange">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}