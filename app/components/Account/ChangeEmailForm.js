import React from "react";
import { StyleSheet, View } from "react-native";
import { Input, Button } from "react-native-elements";

import { validateEmail } from "../../utils/Validations";
import { reAuthenticate } from "../../utils/api";
import { auth } from "../../utils/firebase";

export default function ChangeEmailForm(props) {
  const { email, setShowModal, toastRef, setReloadUserInfo } = props;

  const [formData, setFormData] = React.useState(defaultValue);
  const [showPass, setShowPass] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);

  const onChange = (e, type) => {
    setFormData({ ...formData, [type]: e.nativeEvent.text });
  };

  const onSubmit = () => {
    setErrors({});
    if (!formData.email || email === formData.email) {
      setErrors({
        email: "El email no ha cambiado",
      });
    } else if (!validateEmail(formData.email)) {
      setErrors({
        email: "Email incorrecto",
      });
    } else if (!formData.password) {
      setErrors({
        password: "La contraseña no puede estar vacia",
      });
    } else {
      setIsLoading(true);
      reAuthenticate(formData.password)
        .then(() => {
          auth.currentUser
            .updateEmail(formData.email)
            .then(() => {
              setIsLoading(false);
              setReloadUserInfo(true);
              toastRef.current.show("Email actualizado correctamente");
              setShowModal(false);
            })
            .catch(() => {
              setErrors({ email: "Error al actualizar el email" });
              setIsLoading(false);
            });
        })
        .catch(() => {
          setIsLoading(false);
          setErrors({
            password: "La contraseña no es correcta",
          });
        });
    }
  };

  return (
    <View style={styles.view}>
      <Input
        placeholder="Correo electronico"
        containerStyle={styles.input}
        defaultValue={email || ""} //if return nothing, set empty
        rightIcon={{
          type: "material-community",
          name: "at",
          color: "#c2c2c2",
        }}
        onChange={(e) => onChange(e, "email")}
        errorMessage={errors.email}
      />
      <Input
        placeholder="Contraseña"
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
      <Button
        title="Cambiar email"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}

const defaultValue = () => {
  return {
    email: "",
    password: "",
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
