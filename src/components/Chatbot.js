import React, { useState, useEffect } from "react";
import axios from "axios"; 
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  Paper,
  AppBar,
  Toolbar,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ConfirmationDialog from "./ConfirmationDialog"; // Import the ConfirmationDialog component

const ChatUI = () => {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [conversationId, setConversationId] = useState('');
  const [firstApiCompleted, setFirstApiCompleted] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // State to control the dialog
  const chatContainerRef = React.useRef();

  useEffect(() => {
    const handleSecondApiCall = async () => {
      try {
        const payload = {
          _id: conversationId,
          content: JSON.stringify(messages),
        };

        await axios.post('http://localhost:3001/save-text', payload)
          .then(response => {
            if (!conversationId || conversationId == '') {
              setConversationId(response.data._id);
            }
          })

        setFirstApiCompleted(false);
      } catch (error) {
        console.error('Error in the API call:', error);
      }
    };

    if (firstApiCompleted && messages.length > 0) {
      handleSecondApiCall();
    }
  }, [firstApiCompleted, messages]);

  const handleSend = async () => {
    if (input.trim() !== "") {
      const userMessage = { id: messages.length + 1, text: input, sender: "user" };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      setInput("");
  
      try {
        const response = await axios.post('http://localhost:5000/getAns', {
          userInput: input,
          chatHistory: messages
        });
  
        const data = response.data;
        const botResponse = { id: messages.length + 2, text: data.Answer, sender: "bot" };
        setMessages(prevMessages => [...prevMessages, botResponse]);
  
        setFirstApiCompleted(true);
      } catch (error) {
        console.error('Error sending data to backend:', error);
      }
    }
  };  
  
  const handleNewQuestion = () => {
    // Open the confirmation dialog
    setOpenDialog(true);
  };

  const handleResetChat = () => {
    // Reset the chat and close the dialog
    setMessages([]);
    setConversationId('')
    setOpenDialog(false);
  };

  React.useEffect(() => {
    // Scroll to the bottom when messages change
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [messages]);

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        height: "90vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.200",
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AskNarelle
          </Typography>
          <Button color="inherit" onClick={handleNewQuestion} style={{ backgroundColor: 'black' }}>
            Reset Chat
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        ref={chatContainerRef}
        sx={{
          flexGrow: 1,
          overflow: "auto",
          p: 2,
        }}
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </Box>
      <Box sx={{ p: 2, backgroundColor: "background.default" }}>
        <Grid container spacing={2}>
          <Grid item xs={10}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type a question"
              variant="outlined"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              fullWidth
              color="primary"
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSend}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Box>
      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleResetChat}
      />
    </Box>
  );
};

const Message = ({ message }) => {
  const isBot = message.sender === "bot";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isBot ? "row" : "row-reverse",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ bgcolor: isBot ? "primary.main" : "secondary.main" }}>
          {isBot ? "B" : "U"}
        </Avatar>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            ml: isBot ? 1 : 0,
            mr: isBot ? 0 : 1,
            backgroundColor: isBot ? "primary.light" : "secondary.light",
            borderRadius: isBot ? "20px 20px 20px 5px" : "20px 20px 5px 20px",
          }}
        >
          <Typography variant="body1">{message.text}</Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default ChatUI;
