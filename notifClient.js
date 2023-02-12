
const ws = new WebSocket('wss://localhost:8000/')

function displayNotifications(dueCards) {
    notifs = document.createElement('div')
    for (card of dueCards) {
        notif = document.createElement('div')
        notifText = document.createElement('p').innerHTML(`You have one question due (question: ${card.question}). Would you like to answer? <a href="review.html">Yes (-10 coins)</a>`)
        notifButton.innerHTML(`Yes\n(costs 10 coins)`)
        notifButton.on('click', () => {
            ws.send(JSON.stringify(card.id))
            window.location.replace("review.html")
        })
        notif.appendNode(notifText, notifButton)
        notifs.appendNode(notif)
    }
    document.getElementsByTagName('body').appendNode(notifs)
}

ws.onmessage = (message) => {
    console.log(message.data)
    const dueCards = JSON.parse(message.data)
    displayNotifications(dueCards)
}
