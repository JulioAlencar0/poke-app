import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const attributeColors: Record<string, string> = {
  Data: "#60A5FA",
  Vaccine: "#34D399",
  Virus: "#F87171",
  Free: "#A78BFA",
  Unknown: "#9CA3AF",
};

type DigimonData = {
  id: number;
  name: string;
  image: string;
  level: string;
  attribute: string;
  type: string;
  description: string;
};

// 🔹 Busca com detalhes completos
const fetchDigimons = async (page = 0) => {
  const res = await fetch(`https://digi-api.com/api/v1/digimon?page=${page}`);
  const data = await res.json();

  const results = await Promise.all(
    data.content.map(async (d: any) => {
      try {
        const detailRes = await fetch(d.href);
        const detail = await detailRes.json();

        return {
          id: detail.id,
          name: detail.name,
          image:
            detail.images && detail.images.length > 0
              ? detail.images[0].href
              : "",
          level:
            detail.levels && detail.levels.length > 0
              ? detail.levels[0].level
              : "Nível desconhecido",
          attribute:
            detail.attributes && detail.attributes.length > 0
              ? detail.attributes[0].attribute
              : "Atributo desconhecido",
          type:
            detail.types && detail.types.length > 0
              ? detail.types[0].type
              : "Tipo desconhecido",
          description:
            detail.descriptions && detail.descriptions.length > 0
              ? detail.descriptions[0].description
              : "Sem descrição disponível.",
        };
      } catch (err) {
        return {
          id: d.id,
          name: d.name,
          image: "",
          level: "Nível desconhecido",
          attribute: "Atributo desconhecido",
          type: "Tipo desconhecido",
          description: "Sem descrição disponível.",
        };
      }
    })
  );

  return results;
};

export default function Index() {
  const [searchText, setSearchText] = useState("");
  const [digimons, setDigimons] = useState<DigimonData[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadDigimons(true);
  }, []);

  const loadDigimons = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    const nextPage = reset ? 0 : page + 1;
    const results = await fetchDigimons(nextPage);
    setDigimons((prev) => (reset ? results : [...prev, ...results]));
    setPage(nextPage);
    setHasMore(results.length > 0);
    setLoading(false);
  };

  const handleSearch = async () => {
    if (searchText.trim() === "") {
      await loadDigimons(true);
      return;
    }

    try {
      const normalized = searchText.toLowerCase();
      const res = await fetch(`https://digi-api.com/api/v1/digimon/${normalized}`);
      const data = await res.json();

      const result: DigimonData = {
        id: data.id,
        name: data.name,
        image: data.images?.[0]?.href || "",
        level: data.levels?.[0]?.level || "Nível desconhecido",
        attribute: data.attributes?.[0]?.attribute || "Atributo desconhecido",
        type: data.types?.[0]?.type || "Tipo desconhecido",
        description:
          data.descriptions?.[0]?.description || "Sem descrição disponível.",
      };
      setDigimons([result]);
      setHasMore(false);
    } catch {
      setDigimons([]);
    }
  };

  const toggleSearch = () => {
    Animated.timing(animation, {
      toValue: searchVisible ? 0 : 1,
      duration: 400,
      useNativeDriver: false,
    }).start();

    if (searchVisible) Keyboard.dismiss();
    setSearchVisible(!searchVisible);
  };

  const inputTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });

  const inputOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderItem = ({ item }: { item: DigimonData }) => (
    <Animated.View
      style={[
        styles.card,
        {
          borderColor: attributeColors[item.attribute] || "#ccc",
          shadowColor: attributeColors[item.attribute] || "#000",
        },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="contain"
        transition={300}
      />
      <Text style={styles.name}>{item.name}</Text>

      <View style={styles.badgesContainer}>
        <Text
          style={[
            styles.badge,
            { backgroundColor: attributeColors[item.attribute] || "#ccc" },
          ]}
        >
          {item.attribute}
        </Text>
        <Text style={[styles.badge, { backgroundColor: "#222" }]}>
          {item.level}
        </Text>
      </View>

      <Text style={styles.description} numberOfLines={4}>
        {item.description}
      </Text>

      <Text style={styles.typeText}>{item.type}</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <StatusBar barStyle="light-content" />
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <TouchableOpacity style={styles.searchIcon} onPress={toggleSearch}>
          <Ionicons name="search" size={28} color="#fff" />
        </TouchableOpacity>

        <Animated.View
          style={[
            styles.inputContainer,
            {
              transform: [{ translateY: inputTranslateY }],
              opacity: inputOpacity,
            },
          ]}
        >
          <TextInput
            placeholder="Buscar Digimon..."
            placeholderTextColor="#aaa"
            style={styles.input}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
        </Animated.View>
      </View>

      <FlatList
        data={digimons}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ padding: 12 }}
        onEndReached={() => hasMore && !loading && loadDigimons()}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loading ? (
            <Text style={{ textAlign: "center", margin: 20, color: "#555" }}>
              Carregando Digimons...
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  header: {
    backgroundColor: "#ff9900ff",
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderRadius: 10,
  },
  logo: {
    width: 190,
    height: 190,
    position: "absolute",
    top: -20,
    opacity: 0.9,
  },
  searchIcon: {
    position: "absolute",
    right: 20,
    top: 60,
  },
  inputContainer: {
    position: "absolute",
    bottom: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: "90%",
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  input: {
    fontSize: 16,
    color: "#000",
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    margin: 8,
    padding: 12,
    borderWidth: 1,
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  image: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 6,
  },
  badgesContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 6,
  },
  badge: {
    color: "#fff",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    textAlign: "center",
    overflow: "hidden",
  },
  description: {
    color: "#ddd",
    fontSize: 11,
    textAlign: "center",
    marginBottom: 4,
  },
  typeText: {
    fontSize: 10,
    textAlign: "center",
    color: "#9ca3af",
  },
});
