import { Stack } from 'expo-router'
import React from 'react'
import { useColorScheme } from '@/hooks/useColorScheme'

export default function TabLayout() {
    const colorScheme = useColorScheme()

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    title: 'home',
                }}
            />
            <Stack.Screen
                name="signin"
                options={{
                    title: 'signin',
                }}
            />
            <Stack.Screen
                name="otp"
                options={{
                    title: 'otp',
                }}
            />
        </Stack>
    )
}
