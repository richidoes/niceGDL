import * as firebase from "firebase";

export function reAuthenticate(password) {
  //get current user
  const user = firebase.auth().currentUser;
  //get credentials
  const credentials = firebase.auth.EmailAuthProvider.credential(
    user.email,
    password
  );
  //if data is ok , reauthenticate with crendentials
  return user.reauthenticateWithCredential(credentials);
}
