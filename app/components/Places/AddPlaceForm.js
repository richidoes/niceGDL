import React from "react";
import { StyleSheet, View, ScrollView, Alert, Dimensions } from "react-native";
import { Icon, Avatar, Image, Input, Button } from "react-native-elements";
import { map, size, filter } from "lodash";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import uuid from "random-uuid-v4";

import { firebase, db, auth } from "../../utils/firebase";
import Modal from "../Modal";

const widthScreen = Dimensions.get("window").width;

export default function AddPlaceForm(props) {
  const { toastRef, setIsLoading, navigation } = props;
  const [placeName, setPlaceName] = React.useState("");
  const [placeAddress, setPlaceAddress] = React.useState("");
  const [placeDescription, setPlaceDescription] = React.useState("");
  const [imageSelected, setImageSelected] = React.useState([]);
  const [isVisibleMap, setIsVisibleMap] = React.useState(false);
  const [locationPlace, setLocationPlace] = React.useState(null);

  const addPlace = () => {
    if (!placeName || !placeAddress || !placeDescription) {
      toastRef.current.show("Todos los campos los campos son obligatorios");
    } else if (size(imageSelected) === 0) {
      toastRef.current.show("El lugar tiene que tener al menos una foto");
    } else if (!locationPlace) {
      toastRef.current.show("Tienes que localizar el lugar");
    } else {
      setIsLoading(true);
      uploadImageStorage().then((response) => {
        //save our posted place in db with this attributes
        db.collection("places")
          .add({
            name: placeName,
            address: placeAddress,
            description: placeDescription,
            location: locationPlace,
            images: response,
            rating: 0,
            ratingTotal: 0,
            quantityVoting: 0,
            createAt: new Date(),
            createBy: auth.currentUser.uid,
          })
          .then(() => {
            setIsLoading(false);
            navigation.navigate("places");
          })
          .catch(() => {
            setIsLoading(false);
            toastRef.current.show(
              "Error al publicar su lugar, intentelo mas tarde"
            );
          });
      });
    }
  };

  const uploadImageStorage = async () => {
    const imageBlob = [];

    await Promise.all(
      map(imageSelected, async (image) => {
        const response = await fetch(image);

        //convert image in format blob(need it in this format to storage)
        const blob = await response.blob();

        // then create the route reference to storage directory and generate uuid for identification
        const ref = firebase.storage().ref("places").child(uuid());

        //send image to database storage
        await ref.put(blob).then(async (result) => {
          await firebase
            .storage()
            .ref(`places/${result.metadata.name}`)
            .getDownloadURL()
            .then((photoURL) => {
              imageBlob.push(photoURL); //request the image and store in a const for use in app
            });
        });
      })
    );
    return imageBlob;
  };

  return (
    <ScrollView style={styles.scrollView}>
      <ImagePlace imagePlace={imageSelected[0]} />
      <FormAdd
        setPlaceName={setPlaceName}
        setPlaceAddress={setPlaceAddress}
        setPlaceDescription={setPlaceDescription}
        setIsVisibleMap={setIsVisibleMap}
        locationPlace={locationPlace}
      />
      <UploadImage
        toastRef={toastRef}
        imageSelected={imageSelected}
        setImageSelected={setImageSelected}
      />
      <Button
        title="Crear lugar"
        onPress={addPlace}
        buttonStyle={styles.btnAddPlace}
      />
      <Map
        isVisibleMap={isVisibleMap}
        setIsVisibleMap={setIsVisibleMap}
        toastRef={toastRef}
        setLocationPlace={setLocationPlace}
      />
    </ScrollView>
  );
}

const FormAdd = (props) => {
  const {
    setPlaceName,
    setPlaceAddress,
    setPlaceDescription,
    setIsVisibleMap,
    locationPlace,
  } = props;
  return (
    <View style={styles.viewForm}>
      <Input
        placeholder="Nombre del lugar"
        containerStyle={styles.input}
        onChange={(e) => setPlaceName(e.nativeEvent.text)}
      />
      <Input
        placeholder="Dirección"
        containerStyle={styles.input}
        onChange={(e) => setPlaceAddress(e.nativeEvent.text)}
        rightIcon={{
          type: "material-community",
          name: "google-maps",
          color: locationPlace ? "#00a680" : "#c2c2c2",
          onPress: () => setIsVisibleMap(true),
        }}
      />
      <Input
        placeholder="Descripcion del lugar"
        multiline={true}
        inputContainerStyle={styles.textArea}
        onChange={(e) => setPlaceDescription(e.nativeEvent.text)}
      />
    </View>
  );
};

