import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";

export default function Modal() {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  return (
    <View style={styles.container}>
      <View className="w-full py-2 mx-auto flex items-center mb-8">
        <Text style={styles.heading}>Settings</Text>
      </View>
      <View className="flex flex-col gap-8 px-6">
        <View className="flex flex-col gap-4">
          <Text style={styles.groupText}>Account</Text>
          <View className="w-full bg-gray-100 px-4 py-3 rounded-2xl flex flex-col gap-6">
            <View className="w-full flex flex-row items-center justify-between">
              <View className="flex flex-row items-center gap-5">
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color="black"
                />
                <Text style={styles.optionText}>Email</Text>
              </View>
              <View>
                <Text style={styles.optionText}>email@email.com</Text>
              </View>
            </View>

            <View className="w-full flex flex-row items-center justify-between">
              <View className="flex flex-row items-center gap-5">
                <Feather name="phone" size={20} color="black" />
                <Text style={styles.optionText}>Phone</Text>
              </View>
              <View>
                <Text style={styles.optionText}>+91 0123456789</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="flex flex-col gap-4">
          <Text style={styles.groupText}>App</Text>
          <View className="w-full bg-gray-100 py-3 rounded-2xl flex flex-col gap-6">
            <View className="w-full flex flex-row items-center justify-between">
              <View className="flex flex-row items-center gap-5 pl-4">
                <Feather name="moon" size={20} color="black" />
                <Text style={styles.optionText}>Appearance</Text>
              </View>
              <View className="pr-4">
                <Switch onValueChange={toggleSwitch} value={isEnabled} />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity className="w-full bg-gray-100 px-4 py-3 rounded-2xl flex flex-row items-center gap-5">
          <MaterialCommunityIcons name="logout" size={22} color="black" />
          <Text style={styles.optionText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "roboto",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "roboto",
  },
  groupText: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: "roboto",
    paddingLeft: 16,
  },
});
