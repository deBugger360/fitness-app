// Minimal react-native mock for token-only tests
// (ThemeContext uses useColorScheme which requires the native module)
export const useColorScheme = () => 'light';
export default {};
