import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { Image, Icon, Button } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-easy-toast";

import { db, auth } from "../utils/firebase";
import Loading from "../components/Loading";

export default function Favorites(props) {
  const { navigation } = props;
  const [places, setPlaces] = React.useState(null);
  const [userLogged, setUserLogged] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [reloadData, setReloadData] = React.useState(false);
  const toastRef = React.useRef();

  //verify user logged
  auth.onAuthStateChanged((user) => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  //auto refresh if something change( in this case new fav or unfav)
  useFocusEffect(
    React.useCallback(() => {
      if (userLogged) {
        const idUser = auth.currentUser.uid;
        db.collection("favorites")
          .where("idUser", "==", idUser)
          .get()
          .then((response) => {
            const idPlaceArray = [];
            response.forEach((doc) => {
              idPlaceArray.push(doc.data().idPlace);
            });
            getPlaceData(idPlaceArray).then((response) => {
              // this is the promise resolved
              const places = [];
              response.forEach((doc) => {
                const place = doc.data();
                place.id = doc.id;
                places.push(place);
              });
              setPlaces(places);
            });
          });
      }
      setReloadData(false);
    }, [userLogged, reloadData])
  );

  //get places data
  const getPlaceData = (idPlaceArray) => {
    const arrayPlaces = [];
    idPlaceArray.forEach((idPlace) => {
      const result = db.collection("places").doc(idPlace).get();
      arrayPlaces.push(result); //we get an object with all data from each place iterate and push it into an array
    });
    return Promise.all(arrayPlaces); //we wait for this promise to be resolve
  };

  if (!userLogged) {
    return <UserNoLogged navigation={navigation} />;
  }

  if (places?.length === 0) {
    return <NotFundPlaces />;
  }

  return (
    <View style={styles.viewBody}>
      {places ? (
        <FlatList
          data={places}
          renderItem={(place) => (
            <Place
              place={place}
              setIsLoading={setIsLoading}
              toastRef={toastRef}
              setReloadData={setReloadData}
              navigation={navigation}
            />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      ) : (
        <View style={styles.loaderPlaces}>
          <ActivityIndicator size="large" color="#00ff00" />
          <Text style={{ textAlign: "center" }}>Cargando lugares</Text>
        </View>
      )}
      <Toast ref={toastRef} position="center" opacity={0.9} />
      <Loading isVisible={isLoading} text="Eliminando lugar" />
    </View>
  );
}

const NotFundPlaces = () => {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
        No tienes lugares en tu lista de favoritos
      </Text>
    </View>
  );
};

const UserNoLogged = (props) => {
  const { navigation } = props;

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <Icon type="material-community" name="alert-outline" size={50} />
      <Text style={{ fontSize: 20, fontWeight: "bold", textAlign: "center" }}>
        Necesitas estar logeado para ver esta sección
      </Text>
      <Button
        title="Ir al login"
        containerStyle={{ marginTop: 20, width: "80%" }}
        buttonStyle={{ backgroundColor: "#00a680" }}
        onPress={() => navigation.navigate("account", { screen: "login" })}
      />
    </View>
  );
};

const Place = (props) => {
  const { place, setIsLoading, toastRef, setReloadData, navigation } = props;
  const { name, images, id } = place.item;

  //ask confirm delete favorite place
  const confirmRemoveFavorite = () => {
    Alert.alert(
      "Eliminar lugar de favoritos",
      "¿Estas seguro que quieres eliminar el lugar de favoritos?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: removeFavorite,
        },
      ],
      {
        cancelable: false,
      }
    );
  };

  const removeFavorite = () => {
    setIsLoading(true);
    db.collection("favorites")
      .where("idPlace", "==", id)
      .where("idUser", "==", auth.currentUser.uid)
      .get()
      .then((response) => {
        response.forEach((doc) => {
          const idFavorite = doc.id;
          console.log(idFavorite);
          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsLoading(false);
              setReloadData(true);
              toastRef.current.show("Lugar eliminado correctamente");
            })
            .catch(() => {
              setIsLoading(false);
              toastRef.current.show("Error al eliminar el lugar");
            });
        });
      });
  };

  return (
    <View style={styles.place}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("places", {
            screen: "place",
            params: { id: id, name: name },
          })
        }
      >
        <Image
          resizeMode="cover"
          style={styles.image}
          PlaceholderContent={
            <ActivityIndicator size="large" color="#00ff00" />
          }
          source={
            //its an array, needs this configuration
            images[0]
              ? { uri: images[0] }
              : require("../../assets/img/no-image.png")
          }
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name.substr(0, 25)}...</Text>
          <Icon
            type="material-community"
            name="heart"
            color="#f00"
            containerStyle={styles.favorite}
            onPress={confirmRemoveFavorite}
            underlayColor="transparent"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loaderPlaces: {
    marginTop: 10,
    marginBottom: 10,
  },
  place: {
    margin: 10,
  },
  image: {
    width: "100%",
    height: 180,
  },
  info: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: -30,
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  name: {
    fontWeight: "bold",
    fontSize: 15,
  },
  favorite: {
    marginTop: -35,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 100,
  },
});
