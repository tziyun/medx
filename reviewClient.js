
const ws = new WebSocket('wss://localhost:8000/')

ws.send("requesting review")

ws.onmessage = (message) => {
    const reviewCard = JSON.parse(message.data)
    document.getElementById('question').setAttribute('value', reviewCard.question)
    document.getElementById('answer').setAttribute('value', reviewCard.answer)
}
