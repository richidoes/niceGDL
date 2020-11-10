import React from "react";
import { LogBox } from "react-native";
import Navigation from "./app/navigations/Navigation";
import { decode, encode } from "base-64";

LogBox.ignoreLogs(["Setting a timer"]);
LogBox.ignoreLogs([
  "Animated: `useNativeDriver` was not specified. This is a required option and must be explicitly set to `true` or `false`",
]);
LogBox.ignoreAllLogs(true);

if (!global.btoa) global.btoa = encode;
if (!global.atob) global.atob = decode;

export default function App() {
  return <Navigation />;
}
