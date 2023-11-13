import * as React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const ChatUI = () => {
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState([]);
  const [showInput, setShowInput] = React.useState(true);

  const chatContainerRef = React.useRef();

  const handleSend = async () => {
    if (input.trim() !== "") {
      const userMessage = { id: messages.length + 1, text: input, sender: "user" };
      setMessages([...messages, userMessage]);
      setInput("");

      try {
        const response = await fetch('http://localhost:5000/getAns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userInput: input }),
        });

        const data = await response.json();

        // Update state with the bot's response after the user's message has been added
        const botResponse = { id: messages.length + 2, text: data.Answer, sender: "bot" };
        setMessages(prevMessages => [...prevMessages, botResponse]);

        // Hide the input box after receiving the response
        setShowInput(false);

      } catch (error) {
        console.error('Error sending data to backend:', error);
      }
    }
  };

  const handleNewQuestion = () => {
    // Reset the chat and show the input box
    setMessages([]);
    setShowInput(true);
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
        {showInput ? (
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
        ) : (
          <Button
            fullWidth
            color="primary"
            variant="contained"
            onClick={handleNewQuestion}
          >
            New Question
          </Button>
        )}
      </Box>
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
