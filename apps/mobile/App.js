import 'react-native-url-polyfill/auto';
import { AuthProvider } from './src/context/AuthProvider';
import RootNavigator from './src/navigation/RootNavigator';

import { ThemeProvider } from '@repo/ui';

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <RootNavigator />
            </AuthProvider>
        </ThemeProvider>
    );
}