const UploadImage = (props) => {
  const { toastRef, setImageSelected, imageSelected } = props;

  const imageSelect = async () => {
    const resultPermissions = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );

    if (resultPermissions === "denied") {
      toastRef.current.show(
        "Es necesario aceptar los permisos de la galeria, si los has rechazado tienes que ir a ajustes y activarlos manualmente.",
        3000
      ); //timer
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
      if (result.cancelled) {
        toastRef.current.show(
          "Has cerrado la galeria sin seleccionar una imagen",
          2000
        );
      } else {
        setImageSelected([...imageSelected, result.uri]);
      }
    }
  };

  const removeImage = (image) => {
    Alert.alert(
      "Eliminar Imagen",
      "¿Estas seguro de que quieres eliminar la imagen?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: () => {
            setImageSelected(
              //iterates and returns the images as long as isn't the selected, that will create a new array for the map function refreshing the preview images to post, without the selected image because it will be deleted
              filter(imageSelected, (imageURL) => imageURL !== image)
            );
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.viewImages}>
      {
        size(imageSelected) < 4 && (
          <Icon
            type="material-community"
            name="camera"
            color="#7a7a7a"
            size={40}
            containerStyle={styles.containerIcon}
            onPress={imageSelect}
          />
        ) /*set a limit for upload image and hide btn when reach the limit*/
      }

      {
        map(imageSelected, (imagePlace, index) => (
          <Avatar
            key={index}
            style={styles.miniatureStyle}
            rounded
            source={{ uri: imagePlace }}
            onPress={() => removeImage(imagePlace)}
          />
        ))
        /* map a preview of the image we want to post */
      }
    </View>
  );
};

//set background photo taking the first image the client select
const ImagePlace = (props) => {
  const { imagePlace } = props;

  return (
    <View style={styles.viewPhoto}>
      <Image
        source={
          //set default image if user not upload one
          imagePlace
            ? {
                uri: imagePlace,
              }
            : require("../../../assets/img/no-image.png")
        }
        style={{ width: widthScreen, height: 200 }}
      />
    </View>
  );
};

//shows native map app from phone, so client can set the place location
const Map = (props) => {
  const { isVisibleMap, setIsVisibleMap, toastRef, setLocationPlace } = props;

  const [location, setLocation] = React.useState(null);

  React.useEffect(() => {
    //auto executable function - get location of user
    (async () => {
      const resultPermissions = await Permissions.askAsync(
        Permissions.LOCATION
      );
      const statusPermissions = resultPermissions.permissions.location.status;
      if (statusPermissions !== "granted") {
        toastRef.current.show(
          "Tienes que aceptar los permisos de localizacion para publicar un lugar",
          3000
        );
      } else {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
      }
    })();
  }, []);

  const confirmLocation = () => {
    setLocationPlace(location);
    toastRef.current.show("Localizacion guardada correctamente");
    setIsVisibleMap(false);
  };

  return (
    <Modal isVisible={isVisibleMap} setIsVisible={setIsVisibleMap}>
      <View>
        {location && (
          <MapView
            style={styles.mapStyle}
            initialRegion={location}
            showsUserLocation={true}
            onRegionChange={(region) => setLocation(region)} //when move around the map coordinates will update immediately at location
          >
            <MapView.Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              draggable
            ></MapView.Marker>
          </MapView>
        )}
        <View style={styles.viewMapBtn}>
          <Button
            title="Cancelar Ubicacion"
            containerStyle={styles.viewMapBtnContainerCancel}
            buttonStyle={styles.viewMapBtnCancel}
            onPress={() => setIsVisibleMap(false)}
          />
          <Button
            title="Guardar Ubicacion"
            containerStyle={styles.viewMapBtnContainerSave}
            buttonStyle={styles.viewMapBtnSave}
            onPress={confirmLocation}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    height: "100%",
  },
  viewForm: {
    marginLeft: 10,
    marginRight: 10,
  },
  input: {
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    width: "100%",
    padding: 0,
    margin: 0,
  },
  btnAddPlace: {
    backgroundColor: "#00a680",
    margin: 20,
  },
  viewImages: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    marginTop: 30,
  },
  containerIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    height: 70,
    width: 70,
    borderRadius: 10,
    backgroundColor: "#e3e3e3",
  },
  miniatureStyle: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  viewPhoto: {
    alignItems: "center",
    height: 200,
    marginBottom: 20,
  },
  mapStyle: {
    width: "100%",
    height: 550,
  },
  viewMapBtn: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  viewMapBtnContainerCancel: {
    paddingRight: 5,
  },
  viewMapBtnCancel: {
    backgroundColor: "#a60d0d",
  },
  viewMapBtnContainerSave: {
    paddingLeft: 5,
  },
  viewMapBtnSave: {
    backgroundColor: "#00a680",
  },
});
