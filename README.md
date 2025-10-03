# Elvira Hotel Management App

A modern React Native Expo app for hotel management with authentication, messaging, room management, calendar scheduling, and user profiles.

## Features

### 🔐 Authentication
- Email/password authentication with Supabase
- Role-based access (hotel_admin, hotel_staff, guest, etc.)
- Secure user sessions with automatic sign-out

### 💬 Messages
- WhatsApp-style messaging interface
- Real-time notifications
- Message status indicators
- Contact management

### 🏨 Rooms
- Airbnb-style room browsing
- Interactive filters (All, Available, Occupied, Maintenance)
- Modern card-based design
- Visual status indicators

### 📅 Calendar
- Week and month views
- Absence request system
- Interactive date navigation
- Event management

### 👤 Profile
- User profile management
- Avatar upload with image picker
- Role-based information display
- Authentication controls

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- Expo CLI
- Supabase account

### Installation

1. **Clone and setup the project:**
   ```bash
   cd "APP Elvira/ElviraApp"
   npm install
   ```

2. **Install dependencies:**
   ```bash
   npm install @supabase/supabase-js
   npx expo install expo-notifications expo-haptics expo-image-picker
   ```

3. **Configure Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update `config/supabase.js` with your credentials:
   ```javascript
   const supabaseUrl = 'https://your-project.supabase.co';
   const supabaseKey = 'your-anon-key-here';
   ```

4. **Setup database schema:**
   Run this SQL in your Supabase SQL editor:
   ```sql
   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     email TEXT,
     full_name TEXT,
     avatar_url TEXT,
     role TEXT DEFAULT 'guest',
     phone TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (id)
   );

   -- Enable Row Level Security
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

   -- Create policy for users to read and update their own profiles
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);
   ```

5. **Run the app:**
   ```bash
   npx expo start
   ```

## Demo Credentials

For testing purposes, you can use these demo credentials in the login screen:
- **Email:** demo@hotel.com
- **Password:** password123

## Project Structure

```
ElviraApp/
├── App.js                 # Main app with authentication
├── config/
│   └── supabase.js        # Supabase configuration
├── hooks/
│   ├── useAuth.js         # Authentication logic
│   ├── useCalendarLogic.js # Calendar functionality
│   ├── useMessaging.js    # Messaging logic
│   ├── useNotifications.js # Notification system
│   └── useRooms.js        # Room management
├── screens/
│   ├── CalendarScreen.js  # Calendar with absence requests
│   ├── LoginScreen.js     # Authentication screen
│   ├── MessagesScreen.js  # WhatsApp-style messaging
│   ├── ProfileScreen.js   # User profile management
│   └── RoomsScreen.js     # Room browsing with filters
├── components/
│   ├── AbsenceRequestModal.js # Absence request form
│   ├── CalendarGrid.js    # Calendar grid component
│   ├── CategoryMenu.js    # Room filter menu
│   ├── RoomCard.js        # Individual room cards
│   └── StatusIndicator.js # Visual status indicators
└── utils/
    └── notificationService.js # Notification utilities
```

## Role-Based Access

The app supports multiple user roles:
- **elvira_admin:** Full system access
- **elvira_employee:** Employee-level access
- **hotel_admin:** Hotel administration
- **hotel_staff:** Hotel staff access
- **restaurant_admin:** Restaurant management
- **agency_admin:** Agency administration
- **guest:** Basic guest access

## Key Technologies

- **React Native Expo SDK 54.0.0**
- **Supabase:** Authentication and database
- **React Navigation:** Tab and screen navigation
- **Expo Notifications:** Push notifications
- **Expo Haptics:** Tactile feedback
- **Expo Image Picker:** Avatar uploads

## Development Notes

### Authentication Flow
1. App checks for existing session on startup
2. Shows LoginScreen if not authenticated
3. Provides sign-up/sign-in toggle
4. Creates user profile on registration
5. Maintains session across app restarts

### Notification System
- WhatsApp-style message notifications
- Background and foreground handling
- Automatic permission requests
- Message-specific notification content

### Code Architecture
- Separation of concerns with custom hooks
- Reusable components for UI consistency
- Centralized configuration management
- Error handling and loading states

## Contributing

1. Follow the existing code structure
2. Use the established hooks pattern
3. Maintain consistent styling
4. Test authentication flows
5. Verify notification functionality

## Support

For questions or issues, please refer to the project documentation or create an issue in the repository.