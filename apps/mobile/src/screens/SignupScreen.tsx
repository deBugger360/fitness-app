import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import { supabase } from '../context/AuthProvider';

export default function SignupScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function signUpWithEmail() {
        setLoading(true);
        const {
            data: { session },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        });

        if (error) Alert.alert(error.message);
        if (!session) Alert.alert('Please check your inbox for email verification!');
        setLoading(false);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <TextInput
                    onChangeText={(text) => setEmail(text)}
                    value={email}
                    placeholder="email@address.com"
                    autoCapitalize={'none'}
                    style={styles.input}
                />
            </View>
            <View style={styles.verticallySpaced}>
                <TextInput
                    onChangeText={(text) => setPassword(text)}
                    value={password}
                    secureTextEntry={true}
                    placeholder="Password"
                    autoCapitalize={'none'}
                    style={styles.input}
                />
            </View>
            <View style={[styles.verticallySpaced, styles.mt20]}>
                <Button title="Sign up" disabled={loading} onPress={() => signUpWithEmail()} />
            </View>
            <View style={styles.verticallySpaced}>
                <Button title="Back to Login" disabled={loading} onPress={() => navigation.goBack()} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        justifyContent: 'center',
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    verticallySpaced: {
        paddingTop: 4,
        paddingBottom: 4,
        alignSelf: 'stretch',
    },
    mt20: {
        marginTop: 20,
    },
    input: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
});
