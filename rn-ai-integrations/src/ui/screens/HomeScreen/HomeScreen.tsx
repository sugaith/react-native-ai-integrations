import { Image, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const HomeScreen = () => {
  const { navigate } = useNavigation()

  return (
    <View className={'flex-1 bg-background pt-6'}>
      <TouchableOpacity onPress={() => navigate('ConversationListScreen')}>
        <View className={'flex-row py-3 px-6'}>
          <View className={'flex-auto'}>
            <Text className={'text-body text-2xl'}>LLM Chat</Text>

            <Text className={'text-body-second'}>
              {`Text Chat with OpenAI, Google and Meta models.`}
            </Text>
          </View>

          <View className={'w-1/3'}>
            <Image
              className={
                'flex-1 size-10/12 items-center self-center rounded-2xl'
              }
              source={require('../../../../assets/chat-icon.png')}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View className={'h-3'} />

      <TouchableOpacity onPress={() => navigate('SpeechToTextScreen')}>
        <View className={'flex-row py-3 px-6'}>
          <View className={'flex-auto'}>
            <Text className={'text-body text-2xl'}>Executorch Demo</Text>

            <Text
              className={'text-body-second'}
            >{`Everything here is local, you can disconnect your device from the web`}</Text>
          </View>

          <View className={'w-1/3'}>
            <Image
              className={
                'flex-1 size-10/12 items-center self-center rounded-2xl'
              }
              source={require('../../../../assets/executorch-logo.png')}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View className={'h-3'} />

      <TouchableOpacity onPress={() => navigate('LiveAudioScreen')}>
        <View className={'flex-row py-3 px-6'}>
          <View className={'flex-auto'}>
            <Text className={'text-body text-2xl'}>Gemini Voice Live</Text>

            <Text className={'text-body-second'}>
              {`Engage with live voice conversation using Google Live API!`}
            </Text>
          </View>

          <View className={'w-1/3'}>
            <Image
              className={
                'flex-1 size-10/12 items-center self-center rounded-2xl'
              }
              source={require('../../../../assets/gemini-logo.png')}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export { HomeScreen }
