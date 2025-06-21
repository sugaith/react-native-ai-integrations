import './global.css'

import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { StatusBar } from 'expo-status-bar'
import { Navigation } from 'src/ui'
import { useThemeStore } from './src/store'

export default function App() {
  const colorTheme = useThemeStore((state) => state.colorTheme)

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={colorTheme === 'dark' ? 'light' : 'dark'} />

      <Navigation />
    </GestureHandlerRootView>
  )
}
