import React from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { Overlay } from "react-native-elements";

export default function Loading(props) {
  const { isVisible, text } = props;

  return (
    <Overlay
      isVisible={isVisible}
      windowBackgroundColor="rgba(0,0,0,0.5)"
      overlayBackgroundColor="transparent"
      overlayStyle={Styles.overlay}
    >
      <View style={Styles.view}>
        <ActivityIndicator size="large" color="#00a680" />
        {text && <Text style={Styles.text}>{text}</Text>}
      </View>
    </Overlay>
  );
}

const Styles = StyleSheet.create({
  overlay: {
    height: 150,
    width: 250,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  view: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontWeight: "bold",
    color: "#00a680",
    textTransform: "uppercase",
    marginTop: 10,
  },
});
