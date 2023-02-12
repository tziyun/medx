const { supermemo } = require('supermemo')
const { CronJob } = require('cron')
const WebSocket = require('ws')
const { randomUUID } = require('crypto')

const server = new WebSocket.Server({port: 8000})
const clients = new Map();
server.on('connection', (socket) => {
    const id = randomUUID()
    clients.set(socket, id)
})
server.on('message', (message) => {
    let reviewCard
    objective = JSON.parse(message)
    if (typeof objective == "number") {
        dueCards.forEach((dueCard) => {
            if (dueCard.id == objective) {
                reviewCard = dueCard
            }
        })
    } else if (message == "requesting card") {
        for (client in clients.keys()) {
            client.send(JSON.stringify(reviewCard))
        }
    } else {
        const { card, grade } = JSON.parse(message)
        updateCard(card, grade)
        for (let i = 0; i < dueCards.length; i++) {
            if (card.id == dueCards[i].id) {
                dueCards.splice(i, 1)
            }
        }
    }
})
server.on('close', () => {
    clients.delete(server)
})

// List of cards, ordered from nearest to farthest in the future
const myCards = []
// List of cards that are due for review
const dueCards = []

// Initialize database with example data
for (let i = 0; i < 10; i++) {
    let card = {
        question: 'question ' + i,
        answer: 'answer ' + i,
        interval: 0,
        repetition: 0,
        efactor: 2.5,
        dueDate: Date.now(),
    }
    myCards.push(card)
}

function checkDeadlines() {
    // Examine the record that is nearest in the future
    let nearest = myCards[0]
    while (nearest != undefined && nearest.dueDate <= Date.now()) {
        // Remove nearest card from general list
        // and add it to the list of cards due
        dueCards.push(myCards.shift())
        nearest = myCards[0]
    }

    // Send cards that are due to clients
    for (client of clients.keys()) {
        client.send(JSON.stringify(dueCards))
    }
}

// Initial check for cards that are due
checkDeadlines()

// Daily check for cards that are due
const dailyCheck = new CronJob(
    '0 0 6 * * *',
    checkDeadlines()
)
dailyCheck.start()

function updateCard(card, grade) {
    const { interval, repetition, efactor } = supermemo(card, grade)
    const dayLength = 8.64 * 10**7
    let newInterval
    if (repetition == 0) {
        newInterval = 1
    } else if (repetition == 1) {
        newInterval = 6
    } else {
        newInterval = interval * efactor
    }
    const dueDate = Date.now() + (newInterval * dayLength)
    let newCard = { ...card, newInterval, repetition, efactor, dueDate }
    myCards.push(newCard)
}
