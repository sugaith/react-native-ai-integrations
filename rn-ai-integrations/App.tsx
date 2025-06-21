import './global.css'

import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import { Navigation } from 'src/ui'
import { useColorScheme } from 'nativewind'

export default function App() {
  const { colorScheme: deviceTheme } = useColorScheme()

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={deviceTheme === 'dark' ? 'light' : 'dark'} />

      <Navigation />
    </GestureHandlerRootView>
  )
}
