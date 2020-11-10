import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Input, Button } from "react-native-elements";
import { size } from "lodash";

import { reAuthenticate } from "../../utils/api";
import { auth } from "../../utils/firebase";

export default function ChangePasswordForm(props) {
  const { setShowModal, toastRef } = props;
  const [showPass, setShowPass] = React.useState(false);
  const [formData, setFormData] = React.useState(defaultValue());
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsloading] = React.useState(false);

  const onChange = (e, type) => {
    setFormData({ ...formData, [type]: e.nativeEvent.text });
  };

  const onSubmit = async () => {
    let isSetErrors = true;
    let errorsTemp = {};
    setErrors({}); //clean in case has something
    if (
      !formData.password ||
      !formData.newPassword ||
      !formData.repeatNewPassword
    ) {
      errorsTemp = {
        //another way to set errros
        password: !formData.password
          ? "La contraseña no puede estar vacia"
          : "",
        newPassword: !formData.newPassword
          ? "La contraseña no puede estar vacia"
          : "",
        repeatNewPassword: !formData.repeatNewPassword
          ? "La contraseña no puede estar vacia"
          : "",
      };
    } else if (formData.newPassword !== formData.repeatNewPassword) {
      errorsTemp = {
        newPassword: "Las contraseñas no son iguales",
        repeatNewPassword: "Las contraseñas no son iguales",
      };
    } else if (size(formData.newPassword) < 6) {
      errorsTemp = {
        newPassword: "La contraseña tiene que ser mayor a 5 caracteres.",
        repeatNewPassword: "La contraseña tiene que ser mayor a 5 caracteres.",
      };
    } else {
      //if all good, start process of password change
      setIsloading(true);
      await reAuthenticate(formData.password) //await confirm pass is correct
        .then(async () => {
          await auth.currentUser
            .updatePassword(formData.newPassword)
            .then(() => {
              isSetErrors = false; //set that it will not be errors
              setIsloading(false);
              setShowModal(false);
              auth.signOut();
            })
            .catch((err) => {
              console.log(err);
              errorsTemp = {
                other: "Error al actualizar la contraseña",
              };
              setIsloading(false);
            });
        })
        .catch(() => {
          setIsloading(false);
          errorsTemp = {
            password: "La contraseña no es correcta",
          };
        });
    }
    isSetErrors && setErrors(errorsTemp); // puting isSetErrors here avoid error that saids this state still works even while the component is unmounted (because we signout the user and sent to register screen), so to fix this , we put another state that validates in the promises if aplies or not.
  };

  return (
    <View style={styles.view}>
      <Input
        placeholder="Contraseña actual"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={showPass ? false : true}
        rightIcon={{
          type: "material-community",
          name: showPass ? "eye-off-outline" : "eye-outline",
          color: "#c2c2c2",
          onPress: () => setShowPass(!showPass),
        }}
        onChange={(e) => onChange(e, "password")}
        errorMessage={errors.password}
      />
      <Input
        placeholder="Nueva contraseña"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={showPass ? false : true}
        rightIcon={{
          type: "material-community",
          name: showPass ? "eye-off-outline" : "eye-outline",
          color: "#c2c2c2",
          onPress: () => setShowPass(!showPass),
        }}
        onChange={(e) => onChange(e, "newPassword")}
        errorMessage={errors.newPassword}
      />
      <Input
        placeholder="Repetir nueva contraseña"
        containerStyle={styles.input}
        password={true}
        secureTextEntry={showPass ? false : true}
        rightIcon={{
          type: "material-community",
          name: showPass ? "eye-off-outline" : "eye-outline",
          color: "#c2c2c2",
          onPress: () => setShowPass(!showPass),
        }}
        onChange={(e) => onChange(e, "repeatNewPassword")}
        errorMessage={errors.repeatNewPassword}
      />
      <Button
        title="Cambiar contraseña"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
      <Text>{errors.other}</Text>
    </View>
  );
}

const defaultValue = () => {
  return {
    password: "",
    newPassword: "",
    repeatNewPassword: "",
  };
};

const styles = StyleSheet.create({
  view: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  btnContainer: {
    marginTop: 20,
    width: "95%",
  },
  btn: {
    backgroundColor: "#00a680",
  },
});
