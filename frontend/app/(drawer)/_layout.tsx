import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "@/components/app/sidebar";
import { StyleSheet, TouchableOpacity } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useRouter } from "expo-router";

export default function DrawerLayout() {
  return (
    <Drawer
      initialRouteName="index"
      drawerContent={(props) => <CustomDrawerContent props={props} />}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: "",
          headerShown: true,
          headerRight: () => <Settings />,
          headerRightContainerStyle: {
            paddingRight: 15,
            paddingBottom: 6,
          },
        }}
      />
    </Drawer>
  );
}

function Settings() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={footerStyles.avatorContainer}
      onPress={() => router.push("/modal")}
    >
      <FontAwesome5 name="user-alt" size={12} color="white" />
    </TouchableOpacity>
  );
}

const footerStyles = StyleSheet.create({
  avatorContainer: {
    backgroundColor: "black",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "black",
    width: 36,
    height: 36,
    padding: 4,
    borderRadius: 20,
  },
});
