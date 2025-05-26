import { View } from "react-native";

type SpacerProps = {
    size: number
}

const SpacerY = ({size}: SpacerProps) => <View style={{height: size}} />
const SpacerX = ({size}: SpacerProps) => <View style={{width: size}} />

const Spacer = {Y: SpacerY, X: SpacerX}

export {Spacer}
