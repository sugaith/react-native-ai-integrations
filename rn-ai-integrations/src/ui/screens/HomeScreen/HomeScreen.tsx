import { Image, Text, TouchableOpacity, View } from 'react-native'

const HomeScreen = () => {
  return (
    <View className={'flex-1 bg-background pt-6'}>
      <TouchableOpacity>
        <View className={'flex-row py-3 px-6'}>
          <View className={'flex-auto'}>
            <Text className={'text-body text-2xl'}>LLM Chat</Text>

            <Text className={'text-body-second'}>
              {`Text Chat with OpenAI, Google and Meta models.`}
            </Text>
          </View>

          <View className={'w-1/3 rounded-xl overflow-hidden'}>
            <Image
              className={'flex-1 size-10/12 items-center self-center'}
              source={require('../../../../assets/chat-icon.png')}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View className={'h-3'} />

      <TouchableOpacity>
        <View className={'flex-row py-3 px-6'}>
          <View className={'flex-auto'}>
            <Text className={'text-body text-2xl'}>Executorch Demo</Text>

            <Text
              className={'text-body-second'}
            >{`Everything here is local, you can disconnect your device from the web`}</Text>
          </View>

          <View className={'w-1/3 rounded-xl overflow-hidden'}>
            <Image
              className={'flex-1 size-10/12 items-center self-center'}
              source={require('../../../../assets/executorch-logo.png')}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View className={'h-3'} />

      <TouchableOpacity>
        <View className={'flex-row py-3 px-6'}>
          <View className={'flex-auto'}>
            <Text className={'text-body text-2xl'}>Google Live Voice</Text>

            <Text className={'text-body-second'}>
              {`Engage with live voice conversation using Google Live API!`}
            </Text>
          </View>

          <View className={'w-1/3 rounded-xl overflow-hidden'}>
            <Image
              className={'flex-1 size-10/12 items-center self-center'}
              source={require('../../../../assets/gemini-logo.png')}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export { HomeScreen }
