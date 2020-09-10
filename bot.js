require('dotenv').config()
const { default: Telegraf } = require('telegraf')
const session = require('telegraf/session')
const WizardScene = require('telegraf/scenes/wizard')
const Stage = require('telegraf/stage')

const bot = new Telegraf(process.env.BOT_TOKEN)

// in memory db to store names
var names = []


const startGame = new WizardScene('start-game',
    async (ctx) => {
        names = []
        await ctx.reply(`Enter people's name you want to begin with newline.\n\nEg.\n\tSwapnil\n\tNisharg\n\tMeet\n\tRajan\n\nAnd send. (Don't add tabs and spaces)`)
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

bot.command('id', async (ctx) => {
    const chatId = ctx.chat.id
    ctx.reply(`This chat id is ${chatId} and this is a ${String(chatId).startsWith('-') ? 'group' : 'personal chat.'}`)
})

bot.start((ctx) => {
    ctx.scene.enter('start-game')
})

bot.launch()

module.exports = bot