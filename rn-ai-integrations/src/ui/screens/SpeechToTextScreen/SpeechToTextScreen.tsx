import { useSpeechToText, LLAMA3_2_1B_SPINQUANT } from 'react-native-executorch'
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native'
import LiveAudioStream from 'react-native-live-audio-stream'

// import SWMIcon from '../assets/swm_icon.svg'
import { useRef, useState } from 'react'
import { Buffer } from 'buffer'
import DeviceInfo from 'react-native-device-info'
import * as FileSystem from 'expo-file-system'
import { AudioContext } from 'react-native-audio-api'
import { InputPrompt } from 'src/ui/components/TextInputModal'
import { Asset } from 'expo-asset'

const audioStreamOptions = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  audioSource: 1,
  bufferSize: 16000,
}

const startStreamingAudio = (options: any, onChunk: (data: string) => void) => {
  console.log('startStreamingAudio')

  LiveAudioStream.init(options)

  console.log('steam audio initiated....')

  LiveAudioStream.on('data', onChunk)
  console.log('event added')

  LiveAudioStream.start()

  console.log('stream started')
}

const float32ArrayFromPCMBinaryBuffer = (b64EncodedBuffer: string) => {
  const b64DecodedChunk = Buffer.from(b64EncodedBuffer, 'base64')
  const int16Array = new Int16Array(b64DecodedChunk.buffer)

  const float32Array = new Float32Array(int16Array.length)
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = Math.max(
      -1,
      Math.min(1, (int16Array[i] / audioStreamOptions.bufferSize) * 8),
    )
  }
  return float32Array
}

const harvardMp3Asset = Asset.fromModule(
  require('../../../../assets/harvardmp3.mp3'),
)

