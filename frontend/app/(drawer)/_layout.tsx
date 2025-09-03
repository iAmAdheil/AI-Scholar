import { Drawer } from 'expo-router/drawer'
import CustomDrawerContent from '@/components/app/sidebar'

export default function DrawerLayout() {
    return (
        <Drawer
            initialRouteName="chat"
            drawerContent={(props) => <CustomDrawerContent props={props} />}
        >
            <Drawer.Screen
                name="chat"
                options={{
                    title: 'chat',
                    headerShown: true,
                }}
            />
            <Drawer.Screen
                name="chats"
                options={{
                    title: 'chats',
                }}
            />
        </Drawer>
    )
}
