console.log('🚀 src/routes/index.js загружается');
console.log('typeof module:', typeof module);
console.log('export default type:', typeof (() => {}));
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

import users from './users.js'
import articles from './articles.js'
import root from './root.js'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function getApp() {
const app = fastify({exposeHeadRoutes: true})

const route = (name, placeholderValues) => app.reverse(name, placeholderValues)


await app.register(fastifyCookie)
await app.register(session, {
    secret: 'a secret with minimum length of 32 characters',
    cookie: {secure: false}, //true только для HTTPS
})
await app.register(formbody) //для чтения application/x-www-form-urlencoded
await app.register(users);
await app.register(articles);
await app.register(root);
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

 

 return app

}
/** 
app.listen({ port }, () => {
    console.log(`Example app listening on port ${port}`);
  });*/