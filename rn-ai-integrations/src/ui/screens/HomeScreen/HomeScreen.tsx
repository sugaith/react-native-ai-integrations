import { Image, Text, TouchableOpacity, View } from 'react-native'

const HomeScreen = () => {
  return (
    <View className={'flex-1 bg-background pt-6'}>
      <TouchableOpacity>
        <View className={'flex-row py-3 px-6'}>
          <View className={'flex-auto'}>
            <Text className={'text-body text-2xl'}>LLM Chat</Text>

            <Text className={'text-body-second'}>
              Engage in conversations with a LLM. Supports picture taking
            </Text>
          </View>

          <View className={'bg-red-50 w-1/3 rounded-xl overflow-hidden'}>
            <Image
              className={'flex-1'}
              src={'https://reactnative.dev/img/tiny_logo.png'}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View className={'h-3'} />

      <TouchableOpacity>
        <View className={'flex-row py-3 px-6'}>
          <View className={'flex-auto'}>
            <Text className={'text-body text-2xl'}>LLM Chat</Text>

            <Text className={'text-body-second'}>
              Engage in conversations with a LLM. Supports picture taking
            </Text>
          </View>

          <View className={'bg-red-50 w-1/3 rounded-xl overflow-hidden'}>
            <Image
              className={'flex-1'}
              src={'https://reactnative.dev/img/tiny_logo.png'}
            />
          </View>
        </View>
      </TouchableOpacity>

      <View className={'h-3'} />

      <TouchableOpacity>
        <View className={'flex-row py-3 px-6'}>
          <View className={'flex-auto'}>
            <Text className={'text-body text-2xl'}>LLM Chat</Text>

            <Text className={'text-body-second'}>
              Engage in conversations with a LLM. Supports picture taking
            </Text>
          </View>

          <View className={'bg-red-50 w-1/3 rounded-xl overflow-hidden'}>
            <Image
              className={'flex-1'}
              src={'https://reactnative.dev/img/tiny_logo.png'}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export { HomeScreen }
