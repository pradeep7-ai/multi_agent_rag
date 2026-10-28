import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ChatProvider>
          <Layout />
        </ChatProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;