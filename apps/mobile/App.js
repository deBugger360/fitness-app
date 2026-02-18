import 'react-native-url-polyfill/auto';
import { AuthProvider } from './src/context/AuthProvider';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
    return (
        <AuthProvider>
            <RootNavigator />
        </AuthProvider>
    );
}
