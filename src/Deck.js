import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Deck.css";

const BASE_URL = "https://deckofcardsapi.com/api/deck";

const Deck = () => {
    const [deckId, setDeckId] = useState(null);
    const [remaining, setRemaining] = useState(null);
    const [cards, setCards] = useState([]);
    const [drawing, setDrawing] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const getRandom = (min, max) => {
        return Math.random() * (max - min) + min;
    };

    const drawCard = async () => {

        try {
            const res = await axios.get(`${BASE_URL}/${deckId}/draw/`);
            const cardSrc = res.data.cards[0].image;
            const randomRotation = `rotate(${getRandom(-15, 15)}deg)`;
            const randomOffsetX = `${getRandom(-15, 15)}px`;
            const randomOffsetY = `${getRandom(-15, 15)}px`;

            const newCard = {
                src: cardSrc,
                style: {
                    transform: randomRotation,
                    marginLeft: randomOffsetX,
                    marginTop: randomOffsetY
                }
            };

            setCards(prevCards => [...prevCards, newCard]);
            setRemaining(res.data.remaining);
        } catch (error) {
            console.error("Error drawing a card:", error);
        }
    };

    useEffect(() => {
        const initializeDeck = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/new/shuffle`);
                setDeckId(res.data.deck_id);
                setRemaining(res.data.remaining);
            } catch (error) {
                console.error("Error initializing deck:", error);
            }
        };

        initializeDeck();
    }, []);

    useEffect(() => {
        let intervalRef;

        if (drawing) {
            if (remaining > 0) {
                intervalRef = setInterval(drawCard, 100);
            } else {
                setErrorMessage("ERROR: no cards remaining!");
                setDrawing(false); 
            }
        } else {
            clearInterval(intervalRef);
        }
    
        return () => {
            clearInterval(intervalRef);
        };
    }, [drawing, remaining]);

    const toggleDrawing = () => {
        setDrawing(!drawing);
    };

    return (
        <div className="Deck">
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <button className="top-button" onClick={toggleDrawing}>
                {drawing ? "Stop Drawing" : "Start Drawing"}
            </button>
            <div className="Deck-stack">
                {cards.map((card, index) => (
                    <img key={index} src={card.src} alt={`The ${card.value} of ${card.suit}.`} style={card.style} />
                ))}
            </div>
        </div>
    );
};

export default Deck;
