import React from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-easy-toast";

import Loading from "../../components/Loading";
import AddPlaceForm from "../../components/Places/AddPlaceForm";

export default function AddPlace(props) {
  const { navigation } = props;
  const toastRef = React.useRef();
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <View>
      <AddPlaceForm
        toastRef={toastRef}
        setIsLoading={setIsLoading}
        navigation={navigation}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading isVisible={isLoading} text="Creando lugar" />
    </View>
  );
}

const styles = StyleSheet.create({});
