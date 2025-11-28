import { TextInput, View, Text } from 'react-native';

type TextContentType = 
'none'|
'addressCity'|
'addressCityAndState'|
'addressState'|
'countryName'|
'creditCardNumber'|
'creditCardExpiration'| 
'creditCardExpirationMonth'| 
'creditCardExpirationYear' |
'creditCardSecurityCode' |
'creditCardType' |
'creditCardName' |
'creditCardGivenName'| 
'creditCardMiddleName'| 
'creditCardFamilyName' |
'emailAddress'|
'familyName'|
'fullStreetAddress'|
'givenName'|
'jobTitle'|
'location'|
'middleName'|
'name'|
'namePrefix'|
'nameSuffix'|
'nickname'|
'organizationName'|
'postalCode'|
'streetAddressLine1'|
'streetAddressLine2'|
'sublocality'|
'telephoneNumber'|
'username'|
'password'|
'newPassword'|
'oneTimeCode'|
'birthdate' |
'birthdateDay'| 
'birthdateMonth'| 
'birthdateYear';

type booleanType = true | false;

type AuthInputProps = {
  type: TextContentType;
  name: string;
  placeholder: string;
  value: string;
  onchange: (text: string) => void;
  Secure: booleanType;
  reject?: booleanType;
  onPress?: ()=>void;
};

export default function Input({
    type,
    name,
    placeholder,
    value,
    onchange,
    Secure,
    reject,
    onPress
}: AuthInputProps
) {

  return (
    <View className='flex flex-col' >
        <Text className='mb-1 text-[16px]' >{name}</Text>
        <TextInput 
          className='w-full border border-black/20 h-16 rounded-[10px] pl-2 focus:border focus:border-orange text-black' 
          textContentType={type} 
          onPress={onPress} 
          placeholder={placeholder} 
          placeholderTextColor="#999999"
          value={value} 
          onChangeText={onchange} 
          secureTextEntry={Secure}
        />
    </View>
  );
}