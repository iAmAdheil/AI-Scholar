import {
    DrawerContentComponentProps,
    DrawerContentScrollView,
} from '@react-navigation/drawer'
import { Text, TouchableOpacity } from 'react-native'
import { useChats } from '@/hooks/useChats'
import auth from '@react-native-firebase/auth'

function CustomDrawerContent({
    props,
}: {
    props: DrawerContentComponentProps
}) {
    const { chats, loading } = useChats()

    return (
        <DrawerContentScrollView {...props}>
            <Text>Custom Drawer Content</Text>
            <TouchableOpacity onPress={() => auth().signOut()}>
                <Text>Sign Out</Text>
            </TouchableOpacity>
        </DrawerContentScrollView>
    )
}

export default CustomDrawerContent
