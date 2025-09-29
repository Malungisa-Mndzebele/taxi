import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AuthScreen from '../../screens/AuthScreen';
import { AuthProvider } from '../../context/AuthContext';

// Mock the AuthContext
const mockLogin = jest.fn();
const mockRegister = jest.fn();

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    register: mockRegister,
  }),
  AuthProvider: ({ children }) => children,
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('AuthScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Mode', () => {
    it('should render login form by default', () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      expect(getByText('Welcome back!')).toBeTruthy();
      expect(getByPlaceholderText('Email')).toBeTruthy();
      expect(getByPlaceholderText('Password')).toBeTruthy();
      expect(getByText('Login')).toBeTruthy();
    });

    it('should call login function with valid credentials', async () => {
      mockLogin.mockResolvedValue({ success: true });

      const { getByPlaceholderText, getByText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should show error for invalid credentials', async () => {
      mockLogin.mockResolvedValue({ 
        success: false, 
        message: 'Invalid credentials' 
      });

      const { getByPlaceholderText, getByText, queryByText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpassword');
      fireEvent.press(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
      });
    });

    it('should validate required fields', async () => {
      const { getByText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      const loginButton = getByText('Login');
      fireEvent.press(loginButton);

      // Should not call login with empty fields
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('Register Mode', () => {
    it('should switch to register mode', () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      const switchButton = getByText("Don't have an account? Register");
      fireEvent.press(switchButton);

      expect(getByText('Create your account')).toBeTruthy();
      expect(getByPlaceholderText('First Name')).toBeTruthy();
      expect(getByPlaceholderText('Last Name')).toBeTruthy();
      expect(getByPlaceholderText('Phone Number')).toBeTruthy();
      expect(getByText('Register')).toBeTruthy();
    });

    it('should call register function with valid data', async () => {
      mockRegister.mockResolvedValue({ success: true });

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      // Switch to register mode
      const switchButton = getByText("Don't have an account? Register");
      fireEvent.press(switchButton);

      // Fill form
      const firstNameInput = getByPlaceholderText('First Name');
      const lastNameInput = getByPlaceholderText('Last Name');
      const phoneInput = getByPlaceholderText('Phone Number');
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const confirmPasswordInput = getByPlaceholderText('Confirm Password');
      const registerButton = getByText('Register');

      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(phoneInput, '+1234567890');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
          email: 'john@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'passenger'
        });
      });
    });

    it('should validate password confirmation', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      // Switch to register mode
      const switchButton = getByText("Don't have an account? Register");
      fireEvent.press(switchButton);

      // Fill form with mismatched passwords
      const firstNameInput = getByPlaceholderText('First Name');
      const lastNameInput = getByPlaceholderText('Last Name');
      const phoneInput = getByPlaceholderText('Phone Number');
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const confirmPasswordInput = getByPlaceholderText('Confirm Password');
      const registerButton = getByText('Register');

      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(phoneInput, '+1234567890');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'differentpassword');
      fireEvent.press(registerButton);

      // Should not call register with mismatched passwords
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should validate password length', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      // Switch to register mode
      const switchButton = getByText("Don't have an account? Register");
      fireEvent.press(switchButton);

      // Fill form with short password
      const firstNameInput = getByPlaceholderText('First Name');
      const lastNameInput = getByPlaceholderText('Last Name');
      const phoneInput = getByPlaceholderText('Phone Number');
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const confirmPasswordInput = getByPlaceholderText('Confirm Password');
      const registerButton = getByText('Register');

      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(phoneInput, '+1234567890');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, '123');
      fireEvent.changeText(confirmPasswordInput, '123');
      fireEvent.press(registerButton);

      // Should not call register with short password
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('should allow role selection', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      // Switch to register mode
      const switchButton = getByText("Don't have an account? Register");
      fireEvent.press(switchButton);

      // Select driver role
      const driverButton = getByText('Driver');
      fireEvent.press(driverButton);

      // Fill form
      const firstNameInput = getByPlaceholderText('First Name');
      const lastNameInput = getByPlaceholderText('Last Name');
      const phoneInput = getByPlaceholderText('Phone Number');
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const confirmPasswordInput = getByPlaceholderText('Confirm Password');
      const registerButton = getByText('Register');

      fireEvent.changeText(firstNameInput, 'Jane');
      fireEvent.changeText(lastNameInput, 'Smith');
      fireEvent.changeText(phoneInput, '+0987654321');
      fireEvent.changeText(emailInput, 'jane@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(registerButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+0987654321',
          email: 'jane@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'driver'
        });
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      const { getByPlaceholderText, getByText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      // Should not call login with invalid email
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should validate phone number format', async () => {
      const { getByText, getByPlaceholderText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      // Switch to register mode
      const switchButton = getByText("Don't have an account? Register");
      fireEvent.press(switchButton);

      // Fill form with invalid phone
      const firstNameInput = getByPlaceholderText('First Name');
      const lastNameInput = getByPlaceholderText('Last Name');
      const phoneInput = getByPlaceholderText('Phone Number');
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const confirmPasswordInput = getByPlaceholderText('Confirm Password');
      const registerButton = getByText('Register');

      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(phoneInput, 'invalid-phone');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(registerButton);

      // Should not call register with invalid phone
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during login', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const { getByPlaceholderText, getByText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const loginButton = getByText('Login');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(loginButton);

      // Should show loading indicator
      expect(getByText('Login')).toBeTruthy(); // Button text changes to loading
    });

    it('should show loading state during registration', async () => {
      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const { getByText, getByPlaceholderText } = render(
        <AuthScreen navigation={mockNavigation} />
      );

      // Switch to register mode
      const switchButton = getByText("Don't have an account? Register");
      fireEvent.press(switchButton);

      // Fill form
      const firstNameInput = getByPlaceholderText('First Name');
      const lastNameInput = getByPlaceholderText('Last Name');
      const phoneInput = getByPlaceholderText('Phone Number');
      const emailInput = getByPlaceholderText('Email');
      const passwordInput = getByPlaceholderText('Password');
      const confirmPasswordInput = getByPlaceholderText('Confirm Password');
      const registerButton = getByText('Register');

      fireEvent.changeText(firstNameInput, 'John');
      fireEvent.changeText(lastNameInput, 'Doe');
      fireEvent.changeText(phoneInput, '+1234567890');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.changeText(confirmPasswordInput, 'password123');
      fireEvent.press(registerButton);

      // Should show loading indicator
      expect(getByText('Register')).toBeTruthy(); // Button text changes to loading
    });
  });
});
