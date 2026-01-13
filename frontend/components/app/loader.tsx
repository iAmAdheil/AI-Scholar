import { useEffect } from "react";
import { View, Image } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
} from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";

export default function Loader({ theme }: { theme: "dark" | "light" }) {
  const translateY = useSharedValue(200);

  useEffect(() => {
    // Define the animation: move to y: 500 and back to y: 0
    translateY.value = withRepeat(
      withSequence(
        // withTiming(160, { duration: 2500 }), // Move down 100pxw
        withTiming(0, { duration: 2500 }), // Move back to 0
        withTiming(200, { duration: 2500 }), // Move up 100px
      ),
      -1, // Infinite loop
      true, // Do not reverse
    );
  }, []);

  // Animated style for the white bar
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <MaskedView
      androidRenderingMode="software"
      style={{
        flexDirection: "row",
        height: 250,
      }}
      maskElement={
        <View
          style={{
            height: 250,
            backgroundColor: "transparent",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("@/assets/new-images/logo.png")}
            className="w-52 h-52"
          />
        </View>
      }
    >
      <View
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          height: "100%",
          width: "100%",
          backgroundColor: theme === "dark" ? "#1c1c1c" : "#dbdbdb",
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute", // Ensure the bar is positioned over the image
              width: "100%",
              height: 30,
              borderRadius: 2,
              backgroundColor: "#999999",
              zIndex: 10, // Place above the image
            },
            animatedStyle, // Apply the animated style
          ]}
        />
      </View>
    </MaskedView>
  );
}