import { CameraView } from 'expo-camera'
import { LegacyRef, useRef } from 'react'
import { StyleSheet } from 'react-native'
import { Button, View } from 'tamagui'
import { Camera, Circle } from '@tamagui/lucide-icons'
import { useCameraActions } from '../ChatScreen/helpers'

function CameraScreen() {
  const cameraRef = useRef<CameraView>()

  const { takePicture, toggleCameraFacing, facing } =
    useCameraActions(cameraRef)

  return (
    <View flex={1} justifyContent="center">
      <CameraView
        ref={cameraRef as LegacyRef<CameraView>}
        style={styles.camera}
        facing={facing}
      >
        <Button
          onPress={takePicture}
          scaleIcon={1.5}
          scale={1.5}
          borderRadius={'$12'}
          position="absolute"
          alignSelf="center"
          bottom="$8"
          icon={Circle}
        />

        <Button
          onPress={toggleCameraFacing}
          scaleIcon={1.5}
          scale={1.5}
          borderRadius={'$12'}
          position="absolute"
          right="$8"
          top="$8"
          icon={Camera}
        />
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
})

export { CameraScreen }
