# 💬 Ride Chat Feature

## Overview
Real-time chat functionality that enables drivers and passengers to communicate once a ride is accepted.

## Features

### ✅ Real-Time Messaging
- Instant message delivery using Socket.IO
- Message persistence in MongoDB
- Read receipts (double checkmark when read)
- Typing indicators
- Message history

### ✅ Security
- JWT authentication required
- Users can only access chats for their own rides
- Messages tied to specific ride IDs
- Automatic authorization checks

### ✅ User Experience
- Clean, modern chat interface
- Smooth animations
- Mobile-responsive design
- Keyboard shortcuts
- Auto-scroll to latest messages

## API Endpoints

### Get Messages for a Ride
```http
GET /api/messages/ride/:rideId
Authorization: Bearer {token}
```

**Response:**
```json
{
  "messages": [
    {
      "_id": "msg123",
      "ride": "ride123",
      "sender": {
        "_id": "user123",
        "firstName": "John",
        "lastName": "Doe"
      },
      "senderRole": "driver",
      "message": "I'm on my way!",
      "messageType": "text",
      "isRead": true,
      "createdAt": "2025-12-03T10:30:00Z"
    }
  ],
  "count": 1
}
```

### Send a Message
```http
POST /api/messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "rideId": "ride123",
  "message": "I'll be there in 5 minutes",
  "messageType": "text"
}
```

### Get Unread Count
```http
GET /api/messages/unread/count
Authorization: Bearer {token}
```

**Response:**
```json
{
  "unreadCount": 3,
  "rides": 2
}
```

## Socket.IO Events

### Client → Server

#### Join Ride Chat
```javascript
socket.emit('join-ride-chat', rideId);
```

#### Send Message
```javascript
socket.emit('send-message', {
  rideId: 'ride123',
  message: 'Hello!',
  sender: userObject,
  senderRole: 'passenger'
});
```

#### Typing Indicator
```javascript
socket.emit('typing', {
  rideId: 'ride123',
  userId: 'user123',
  isTyping: true
});
```

#### Leave Chat
```javascript
socket.emit('leave-ride-chat', rideId);
```

### Server → Client

#### New Message
```javascript
socket.on('new-message', (data) => {
  // data: { rideId, message, sender, senderRole, timestamp }
});
```

#### User Typing
```javascript
socket.on('user-typing', (data) => {
  // data: { userId, isTyping }
});
```

#### Message Read Receipt
```javascript
socket.on('message-read-receipt', (data) => {
  // data: { messageId, userId, readAt }
});
```

## Usage

### Mobile App (React Native)

```javascript
import RideChatScreen from './src/screens/RideChatScreen';

// Navigate to chat
navigation.navigate('RideChat', {
  rideId: ride._id,
  otherUser: driver // or passenger
});
```

### Web App (React)

```javascript
import RideChat from './components/RideChat';

<RideChat
  rideId={ride._id}
  currentUser={user}
  otherUser={driver}
  token={authToken}
/>
```

## When Chat is Available

Chat becomes available when:
1. ✅ Driver accepts the ride (`status: 'accepted'`)
2. ✅ Driver arrives (`status: 'arrived'`)
3. ✅ Ride is in progress (`status: 'started'`)

Chat is disabled when:
- ❌ Ride is pending (not yet accepted)
- ❌ Ride is completed
- ❌ Ride is cancelled

## Database Schema

### Message Model
```javascript
{
  ride: ObjectId,           // Reference to Ride
  sender: ObjectId,         // Reference to User
  senderRole: String,       // 'passenger' or 'driver'
  message: String,          // Max 1000 characters
  messageType: String,      // 'text', 'location', 'system'
  metadata: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  isRead: Boolean,
  readAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Future Enhancements

- 📍 Share live location in chat
- 📷 Send images
- 🎤 Voice messages
- 🔔 Push notifications for new messages
- 📱 Message templates (e.g., "I'm here", "Running late")
- 🌐 Multi-language support
- 🔍 Message search
- 📊 Chat analytics

## Testing

### Manual Testing
1. Create a ride as passenger
2. Accept ride as driver
3. Open chat from ride details
4. Send messages from both sides
5. Verify real-time delivery
6. Check read receipts
7. Test typing indicators

### Automated Testing
```bash
cd server
npm test -- --testPathPattern=messages
```

## Performance

- Messages are paginated (default: 50 per page)
- Socket rooms isolate chat traffic per ride
- Indexes on `ride` and `createdAt` for fast queries
- Automatic cleanup of old messages (configurable)

## Security Considerations

- ✅ All messages require authentication
- ✅ Users can only access their own ride chats
- ✅ Message content is validated and sanitized
- ✅ Rate limiting on message sending
- ✅ XSS protection on message display
- ✅ No PII in socket events

## Support

For issues or questions about the chat feature:
1. Check server logs: `server/logs/combined.log`
2. Verify Socket.IO connection in browser console
3. Test API endpoints with Postman
4. Review this documentation
