# Requirements Document

## Introduction

The User Authentication and Registration System provides secure access control for the Taxi App, supporting both passenger and driver roles. The System enables users to create accounts, authenticate securely, manage their profiles, and verify their identity through phone and email verification.

## Glossary

- **System**: The User Authentication and Registration System
- **User**: Any person using the Taxi App (passenger or driver)
- **Passenger**: A User with the role of requesting rides
- **Driver**: A User with the role of providing rides
- **JWT**: JSON Web Token used for authentication
- **Access Token**: Short-lived token for API authentication
- **Refresh Token**: Long-lived token for obtaining new access tokens
- **Profile**: User account information including personal details and preferences
- **Authorization Header**: HTTP header containing authentication credentials
- **Bcrypt**: Password hashing algorithm with configurable salt rounds
- **SMS**: Short Message Service for sending text messages to phone numbers
- **Verification Code**: Numeric code used to confirm user identity
- **Reset Token**: Unique token used to authorize password reset operations
- **Rate Limit**: Maximum number of requests allowed within a time window
- **IP Address**: Internet Protocol address identifying the source of network requests

## Requirements

### Requirement 1

**User Story:** As a new user, I want to register for an account, so that I can access the Taxi App services

#### Acceptance Criteria

1. WHEN a User submits registration information, THE System SHALL validate that the email address follows RFC 5322 format
2. WHEN a User submits registration information, THE System SHALL validate that the phone number follows E.164 format
3. WHEN a User submits registration information with a password, THE System SHALL validate that the password contains at least 6 characters
4. WHEN a User submits registration information with an email that already exists, THE System SHALL return an error indicating the email is already registered
5. WHEN a User submits registration information with a phone number that already exists, THE System SHALL return an error indicating the phone number is already registered
6. WHEN a User successfully registers, THE System SHALL hash the password using bcrypt with 10 salt rounds before storage
7. WHEN a User successfully registers, THE System SHALL create a user record with firstName, lastName, email, phone, hashed password, and role
8. WHEN a User successfully registers, THE System SHALL generate a JWT access token valid for 1 hour
9. WHEN a User successfully registers, THE System SHALL return the user profile and access token

### Requirement 2

**User Story:** As a registered user, I want to log in to my account, so that I can access my personalized features

#### Acceptance Criteria

1. WHEN a User submits login credentials with email and password, THE System SHALL validate that both fields are provided
2. WHEN a User submits login credentials, THE System SHALL retrieve the user record matching the provided email address
3. WHEN a User submits login credentials with an email that does not exist, THE System SHALL return an authentication error
4. WHEN a User submits login credentials, THE System SHALL compare the provided password with the stored hashed password using bcrypt
5. WHEN a User submits login credentials with an incorrect password, THE System SHALL return an authentication error
6. WHEN a User successfully authenticates, THE System SHALL generate a JWT access token valid for 1 hour
7. WHEN a User successfully authenticates, THE System SHALL return the user profile and access token

### Requirement 3

**User Story:** As a driver, I want to register with my vehicle information, so that I can provide ride services

#### Acceptance Criteria

1. WHEN a User registers with role set to driver, THE System SHALL require vehicle information including make, model, year, color, and plateNumber
2. WHEN a User registers with role set to driver, THE System SHALL validate that the vehicle year is between 1900 and the current year plus 1
3. WHEN a User registers with role set to driver, THE System SHALL require a license number with maximum length of 20 characters
4. WHEN a User registers with role set to driver, THE System SHALL create a driverProfile object containing licenseNumber and vehicleInfo
5. WHEN a User registers with role set to driver, THE System SHALL set isDriver field to true
6. WHEN a User registers with role set to driver, THE System SHALL initialize driverProfile rating to 5.0 and totalRides to 0

### Requirement 4

**User Story:** As an authenticated user, I want to retrieve my profile information, so that I can view my account details

#### Acceptance Criteria

1. WHEN a User requests their profile, THE System SHALL validate that a valid JWT access token is provided in the Authorization header
2. WHEN a User requests their profile with an expired token, THE System SHALL return an authentication error with code AUTH_EXPIRED
3. WHEN a User requests their profile with an invalid token, THE System SHALL return an authentication error with code AUTH_INVALID
4. WHEN a User requests their profile with a valid token, THE System SHALL extract the userId from the JWT payload
5. WHEN a User requests their profile with a valid token, THE System SHALL retrieve the user record matching the userId
6. WHEN a User requests their profile with a valid token, THE System SHALL return the user profile excluding the password field

### Requirement 5

**User Story:** As an authenticated user, I want to update my profile information, so that I can keep my account details current

#### Acceptance Criteria

1. WHEN a User updates their profile, THE System SHALL validate that a valid JWT access token is provided
2. WHEN a User updates their profile with a new email, THE System SHALL validate that the email follows RFC 5322 format
3. WHEN a User updates their profile with a new email, THE System SHALL validate that the email is not already used by another user
4. WHEN a User updates their profile with a new phone, THE System SHALL validate that the phone follows E.164 format
5. WHEN a User updates their profile with a new phone, THE System SHALL validate that the phone is not already used by another user
6. WHEN a User updates their profile, THE System SHALL update only the fields provided in the request
7. WHEN a User updates their profile successfully, THE System SHALL return the updated user profile

### Requirement 6

**User Story:** As a new user, I want to verify my phone number, so that I can confirm my identity

#### Acceptance Criteria

1. WHEN a User requests phone verification, THE System SHALL generate a 6-digit verification code
2. WHEN a User requests phone verification, THE System SHALL send the verification code to the provided phone number via SMS
3. WHEN a User submits a verification code, THE System SHALL validate that the code matches the generated code
4. WHEN a User submits a verification code within 10 minutes, THE System SHALL accept the code as valid
5. WHEN a User submits a verification code after 10 minutes, THE System SHALL reject the code as expired
6. WHEN a User successfully verifies their phone, THE System SHALL set the isVerified field to true

### Requirement 7

**User Story:** As a user, I want to reset my password if I forget it, so that I can regain access to my account

#### Acceptance Criteria

1. WHEN a User requests password reset, THE System SHALL validate that the provided email exists in the database
2. WHEN a User requests password reset, THE System SHALL generate a unique password reset token valid for 1 hour
3. WHEN a User requests password reset, THE System SHALL send the reset token to the user's email address
4. WHEN a User submits a new password with a reset token, THE System SHALL validate that the token is valid and not expired
5. WHEN a User submits a new password with a reset token, THE System SHALL validate that the new password contains at least 6 characters
6. WHEN a User submits a new password with a valid reset token, THE System SHALL hash the new password using bcrypt with 10 salt rounds
7. WHEN a User successfully resets their password, THE System SHALL invalidate the reset token

### Requirement 8

**User Story:** As a system administrator, I want to enforce rate limiting on authentication endpoints, so that I can prevent brute force attacks

#### Acceptance Criteria

1. WHEN a User makes authentication requests from an IP address, THE System SHALL track the number of requests per 15-minute window
2. WHEN a User makes more than 5 authentication requests within 15 minutes from the same IP address, THE System SHALL return a rate limit error with code RATE_LIMIT_EXCEEDED
3. WHEN a User makes authentication requests, THE System SHALL include X-RateLimit-Limit header with value 5
4. WHEN a User makes authentication requests, THE System SHALL include X-RateLimit-Remaining header with the number of remaining requests
5. WHEN a User makes authentication requests, THE System SHALL include X-RateLimit-Reset header with the timestamp when the limit resets
