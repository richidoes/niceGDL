import React from "react";
import { StyleSheet, Text, View, ScrollView, Dimensions } from "react-native";
import { Rating, ListItem, Icon } from "react-native-elements";
import { map } from "lodash";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-easy-toast";

import { auth, db } from "../../utils/firebase";
import Loading from "../../components/Loading";
import CarouselImages from "../../components/Carousel";
import Map from "../../components/Map";
import ListReviews from "../../components/Places/ListReviews";

const screenWidth = Dimensions.get("window").width;

export default function Place(props) {
  const { navigation, route } = props;
  const { name, id } = route.params;
  const [valueName, setValueName] = React.useState(name);
  const [place, setPlace] = React.useState(null);
  const [rating, setRating] = React.useState(0);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [userLogged, setUserLogged] = React.useState(false);
  const [reloadData, setReloadData] = React.useState(false);
  const toastRef = React.useRef();

  //verify user is logged
  auth.onAuthStateChanged((user) => {
    user ? setUserLogged(true) : setUserLogged(false);
  });

  /*suggested by https://reactnavigation.org/docs/navigation-prop#setoptions use this way because using only => navigation.setOptions({title: name, }); will cause this Warning: Cannot update a component from inside the function body of a different */
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: valueName,
    });
  }, [navigation, valueName]);

  //get data from place selected, and update every time we enter here (focusEffect)
  useFocusEffect(
    React.useCallback(() => {
      db.collection("places")
        .doc(id)
        .get()
        .then((response) => {
          const data = response.data();
          data.id = response.id; //give id
          setPlace(data);
          setRating(data.rating); //store rating points in state
        });
      setReloadData(false);
    }, [reloadData])
  );

  React.useEffect(() => {
    if (userLogged && place) {
      db.collection("favorites")
        .where("idPlace", "==", place.id)
        .where("idUser", "==", auth.currentUser.uid)
        .get()
        .then((response) => {
          if (response.docs.length === 1) {
            setIsFavorite(true);
          }
        });
    }
  }, [userLogged, place]);

  const addFavorite = () => {
    if (!userLogged) {
      toastRef.current.show(
        "Para usar el sistema de favoritos tienes que estar logeado"
      );
    } else {
      const payload = {
        idUser: auth.currentUser.uid,
        idPlace: place.id,
      };
      db.collection("favorites")
        .add(payload)
        .then(() => {
          setIsFavorite(true);
          toastRef.current.show("Lugar añadido a favoritos");
        })
        .catch(() => {
          toastRef.current.show("Error al añadido lugar a favoritos");
        });
    }
  };

  const removeFavorite = () => {
    db.collection("favorites")
      .where("idPlace", "==", place.id)
      .where("idUser", "==", auth.currentUser.uid)
      .get()
      .then((response) => {
        response.forEach((doc) => {
          const idFavorite = doc.id;

          db.collection("favorites")
            .doc(idFavorite)
            .delete()
            .then(() => {
              setIsFavorite(false);
              toastRef.current.show("Lugar eliminado de favoritos");
            })
            .catch(() => {
              toastRef.current.show("Error al eliminado lugar de favoritos");
            });
        });
      });
  };

  if (!place) return <Loading isVisible={true} text="Cargando..." />;

  return (
    <ScrollView vertical style={styles.viewBody}>
      <View style={styles.viewFavorites}>
        <Icon
          type="material-community"
          name={isFavorite ? "heart" : "heart-outline"}
          onPress={isFavorite ? removeFavorite : addFavorite}
          color={isFavorite ? "#f00" : "#000"}
          size={35}
          underlayColor="transparent"
        />
      </View>
      <CarouselImages
        arrayImages={place.images}
        height={250}
        width={screenWidth}
      />
      <TitlePlace
        name={place.name}
        description={place.description}
        rating={place.rating}
      />
      <PlaceInfo
        location={place.location}
        name={place.name}
        address={place.address}
      />
      <ListReviews
        navigation={navigation}
        idPlace={place.id}
        toastRef={toastRef}
        reloadData={reloadData}
        setReloadData={setReloadData}
      />
      <Toast ref={toastRef} position="center" opacity={0.9} />
    </ScrollView>
  );
}

const TitlePlace = (props) => {
  const { name, description, rating } = props;

  return (
    <View style={styles.viewPlaceTitle}>
      <View>
        <Rating
          style={styles.rating}
          imageSize={25}
          readonly
          startingValue={parseFloat(rating)}
        />
        <Text style={styles.nameplace}>{name}</Text>
      </View>
      <Text style={styles.descriptionPlace}>{description}</Text>
    </View>
  );
};

const PlaceInfo = (props) => {
  const { location, name, address } = props;

  const listInfo = [
    {
      text: address,
      iconName: "map-marker",
      iconType: "material-community",
      action: null,
    },
  ];

  return (
    <View style={styles.viewPlaceInfo}>
      <Text style={styles.placeInfoTitle}>Informacion sobre el lugar</Text>

      <Map location={location} name={name} height={100} />

      {map(listInfo, (item, index) => (
        <ListItem
          key={index}
          title={item.text}
          leftIcon={{
            name: item.iconName,
            type: item.iconType,
            color: "#00a680",
          }}
          containerStyle={styles.containerListItem}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  viewBody: {
    flex: 1,
    backgroundColor: "#fff",
  },
  viewPlaceTitle: {
    marginTop: -35,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 25,
  },
  nameplace: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 30,
  },
  descriptionPlace: {
    marginTop: 5,
    color: "grey",
  },
  rating: {
    position: "absolute",
    right: 0,
  },
  viewPlaceInfo: {
    margin: 15,
    marginTop: 25,
  },
  placeInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  containerListItem: {
    borderBottomColor: "#d8d8d8",
    borderBottomWidth: 1,
  },
  viewFavorites: {
    position: "absolute",
    top: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 100,
    padding: 5,
    paddingLeft: 15,
  },
});