export const SpeechToTextScreen = () => {
  const {
    isGenerating,
    isReady,
    downloadProgress,
    sequence,
    error,
    transcribe,
  } = useSpeechToText({ modelName: 'moonshine', streamingConfig: 'balanced' })

  const loadAudio = async (
    url: string,
    isLocalAsset: boolean = false,
  ): Promise<number[]> => {
    const audioContext = new AudioContext({ sampleRate: 16e3 })
    const tempFileName =
      isLocalAsset && url.endsWith('.wav')
        ? '_tmp_transcribe_audio.wav'
        : '_tmp_transcribe_audio.mp3'
    const destinationUri = FileSystem.documentDirectory + tempFileName

    console.log(
      `Attempting to load audio from: ${url}, temp file: ${destinationUri}`,
    )

    try {
      console.log(`Starting download/copy from ${url} to ${destinationUri}`)
      const downloadResult = await FileSystem.downloadAsync(url, destinationUri)
      console.log(
        'Audio downloaded/copied to:',
        downloadResult.uri,
        'Status:',
        downloadResult.status,
      )

      if (downloadResult.status !== 200 && isLocalAsset === false) {
        throw new Error(
          `Failed to download audio file. Status: ${downloadResult.status}`,
        )
      }
      if (!downloadResult.uri) {
        throw new Error('Downloaded audio URI is undefined.')
      }

      console.log('Decoding audio data source:', downloadResult.uri)
      const decodedBuffer = await audioContext.decodeAudioDataSource(
        downloadResult.uri,
      )

      if (!decodedBuffer) {
        console.error(
          'Failed to decode audio data source: decodedBuffer is null or undefined',
        )
        throw new Error('Failed to decode audio data source')
      }
      console.log(
        `Decoded buffer - SampleRate: ${decodedBuffer.sampleRate}, Channels: ${decodedBuffer.numberOfChannels}, Duration: ${decodedBuffer.duration}s`,
      )

      const channelData = decodedBuffer.getChannelData(0)
      if (!channelData) {
        console.error(
          'Failed to get channel data (channel 0) from decoded buffer.',
        )
        throw new Error('Failed to get channel data from decoded buffer')
      }
      console.log(
        `Successfully retrieved channel data. Length: ${channelData.length}`,
      )

      return Array.from(channelData) // Convert Float32Array to number[]
    } catch (err: any) {
      console.error('Error in loadAudio:', err.message, err.stack)
      try {
        await FileSystem.deleteAsync(destinationUri, { idempotent: true })
        console.log('Temporary audio file deleted:', destinationUri)
      } catch (deleteError) {
        console.error('Error deleting temporary audio file:', deleteError)
      }
      throw err
    }
  }

  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  const audioBuffer = useRef<number[]>([]) // For live recording, this remains number[] as per current logic
  const [modalVisible, setModalVisible] = useState(false)

  const onChunk = (data: string) => {
    console.log('on chunk...')

    const float32Chunk = float32ArrayFromPCMBinaryBuffer(data)
    audioBuffer.current?.push(...float32Chunk) // Spreads Float32Array into number[]
  }

  console.log('rendered...........')

  const handleRecordPress = async () => {
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

    if (isRecording) {
      LiveAudioStream.stop()
      setIsRecording(false)
      await transcribe(audioBuffer.current) // Transcribe call for live recording
      audioBuffer.current = []
    } else {
      setIsRecording(true)
      startStreamingAudio(audioStreamOptions, onChunk)
    }
  }

  const handleTranscribeLocalMp3 = async () => {
    if (!isReady || isGenerating) {
      console.log('Transcription not ready or already generating.')
      return
    }
    let loadedAudioData: number[] | undefined = undefined
    try {
      console.log('Attempting to load local harvardmp3.mp3 asset.')
      if (!harvardMp3Asset) {
        throw new Error('harvardMp3Asset is not initialized.')
      }
      if (!harvardMp3Asset.downloaded) {
        console.log(
          'Local asset (harvardmp3.mp3) not yet downloaded, downloading now...',
        )
        await harvardMp3Asset.downloadAsync()
        console.log('Local asset (harvardmp3.mp3) downloaded.')
      }
      if (!harvardMp3Asset.uri) {
        throw new Error('Local asset URI (harvardmp3.mp3) is not available.')
      }
      console.log('Local MP3 asset URI:', harvardMp3Asset.uri)
      loadedAudioData = await loadAudio(harvardMp3Asset.uri, true) // Pass true for isLocalAsset

      if (!loadedAudioData || loadedAudioData.length === 0) {
        throw new Error(
          'Failed to load or got empty audio data from harvardmp3.mp3.',
        )
      }
      console.log(
        `MP3 audio loaded. Length: ${loadedAudioData.length}. Sample: ${loadedAudioData.slice(0, 5)}. Transcribing...`,
      )
      await transcribe(loadedAudioData)
      console.log('MP3 transcription call completed.')
    } catch (e: any) {
      console.error('Error in handleTranscribeLocalMp3:', e.message, e.stack)
    }
  }

  const handleTranscribeFromUrlInput = async () => {
    if (!audioUrl || !isReady || isGenerating) return
    try {
      console.log('Attempting to load audio from URL:', audioUrl)
      const loadedAudio = await loadAudio(audioUrl, false)
      if (!loadedAudio || typeof loadedAudio.length === 'undefined') {
        console.error('loadAudio from URL did not return valid audio data.')
        throw new Error('Failed to load audio data from URL for transcription.')
      }
      await transcribe(loadedAudio)
    } catch (e: any) {
      console.error('Error transcribing from URL input:', e.message, e.stack)
    }
  }

  const buttonDisabled = modalVisible || isGenerating || !isReady || isRecording
  const recordingButtonDisabled =
    modalVisible || !isReady || DeviceInfo.isEmulatorSync()

  return (
    <>
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.topContainer}>
          <View style={{ width: 80, height: 80, backgroundColor: 'cyan' }} />
          <Text style={styles.topContainerText}>
            {'React Native ExecuTorch'}
          </Text>
          <Text style={styles.topContainerText}>{'Speech to Text demo'}</Text>
        </View>
        {downloadProgress !== 1 ? (
          <View style={styles.transcriptionContainer}>
            <Text style={[styles.transcriptionText, styles.textGreyCenter]}>
              {`Downloading model: ${(Number(downloadProgress.toFixed(4)) * 100).toFixed(2)}%`}
            </Text>
          </View>
        ) : (
          <View style={styles.transcriptionContainer}>
            <Text
              style={
                sequence
                  ? styles.transcriptionText
                  : [styles.transcriptionText, styles.textGreyCenter]
              }
            >
              {sequence ||
                (isGenerating && 'Transcribing...') ||
                'Start transcription...'}
            </Text>
          </View>
        )}
        {error && (
          <Text
            style={[styles.transcriptionText, styles.redText]}
          >{`${error}`}</Text>
        )}
        <InputPrompt
          modalVisible={modalVisible}
          setModalVisible={(newVisibilityState: boolean) => {
            if (!newVisibilityState && modalVisible && audioUrl) {
              handleTranscribeFromUrlInput()
            }
            setModalVisible(newVisibilityState)
          }}
          onChangeText={setAudioUrl}
          value={audioUrl}
        />
        <View style={styles.iconsContainer}>
          <View
            style={[
              styles.recordingButtonWrapper,
              (buttonDisabled || isRecording) && styles.borderGrey,
            ]}
          >
            <TouchableOpacity
              disabled={buttonDisabled || isRecording}
              style={[
                styles.recordingButton,
                (buttonDisabled || isRecording) && styles.backgroundGrey,
              ]}
              onPress={() => {
                setAudioUrl('')
                setModalVisible(true)
              }}
            >
              <Text style={[styles.recordingButtonText, styles.font13]}>
                TRANSCRIBE FROM URL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.iconsContainer}>
          <View
            style={[
              styles.recordingButtonWrapper,
              (buttonDisabled || isRecording) && styles.borderGrey,
            ]}
          >
            <TouchableOpacity
              disabled={buttonDisabled || isRecording}
              style={[
                styles.recordingButton,
                (buttonDisabled || isRecording) && styles.backgroundGrey,
              ]}
              onPress={handleTranscribeLocalMp3}
            >
              <Text style={[styles.recordingButtonText, styles.font13]}>
                TEST LOCAL HARVARD.MP3
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.iconsContainer}>
          <View
            style={[
              styles.recordingButtonWrapper,
              recordingButtonDisabled && styles.borderGrey,
              isRecording && styles.borderRed,
            ]}
          >
            <TouchableOpacity
              disabled={recordingButtonDisabled || isGenerating}
              style={[
                styles.recordingButton,
                recordingButtonDisabled && styles.backgroundGrey,
                isRecording && styles.backgroundRed,
              ]}
              onPress={handleRecordPress}
            >
              <Text style={styles.recordingButtonText}>
                {isRecording ? 'STOP RECORDING' : 'START RECORDING'}
              </Text>
              {DeviceInfo.isEmulatorSync() && (
                <Text
                  style={[styles.recordingButtonText, styles.emulatorWarning]}
                >
                  recording does not work on emulator
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  textInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '75%',
    borderRadius: 20,
  },
  imageContainer: {
    flex: 6,
    width: '100%',
    padding: 16,
  },
  image: {
    flex: 1,
    borderRadius: 8,
    width: '100%',
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'white',
  },
  recordingButtonWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    borderWidth: 3,
    borderColor: '#001A72',
    borderRadius: 50,
  },
  recordingButton: {
    paddingVertical: 20,
    backgroundColor: '#001A72',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderRadius: 40,
  },
  topContainer: {
    marginTop: 80,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topContainerText: {
    height: 35,
    fontSize: 30,
    marginTop: 5,
    color: '#001A72',
    fontWeight: '600',
  },
  transcriptionContainer: {
    flex: 5,
    paddingTop: 80,
    width: '90%',
  },
  transcriptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  iconsContainer: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
  },
  recordingButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  textGreyCenter: {
    color: 'gray',
    textAlign: 'center',
  },
  redText: {
    color: 'red',
  },
  borderGrey: {
    borderColor: 'grey',
  },
  backgroundGrey: {
    backgroundColor: 'grey',
  },
  font13: {
    fontSize: 13,
  },
  borderRed: {
    borderColor: 'rgb(240, 63, 50)',
  },
  backgroundRed: {
    backgroundColor: 'rgb(240, 63, 50)',
  },
  emulatorWarning: {
    color: 'rgb(254, 148, 141)',
    fontSize: 11,
  },
})
