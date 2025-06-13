import React, { useState } from 'react';  
import {  
  View,  
  Text,  
  TextInput,  
  TouchableOpacity,  
  StyleSheet,  
  ActivityIndicator,  
  Alert,  
  KeyboardAvoidingView,  
  Platform,  
} from 'react-native';  
import { useOxy } from '@oxyhq/services/full';  
  
interface MessageFormScreenProps {  
  theme?: 'light' | 'dark';  
}  
  
const MessageFormScreen: React.FC<MessageFormScreenProps> = ({ theme = 'light' }) => {  
  const [message, setMessage] = useState('');  
  const [title, setTitle] = useState('');  
  const [isLoading, setIsLoading] = useState(false);  
    
  const { user, oxyServices, activeSessionId } = useOxy();
    
  // Theme colors (following the pattern from your existing screens)  
  const isDarkTheme = theme === 'dark';  
  const textColor = isDarkTheme ? '#FFFFFF' : '#000000';  
  const backgroundColor = isDarkTheme ? '#121212' : '#FFFFFF';  
  const inputBackgroundColor = isDarkTheme ? '#333333' : '#F5F5F5';  
  const placeholderColor = isDarkTheme ? '#AAAAAA' : '#999999';  
  const primaryColor = '#d169e5';  
  const borderColor = isDarkTheme ? '#444444' : '#E0E0E0';  
  
  const sendMessage = async () => {  
    if (!activeSessionId) {  
      Alert.alert('Error', 'No active session found');  
      return;  
    }  

    if (!message.trim() || !title.trim()) {  
      Alert.alert('Error', 'Please fill in both title and message');  
      return;  
    }  
  
    if (!user) {  
      Alert.alert('Error', 'You must be logged in to send messages');  
      return;  
    }  
  
    setIsLoading(true);  
      
    try {  
      // Get the current access token  
      const tokenData = await oxyServices.getTokenBySession(activeSessionId);
        
      if (!tokenData) {  
        Alert.alert('Error', 'No authentication token found');  
        return;  
      }  
  
      // Send to your Express backend  
      const response = await fetch('http://localhost:4000/api/messages', {  
        method: 'POST',  
        headers: {  
          'Content-Type': 'application/json',  
          'Authorization': `Bearer ${tokenData.accessToken}`,  
        },  
        body: JSON.stringify({  
          title: title.trim(),  
          content: message.trim(),  
        }),  
      });  
  
      const result = await response.json();  
  
      if (response.ok) {  
        Alert.alert('Success', 'Message sent successfully!');  
        setMessage('');  
        setTitle('');  
      } else {  
        Alert.alert('Error', result.error || 'Failed to send message');  
      }  
    } catch (error) {  
      console.error('Error sending message:', error);  
      Alert.alert('Error', 'Network error. Please try again.');  
    } finally {  
      setIsLoading(false);  
    }  
  };  
  
  return (  
    <KeyboardAvoidingView   
      style={[styles.container, { backgroundColor }]}  
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  
    >  
      <View style={styles.formContainer}>  
        <Text style={[styles.title, { color: textColor }]}>  
          Send Message  
        </Text>  
          
        {user && (  
          <Text style={[styles.userInfo, { color: placeholderColor }]}>  
            Sending as: {user.username}  
          </Text>  
        )}  
  
        <View style={styles.inputContainer}>  
          <Text style={[styles.label, { color: textColor }]}>Title</Text>  
          <TextInput  
            style={[  
              styles.input,  
              {   
                backgroundColor: inputBackgroundColor,   
                borderColor,   
                color: textColor   
              }  
            ]}  
            placeholder="Enter message title"  
            placeholderTextColor={placeholderColor}  
            value={title}  
            onChangeText={setTitle}  
            editable={!isLoading}  
          />  
        </View>  
  
        <View style={styles.inputContainer}>  
          <Text style={[styles.label, { color: textColor }]}>Message</Text>  
          <TextInput  
            style={[  
              styles.textArea,  
              {   
                backgroundColor: inputBackgroundColor,   
                borderColor,   
                color: textColor   
              }  
            ]}  
            placeholder="Enter your message here..."  
            placeholderTextColor={placeholderColor}  
            value={message}  
            onChangeText={setMessage}  
            multiline  
            numberOfLines={6}  
            textAlignVertical="top"  
            editable={!isLoading}  
          />  
        </View>  
  
        <TouchableOpacity  
          style={[  
            styles.sendButton,  
            {   
              backgroundColor: primaryColor,  
              opacity: (!message.trim() || !title.trim() || isLoading) ? 0.5 : 1  
            }  
          ]}  
          onPress={sendMessage}  
          disabled={!message.trim() || !title.trim() || isLoading}  
        >  
          {isLoading ? (  
            <ActivityIndicator color="#FFFFFF" />  
          ) : (  
            <Text style={styles.sendButtonText}>Send Message</Text>  
          )}  
        </TouchableOpacity>  
      </View>  
    </KeyboardAvoidingView>  
  );  
};  
  
const styles = StyleSheet.create({  
  container: {  
    flex: 1,  
    padding: 20,  
  },  
  formContainer: {  
    flex: 1,  
    justifyContent: 'center',  
  },  
  title: {  
    fontSize: 24,  
    fontWeight: 'bold',  
    textAlign: 'center',  
    marginBottom: 10,  
  },  
  userInfo: {  
    fontSize: 14,  
    textAlign: 'center',  
    marginBottom: 30,  
  },  
  inputContainer: {  
    marginBottom: 20,  
  },  
  label: {  
    fontSize: 16,  
    fontWeight: '600',  
    marginBottom: 8,  
  },  
  input: {  
    borderWidth: 1,  
    borderRadius: 8,  
    padding: 12,  
    fontSize: 16,  
  },  
  textArea: {  
    borderWidth: 1,  
    borderRadius: 8,  
    padding: 12,  
    fontSize: 16,  
    minHeight: 120,  
  },  
  sendButton: {  
    borderRadius: 8,  
    padding: 16,  
    alignItems: 'center',  
    marginTop: 20,  
  },  
  sendButtonText: {  
    color: '#FFFFFF',  
    fontSize: 16,  
    fontWeight: '600',  
  },  
});  
  
export default MessageFormScreen;