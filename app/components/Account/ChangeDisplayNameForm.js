import React from "react";
import { StyleSheet, View } from "react-native";
import { Input, Button } from "react-native-elements";

import { auth } from "../../utils/firebase";

export default function ChangeDisplayNameForm(props) {
  const { displayName, setShowModal, setReloadUserInfo } = props;

  const [newDisplayName, setNewDisplayName] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const onSubmit = () => {
    setError(null);
    if (!newDisplayName) {
      setError("El nombre no puede estar vacio");
    } else if (displayName === newDisplayName) {
      setError("El nombre no puede ser igual al actual");
    } else {
      setIsLoading(true);
      const update = {
        displayName: newDisplayName,
      };
      auth.currentUser
        .updateProfile(update)
        .then(() => {
          setIsLoading(false);
          setReloadUserInfo(true);
          setShowModal(false);
        })
        .catch(() => {
          setIsLoading(false);
          setError("Error al actualizar el nombre");
        });
    }
  };

  return (
    <View style={styles.view}>
      <Input
        placeholder="Nombres y Apellidos"
        containerStyle={styles.input}
        rightIcon={{
          type: "material-community",
          name: "account-circle-outline",
          color: "#c2c2c2",
        }}
        defaultValue={displayName || ""} //if display name contains something or true, show it , if not print empty string
        onChange={(e) => setNewDisplayName(e.nativeEvent.text)}
        errorMessage={error}
      />
      <Button
        title="Cambiar Nombre"
        containerStyle={styles.btnContainer}
        buttonStyle={styles.btn}
        onPress={onSubmit}
        loading={isLoading}
      />
    </View>
  );
}

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
