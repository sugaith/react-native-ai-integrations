import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Message, MessageProps } from 'react-native-gifted-chat'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { IMessageLike } from './ChatScreen'
import { MYSELF_USER } from 'src/utils'
import { View } from 'react-native'

const AnimatedHeart = Animated.createAnimatedComponent(View)

type MessageBubbleProps = MessageProps<IMessageLike> & {
  toggleLikeAction: (msg: IMessageLike) => void
}

function MessageBubble({ toggleLikeAction, ...rest }: MessageBubbleProps) {
  const { currentMessage } = rest
  const shouldShowLikeButton = currentMessage.user._id !== MYSELF_USER._id

  const scale = useSharedValue(1)
  const showLike = useSharedValue(!!currentMessage.like)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: withSpring(showLike.value ? 1 : 0),
  }))

  const doubleTapHandler = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      toggleLikeAction(currentMessage)
      if (!currentMessage.like) {
        scale.value = withSpring(1.5, {}, () => {
          scale.value = withSpring(1)
        })
        showLike.value = true
      } else {
        showLike.value = false
        scale.value = withSpring(1)
      }
    })
    .runOnJS(true)

  return (
    <GestureDetector gesture={doubleTapHandler}>
      <View backgroundColor={'$background05'}>
        <Message {...rest} />
        {shouldShowLikeButton ? (
          <AnimatedHeart
            style={animatedStyle}
            position="absolute"
            right="$9"
            bottom="$3"
          >
            <View style={{ backgroundColor: 'red', width: 10, height: 10 }} />
          </AnimatedHeart>
        ) : null}
      </View>
    </GestureDetector>
  )
}

export type { MessageBubbleProps }
export { MessageBubble }
