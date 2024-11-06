import React, { useState, useRef, useEffect } from 'react';
import ChatIcon from '../images/chat.svg';

const API_URL = 'https://2ucb0d6dkc.execute-api.us-east-1.amazonaws.com/dev/ask';

export const Faqbot = ({ toggleFaqbot }) => {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const responseContainerRef = useRef(null);
    const [hoveredButton, setHoveredButton] = useState(null);

    const handleInputChange = (event) => {
        setQuestion(event.target.value);
    };

    const handleSendClick = async (customQuestion = null, displayMessage = null) => {
        const actualQuestion = customQuestion || question;
        const messageToShow = displayMessage || actualQuestion;

        if (actualQuestion.trim() === '') return;

        const newMessage = { sender: 'user', text: messageToShow };
        setMessages([...messages, newMessage]);
        setLoading(true);
        setQuestion('');

        try {
            const postBody = {
                prompt: actualQuestion
            };

            const data = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(postBody),
            });

            console.log("O QUE RECEBI: ", data)

            if (!data.response) {
                throw new Error(`API error: ${data.error}`);
            }

            const postData = await data.json();
            const { response } = postData;

            makeRequest(response);
        } catch (error) {
            console.error('Error posting request:', error);
            const errorMessage = { sender: 'bot', text: 'Desculpe, ocorreu um erro ao enviar a pergunta.' };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
            setLoading(false);
        }
    };

    const makeRequest = async (response, retries = 10) => {
        try {
            const newResponse = { sender: 'bot', text: response.trim() };
            setMessages((prevMessages) => [...prevMessages, newResponse]);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching response:', error);
            if (retries > 0) {
                setTimeout(() => makeRequest(response, retries - 1), 1000);
            } else {
                const errorMessage = { sender: 'bot', text: 'Desculpe, ocorreu um erro ao buscar a resposta.' };
                setMessages((prevMessages) => [...prevMessages, errorMessage]);
                setLoading(false);
            }
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSendClick();
        }
    };

    useEffect(() => {
        if (responseContainerRef.current) {
            responseContainerRef.current.scrollTop = responseContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const faqButtonStyles = (isHovered) => ({
        backgroundColor: '#ffffff',
        border: 'solid',
        borderWidth: '1px',
        borderColor: isHovered ? '#000000' : '#ccc',
        borderRadius: '10px',
        margin: '2px',
        width: '165px',
        padding: '5px',
        textAlign: 'center',
        fontSize: '12px',
        color: isHovered ? '#000000' : '#A4A4A4',
        cursor: 'pointer',
    });

    return (
        <div style={styles.container}>
            <div style={styles.top}>
                <span style={styles.closeButton} onClick={toggleFaqbot}>&times;</span>
            </div>
            <div style={styles.content}>
                <div style={styles.containerHeader}>
                    <div style={styles.contentIcon}>
                        <img
                            src={ChatIcon}
                            alt="Chat Icon"
                            style={styles.icon}
                        />
                    </div>
                    <div>
                        <p style={styles.question}>Você precisa de ajuda</p>
                    </div>
                </div>
                <div style={styles.responseContainer} ref={responseContainerRef}>
                    {messages.map((msg, index) => (
                        <p key={index} style={msg.sender === 'user' ? styles.userMessage : styles.botMessage}>{msg.text}</p>
                    ))}
                    {loading && <p>Um minuto...</p>}
                </div>
                <div>
                    <div style={styles.inputContainer}>
                        <input
                            type="text"
                            placeholder="Digite sua pergunta"
                            style={styles.input}
                            value={question}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                        />
                        <button style={styles.sendButton} onClick={() => handleSendClick()}>
                            <svg viewBox="0 0 24 24" style={styles.sendIcon}>
                                <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        maxWidth: '800px',
        maxHeight: '800px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    top: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '10px'
    },
    containerHeader: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeButton: {
        fontSize: '20px',
        cursor: 'pointer',
        marginRight: '8px'
    },
    content: {
        padding: '20px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'space-between',
        marginTop: '-60px'
    },
    contentIcon: {
        width: '100px',
        height: '100px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3BF0C',
        borderRadius: '50px',
        marginTop: '20px',
    },
    icon: {
        width: '56.23px',
        height: '38.87px',
    },
    question: {
        fontSize: '18px',
        marginTop: '20px',
    },
    responseContainer: {
        color: '#010101',
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        marginTop: '-40px',
        backgroundColor: '#FEFEFE',
        overflowY: 'auto',
        maxHeight: '510px',
        fontSize: '12px',
        textAlign: 'start'
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#e1ffc7',
        borderRadius: '10px',
        padding: '10px',
        margin: '5px 0',
        maxWidth: '80%',
    },
    botMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f0f0',
        borderRadius: '10px',
        padding: '10px',
        margin: '5px 0',
        maxWidth: '80%',
    },
    faqContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'start',
        marginBottom: '10px',
        fontSize: '12px'
    },
    inputContainer: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
    },
    input: {
        width: '600px',
        flex: 1,
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '20px 0 0 20px',
        fontSize: '12px',
        decoration: 'none',
        textAlign: 'start',
        outline: 'none'
    },
    sendButton: {
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderLeft: 'none',
        padding: '6px',
        borderRadius: '0 20px 20px 0',
        cursor: 'pointer',
    },
    sendIcon: {
        width: '24px',
        height: '24px',
    },
};

export default Faqbot;