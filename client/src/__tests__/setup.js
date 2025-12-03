require('@testing-library/jest-native/extend-expect');

// Mock react-native modules
jest.mock('react-native-maps', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) => React.createElement(View, { ...props, ref })),
    Marker: (props) => React.createElement(View, props),
    PROVIDER_GOOGLE: 'google',
  };
});

jest.mock('react-native-geolocation-service', () => ({
  getCurrentPosition: jest.fn((success, error, options) => {
    success({
      coords: {
        latitude: 37.78825,
        longitude: -122.4324,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    });
  }),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
  PERMISSIONS: {
    ANDROID: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    },
    IOS: {
      LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNAVAILABLE: 'unavailable',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity, TextInput } = require('react-native');
  
  return {
    Provider: ({ children }) => children,
    TextInput: React.forwardRef((props, ref) => 
      React.createElement(TextInput, { 
        ...props, 
        ref,
        placeholder: props.placeholder || props.label,
        testID: props.testID || props.label
      })
    ),
    Button: (props) => 
      React.createElement(
        TouchableOpacity, 
        { 
          ...props, 
          accessible: true, 
          accessibilityState: { disabled: props.disabled || false },
          testID: props.testID
        }, 
        React.createElement(Text, {}, props.children)
      ),
    Card: Object.assign(
      ({ children, ...props }) => React.createElement(View, props, children),
      {
        Content: ({ children, ...props }) => React.createElement(View, props, children),
        Title: (props) => React.createElement(Text, props, props.children),
        Actions: ({ children, ...props }) => React.createElement(View, props, children),
      }
    ),
    Title: (props) => React.createElement(Text, { ...props, style: [{ fontSize: 20, fontWeight: 'bold' }, props.style] }, props.children),
    Paragraph: (props) => React.createElement(Text, props, props.children),
    ActivityIndicator: (props) => React.createElement(View, props),
    FAB: (props) => React.createElement(TouchableOpacity, props, React.createElement(Text, {}, props.label)),
    Portal: ({ children }) => children,
    Modal: ({ children, visible, ...props }) => visible ? React.createElement(View, props, children) : null,
    List: {
      Item: (props) => React.createElement(TouchableOpacity, props, React.createElement(Text, {}, props.title)),
      Icon: (props) => React.createElement(View, props),
    },
    Divider: (props) => React.createElement(View, props),
    Switch: (props) => React.createElement(TouchableOpacity, props),
    Chip: (props) => React.createElement(View, props, React.createElement(Text, {}, props.children)),
  };
});

jest.mock('socket.io-client', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    close: jest.fn(),
  })),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    openDrawer: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => ({
    Navigator: ({ children }) => children,
    Screen: ({ children }) => children,
  }),
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.resolve({ data: {} })),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
    defaults: {
      headers: {
        common: {},
      },
    },
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
  })),
}));

// Mock environment variables
jest.mock('react-native-dotenv', () => ({
  API_BASE_URL: 'http://localhost:5000',
  GOOGLE_MAPS_API_KEY: 'test-api-key',
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
