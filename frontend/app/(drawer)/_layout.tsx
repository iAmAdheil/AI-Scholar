import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "@/components/app/sidebar";

export default function DrawerLayout() {
  return (
    <Drawer
      initialRouteName="index"
      drawerContent={(props) => <CustomDrawerContent props={props} />}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "index",
          headerShown: true,
        }}
      />
      <Drawer.Screen
        name="chats"
        options={{
          title: "chats",
        }}
      />
    </Drawer>
  );
}
