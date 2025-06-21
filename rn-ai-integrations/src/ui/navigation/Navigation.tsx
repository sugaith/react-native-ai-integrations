import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  CameraScreen,
  ChatScreen,
  ConversationListScreen,
  SpeechToTextScreen,
  LiveAudioScreen,
} from '../screens/'
import { HomeScreen } from '../screens/HomeScreen'
import { View } from 'react-native'
import { themes } from '../color-theme'
import { useThemeStore } from '../../store'
import { Header } from '../components'

type StackNavigatorScreens = {
  HomeScreen: undefined
  ConversationListScreen: undefined
  ChatScreen: undefined
  CameraScreen: undefined
  SpeechToTextScreen: undefined
  LiveAudioScreen: undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackNavigatorScreens {}
  }
}

const Stack = createNativeStackNavigator<StackNavigatorScreens>()

function Navigation() {
  const colorTheme = useThemeStore((state) => state.colorTheme)

  return (
    <View style={themes[colorTheme]} className={'flex-1 bg-background'}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{
              header: () => (
                <Header title={'AI Integrations'} showBackButton={false} />
              ),
            }}
          />

          <Stack.Screen
            name="ConversationListScreen"
            component={ConversationListScreen}
            options={{
              header: () => <Header title={'Your Chats'} />,
            }}
          />

          <Stack.Screen
            name="ChatScreen"
            component={ChatScreen}
            options={{
              header: () => <Header />,
            }}
          />

          <Stack.Screen
            name="SpeechToTextScreen"
            component={SpeechToTextScreen}
            options={{
              header: () => <Header />,
            }}
          />

          <Stack.Screen
            name="LiveAudioScreen"
            component={LiveAudioScreen}
            options={{
              header: () => <Header title={'Voice Chat'} />,
            }}
          />

          <Stack.Screen
            name="CameraScreen"
            component={CameraScreen}
            options={{
              header: () => <Header />,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  )
}

export type { StackNavigatorScreens }
export { Navigation }
