import React from "react";
import { View, StyleSheet } from "react-native";
import { Button } from "react-native-elements";
import Toast from "react-native-easy-toast";
import { auth } from "../../utils/firebase";

import Loading from "../../components/Loading";
import InfoUser from "../../components/Account/InfoUser";
import AccountOptions from "../../components/Account/AccountOptions";

export default function UserLogged() {
  const [userInfo, setUserInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [loadingText, setLoadingText] = React.useState("");
  const [reloadUserInfo, setReloadUserInfo] = React.useState(false);
  const toastRef = React.useRef();

  React.useEffect(() => {
    //auto executable function -> ()()
    (async () => {
      const user = await auth.currentUser;
      setUserInfo(user);
    })();

    setReloadUserInfo(false); //restart state (second this)
  }, [reloadUserInfo]); //reload info when change (first this)

  return (
    <View style={styles.viewUserInfo}>
      {userInfo && (
        <InfoUser
          userInfo={userInfo}
          toastRef={toastRef}
          setLoading={setLoading}
          setLoadingText={setLoadingText}
        />
      )}
      {userInfo && (
        <AccountOptions
          userInfo={userInfo}
          toastRef={toastRef}
          setReloadUserInfo={setReloadUserInfo}
          userInfo={userInfo}
        />
      )}

      <Button
        title="Cerrar sesíon"
        buttonStyle={styles.btnCLoseSession}
        titleStyle={styles.btnCloseSessionText}
        onPress={() => auth.signOut()}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading text={loadingText} isVisible={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  viewUserInfo: {
    minHeight: "100%",
    backgroundColor: "#f2f2f2",
  },
  btnCLoseSession: {
    marginTop: 40,
    borderRadius: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e3e3e3",
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
    paddingTop: 10,
    paddingBottom: 10,
  },
  btnCloseSessionText: {
    color: "#00a680",
  },
});
