import { useThemeStore } from '../../../store'
import { Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'

function ThemeToggle() {
  const colorTheme = useThemeStore((state) => state.colorTheme)
  const setColorTheme = useThemeStore((state) => state.setColorTheme)

  const toggleTheme = () => {
    setColorTheme(colorTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="align-middle items-center justify-center"
    >
      <Text className="p-3 text-2xl">
        {colorTheme === 'dark' ? '🌖' : '🌘'}
      </Text>
    </TouchableOpacity>
  )
}

function Header({ title = '', showBackButton = true }) {
  const { goBack } = useNavigation()

  return (
    <View className={`bg-background-second flex-row justify-between pt-9`}>
      {showBackButton ? (
        <View className={'flex-row'}>
          <TouchableOpacity onPress={goBack}>
            <View className={'p-3 flex-row justify-center items-center'}>
              <Text className="text-body text-2xl align-middle"> {'⌫'}</Text>
            </View>
          </TouchableOpacity>

          <Text className="text-body text-2xl align-middle "> {title}</Text>
        </View>
      ) : (
        <Text className="p-3 text-2xl text-body align-middle "> {title}</Text>
      )}

      <ThemeToggle />
    </View>
  )
}

export { Header }
