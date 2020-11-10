import React, { useState, useEffect } from "react";
import { auth } from "../../utils/firebase";

import Loading from "../../components/Loading";
import UserGuest from "./UserGuest";
import UserLogged from "./UserLogged";

export default function Account() {
  const [login, setLogin] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      !user ? setLogin(false) : setLogin(true); //verify user is logged
    });
  }, []);

  if (login === null) return <Loading isVisible={true} text="Cargando..." />;

  return login ? <UserLogged /> : <UserGuest />;
}
