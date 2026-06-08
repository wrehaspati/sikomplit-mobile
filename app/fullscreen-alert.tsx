import successAnimation from "@/assets/images/success.json";
import ThemedButton from "@/components/themed-button";
import { ThemedText } from "@/components/themed-text";
import { RelativePathString, router, useLocalSearchParams } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useRef } from "react";
import { View } from "react-native";

export default function FullscreenAlertScreen() {
  const { title, description, type, buttonText, buttonHref } =
    useLocalSearchParams();
  const lottieRef = useRef<any>(null);
  const animation = type === "success" ? successAnimation : successAnimation;

  // Play lottie animation
  useEffect(() => {
    lottieRef.current?.play();
  }, []);
  if (!title || !type) {
    router.dismiss();
    return null;
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View
        style={{ width: "100%", alignItems: "center", paddingHorizontal: 24 }}
      >
        <LottieView
          ref={lottieRef}
          source={animation}
          autoPlay={false}
          loop={false}
          speed={0.7}
          onAnimationFinish={() => {
            setTimeout(() => lottieRef.current?.play(), 2000);
          }}
          style={{
            width: 250,
            height: 250,
            marginBottom: 8,
          }}
        />
        <View style={{ alignItems: "center" }}>
          <ThemedText type="title2">{title}</ThemedText>
          <ThemedText
            type="subheadline"
            style={{ textAlign: "center", marginTop: 8 }}
            darkColor={"#B0B0B0"}
            lightColor={"#606060"}
          >
            {description}
          </ThemedText>
        </View>
        <ThemedButton
          variant="primary"
          size="default"
          style={{ marginVertical: 40, justifyContent: "center", width: "70%" }}
          onPress={() => {
            router.dismissTo(buttonHref as RelativePathString);
          }}
          hitSlop={10}
        >
          {buttonText}
        </ThemedButton>
      </View>
    </View>
  );
}
