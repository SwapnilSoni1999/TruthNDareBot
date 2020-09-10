require('dotenv').config()
const { default: Telegraf } = require('telegraf')
const session = require('telegraf/session')
const WizardScene = require('telegraf/scenes/wizard')
const Stage = require('telegraf/stage')

const bot = new Telegraf(process.env.BOT_TOKEN)

// in memory db to store names
var names = []
var gameRunningFor = ''

const startGame = new WizardScene('start-game',
    async (ctx) => {
        names = []
        await ctx.reply(`Enter people's name you want to begin with newline.\n\nEg.\n\tSwapnil\n\tNisharg\n\tMeet\n\tRajan\n\nAnd send. (Don't add tabs and spaces)\nYou can also check names list with /names`)
        return ctx.wizard.next()
    },
    async (ctx) => {
        names = ctx.message.text.split('\n')
        await ctx.reply(`Adding ${names.length} people to memory database.`)
        await ctx.reply("You can now use /spin to continue game and /stop to stop the game.")
        ctx.scene.leave()
    }
)

const stage = new Stage([startGame])
// middlewares
bot.use(session())
bot.use(stage.middleware())
function authorizedOnly(ctx, next) {
    const authorizedIds = ["317890515", "-1001178996095"]
    const isAuthorized = authorizedIds.find(v => v == ctx.chat.id)
    isAuthorized ? next() : ctx.reply('Sorry you\'re not authorized user by my owner.')
}
bot.use(authorizedOnly)

bot.command('/id', async (ctx) => {
    const chatId = ctx.chat.id
    ctx.reply(`This chat id is ${chatId} and this is a ${String(chatId).startsWith('-') ? 'group' : 'personal chat.'}`)
})

bot.start((ctx) => {
    if (!gameRunningFor || gameRunningFor == '') {
        gameRunningFor = ctx.chat.id
        ctx.scene.enter('start-game')
    } else {
        ctx.reply('Sorry! Game is running for other people right now!')
    }
})

function genRandom() {
    return Math.floor(Math.random() * names.length);
}

bot.command('/spin', async (ctx) => {
    const p1 = names[genRandom()]
    const p2 = names[genRandom()]
    if (p1 == p2) {
        p2 = names[genRandom()]
    }
    await ctx.reply(`${p1} -> ${p2}`)
})

bot.command('/names', async (ctx) => {
    if (names.length) {
        if (gameRunningFor == ctx.chat.id) {
            await ctx.reply(`Names in current game!\n${names.join('\n')}`)
        } else {
            await ctx.reply('Your chat id isnt running game right now!')
        }
    } else {
        await ctx.reply('No names assigned! Probably you haven\'t started game. send /start to begin.')
    }
})

bot.command('/add', async (ctx) => {
    if (ctx.chat.id == gameRunningFor) {
        const name = ctx.message.text.split(' ')[1]
        if (names.find(v => v == name)) {
            return await ctx.reply('Name ' + name + ' is already added in list.\n' + names.join('\n'))
        }
        names.push(name)
        await ctx.reply('Added ' + name + ' to list. Now list is\n' + names.join('\n'))
        // names.push()
    } else {
        await ctx.reply('You\'re not running the game here.')
    }
})

bot.command('/remove', async (ctx) => {
    const name = ctx.message.text.split(' ')[1]
    const foundName = names.find(v => v == name)
    if (foundName) {
        const index = names.findIndex(v => v == name)
        names.pop(index)
        await ctx.reply('Removed '+ name +' from list.\n' + names.join('\n'))
    }
    else {
        await ctx.reply('Name ' + name + ' is already added in list.\n' + names.join('\n'))
    }
})

bot.command('/stop', async (ctx) => {
    if (names.length) {
        gameRunningFor = ''
        names = []
        return await ctx.reply('Cleared memory database and stopped game.')
    }
    else {
        return await ctx.reply('Game is already free send /start to begin. :3')
    }

})

bot.launch().then(() => console.log('Bot started!'))
