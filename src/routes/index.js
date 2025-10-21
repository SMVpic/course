import fastify from "fastify"  
import bcrypt from 'bcrypt'
import yup from 'yup'
import view from '@fastify/view'
import formbody from '@fastify/formbody'
import flash from '@fastify/flash'
import pug from 'pug'
import session from '@fastify/session'
import fastifyCookie from '@fastify/cookie'
import {plugin as fastifyReverseRoutes} from 'fastify-reverse-routes'
import sqlite3 from 'sqlite3'
import users from './users.js'
import articles from './articles.js'
import root from './root.js'
import { fileURLToPath } from 'url'
import path from 'path'


export default async function getApp() {
const app = fastify({exposeHeadRoutes: false})
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const route = (name, placeholderValues) => app.reverse(name, placeholderValues)

const db = new sqlite3.Database('db/database.sqlite')
const dbPath = path.join(__dirname, 'db/database.sqlite')
console.log('📂 Подключение к SQLite:', dbPath)
const prepareDatabase = () => {

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY,
            articleName VARCHAR(255) NOT NULL,
            description TEXT
        );
        `)
    
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            passwordDigest VARCHAR(255) NOT NULL
        )
    `)
})

const articles = [
    {id:1, articleName: 'Тест', description: 'Это мой первый тестовый пост добавленный в БД'}
]

const users = [
    {id:1, name:'Михаил', email: 'email@gmail.com', passwordDigest: 'admin'}
]

const stmtArticles = db.prepare('INSERT INTO articles VALUES (?, ?, ?)')

articles.forEach((article) => {
stmtArticles.run(article.id, article.articleName, article.description)
})
stmtArticles.finalize()

const stmtUsers = db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)')

users.forEach((user) => {
    stmtUsers.run(user.id, user.name, user.email, user.passwordDigest)
})
stmtUsers.finalize()
}
prepareDatabase()

await app.register(fastifyCookie)
await app.register(session, {
    secret: 'a secret with minimum length of 32 characters',
    cookie: {secure: false}, //true только для HTTPS
})
await app.register(formbody) //для чтения application/x-www-form-urlencoded

await app.register(fastifyReverseRoutes)
await app.register(view, {
    engine: { pug },
    root: path.join(__dirname, '../views'), //путь к src/views
    defaultContext: {
        route,
    },
 })
 await app.register(flash)
 console.log('Session plugin registered'); // Отладка

console.log('Flash plugin registered');
users(app,db)
articles(app,db)
root(app,db)
 return app

}
/** 
app.listen({ port }, () => {
    console.log(`Example app listening on port ${port}`);
  });*/