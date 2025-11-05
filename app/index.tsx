import EvilIcons from "@expo/vector-icons/EvilIcons";
import axios from "axios";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const [modalVisible, setModalVisible] = useState(false);
  const [digimons, setDigimons] = useState([]);

  const fetchDigimons = async () => {
    try {
      const response = await axios.get("https://digi-api.com/api/v1/digimon");
      setDigimons(response.data.content.slice(0, 10));
      console.log(response.data.content[0]); // pra testar
    } catch (err) {
      console.log("Erro ao buscar digimons:", err);
    }
  };

  useEffect(() => {
    fetchDigimons();
  }, []);


  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={styles.header}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
        />

        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setModalVisible(true)}
        >
          <EvilIcons name="search" size={36} color="white" />
        </TouchableOpacity>
      </View>

    
      <View style={styles.container}>
        <Text style={styles.text}> Layout base do app </Text>
      </View>

    
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>🔍 Pesquisar Digimon</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f7dc9a",
  },
  header: {
    width: "100%",
    backgroundColor: "#FFA500",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 10 : 50,
    height: 130 + (Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0),
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: "contain",
  },
  searchButton: {
    position: "absolute",
    right: 20,
    top: "100%",
    transform: [{ translateY: -6 }],
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f7dc9a",
  },
  text: {
    fontSize: 18,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    width: 300,
  },
  modalText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#FFA500",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
