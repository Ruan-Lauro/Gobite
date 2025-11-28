import {Text, View, TouchableOpacity } from 'react-native';

type AuthButtonProps = {
    textButton: string;
    authentication: () => void ;
    id?: string;
    Condition: boolean;
    className?: string;
  }

export default function Buttons({textButton, authentication, Condition, className}:AuthButtonProps){
    return(
         <TouchableOpacity
         className={`w-full bg-orange h-16 rounded-full flex items-center justify-center ${className}`}
            onPress={()=>{
                authentication()
            }}
            >
            <Text className='text-white font-bold text-[16px]' >{textButton}</Text>
        </TouchableOpacity>
    );
}