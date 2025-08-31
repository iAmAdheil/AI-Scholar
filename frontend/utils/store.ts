import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

export const storeToken = async (firebaseId: string) => {
    try {
        const response = await axios.post(
            `${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/signin`,
            {
                id: firebaseId,
            },
        )
        if (response.status === 200 && response.data.token) {
            await AsyncStorage.setItem('token', response.data.token)
			return 1
        }
        return 0
    } catch (error) {
        console.log(error)
        return 0
    }
}
