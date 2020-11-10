import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-easy-toast";

import LoginForm from "../../components/Account/LoginForm";

export default function Login() {
  const toastRef = React.useRef();

  return (
    <ScrollView>
      <Image
        source={require("../../../assets/img/logoniceGDL.png")}
        resizeMode="contain"
        style={styles.logo}
      />
      <View style={styles.viewContainer}>
        <LoginForm toastRef={toastRef} />
        <CreateAccount />
      </View>
      <Toast ref={toastRef} position="center" opasity={0.9} />
    </ScrollView>
  );
}

const CreateAccount = () => {
  const navigation = useNavigation();

  return (
    <Text style={styles.textRegister}>
      ¿Aún no tienes cuenta?{" " /*Just an space*/}
      <Text
        style={styles.btnRegister}
        onPress={() => navigation.navigate("register")}
      >
        Registrate
      </Text>
    </Text>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: "100%",
    height: 180,
    marginTop: 20,
  },
  viewContainer: {
    marginRight: 40,
    marginLeft: 40,
  },
  textRegister: {
    marginTop: 15,
    marginLeft: 10,
    marginRight: 10,
  },
  btnRegister: {
    color: "#00a680",
    fontWeight: "bold",
  },
  divider: {
    backgroundColor: "#00a680",
    margin: 20,
  },
});
