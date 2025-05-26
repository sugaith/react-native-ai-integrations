import { CameraView } from 'expo-camera'
import { Ref, useRef } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useCameraActions } from '../ChatScreen/helpers'

function CameraScreen() {
  const cameraRef = useRef<CameraView>(undefined)

  const { takePicture, toggleCameraFacing, facing } =
    useCameraActions(cameraRef)

  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      <CameraView
        ref={cameraRef as Ref<CameraView>}
        style={styles.camera}
        facing={facing}
      >
        <TouchableOpacity
          onPress={takePicture}
          style={{width: 50, height: 50, backgroundColor:'green', position: 'absolute', bottom: 8, alignSelf: 'center'}}
        />

        <TouchableOpacity
          onPress={toggleCameraFacing}
          style={{width: 50, height: 50, backgroundColor:'red', position: 'absolute', right: 8, top: 8}}
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
