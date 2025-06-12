import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native'

const LiveAudioScreen = () => {
  const [status, setStatus] = useState('Connecting... but not')
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    const askPermission = async () => {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        )
        if (!permission) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          )
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Microphone permission denied')
            return
          }
        }
      }
    }

    askPermission().then()
  }, [])

  const handleRecordPress = async () => {
    if (isRecording) {
      setIsRecording(false)
    } else {
      setIsRecording(true)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Audio Stream</Text>
      <Text style={styles.status}>{status}</Text>
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording ? styles.recording : styles.notRecording,
        ]}
        onPress={handleRecordPress}
        // disabled={recordingButtonDisabled}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.instructions}>
        {isRecording
          ? 'Recording audio and sending to server...'
          : 'Press the button to start recording audio.'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
  },
  recordButton: {
    width: 200,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  recording: {
    backgroundColor: 'red',
  },
  notRecording: {
    backgroundColor: 'green',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    paddingHorizontal: 20,
    fontSize: 16,
  },
})

export { LiveAudioScreen }
