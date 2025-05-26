import { View } from "react-native";

type SpacerProps = {
    size: number
}

const Spacer = ({size}: SpacerProps) => <View style={{height: size, width: size}} />

export {Spacer}
