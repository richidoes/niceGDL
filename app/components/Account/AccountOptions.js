import React from "react";
import { StyleSheet, View } from "react-native";
import { ListItem } from "react-native-elements";
import { map } from "lodash";
import Modal from "../Modal";

import ChangeDisplayNameForm from "../Account/ChangeDisplayNameForm";
import ChangeEmailForm from "../Account/ChangeEmailForm";
import ChangePasswordForm from "../Account/ChangePasswordForm";

export default function AccountOptions(props) {
  const { userInfo, toastRef, setReloadUserInfo } = props;
  const { email } = props.userInfo;
  const [showModal, setShowModal] = React.useState(true);
  const [renderComponent, setRenderComponent] = React.useState(null);

  const selectedComponent = (key) => {
    switch (key) {
      case "displayName":
        setRenderComponent(
          <ChangeDisplayNameForm
            displayName={userInfo.displayName}
            setShowModal={setShowModal}
            toastRef={toastRef}
            setReloadUserInfo={setReloadUserInfo}
          />
        );
        setShowModal(true);
        break;
      case "email":
        setRenderComponent(
          <ChangeEmailForm
            email={userInfo.email}
            setShowModal={setShowModal}
            toastRef={toastRef}
            setReloadUserInfo={setReloadUserInfo}
          />
        );
        setShowModal(true);
        break;
      case "password":
        setRenderComponent(
          <ChangePasswordForm setShowModal={setShowModal} toastRef={toastRef} />
        );
        setShowModal(true);
        break;
      default:
        setRenderComponent(null);
        setShowModal(false);
        break;
    }
  };

  const menuOptions = generateOptions(selectedComponent);

  if (email) {
    return (
      <View>
        {map(menuOptions, (menu, index) => (
          <ListItem
            key={index}
            title={menu.title}
            leftIcon={{
              type: menu.iconType,
              name: menu.iconNameLeft,
              color: menu.iconColorLeft,
            }}
            rightIcon={{
              type: menu.iconType,
              name: menu.iconNameRight,
              color: menu.iconColorRight,
            }}
            containerStyle={styles.menuItem}
            onPress={menu.onPress}
          />
        ))}
        {renderComponent && (
          <Modal isVisible={showModal} setIsVisible={setShowModal}>
            {renderComponent}
          </Modal>
        )}
      </View>
    );
  } else {
    return null;
  }
}

const generateOptions = (selectedComponent) => [
  {
    title: "Cambiar Nombre y Apellido",
    iconType: "material-community",
    iconNameLeft: "account-circle",
    iconColorLeft: "#ccc",
    iconNameRight: "chevron-right",
    iconColorRight: "#ccc",
    onPress: () => selectedComponent("displayName"),
  },
  {
    title: "Cambiar Email",
    iconType: "material-community",
    iconNameLeft: "at",
    iconColorLeft: "#ccc",
    iconNameRight: "chevron-right",
    iconColorRight: "#ccc",
    onPress: () => selectedComponent("email"),
  },
  {
    title: "Cambiar contraseña",
    iconType: "material-community",
    iconNameLeft: "lock-reset",
    iconColorLeft: "#ccc",
    iconNameRight: "chevron-right",
    iconColorRight: "#ccc",
    onPress: () => selectedComponent("password"),
  },
];

const styles = StyleSheet.create({
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#e3e3e3",
  },
});
