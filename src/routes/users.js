import fastify from "fastify"  
import view from '@fastify/view'
import formbody from '@fastify/formbody'
import pug from 'pug'
import yup from 'yup'

const app = fastify()
const port = 3000

await app.register(formbody)
app.register(view, { engine: { pug } })

const state = {
    users: [
        {
            name: 'one',
            email: 'email@mail.com',
            password: 'pass'
        }
    ]
}

app.get('/users/new', (req, res) => {
    res.view('../views/users/new.pug')
})

/*
app.get('/users/:id', (req, res) => {
    res.type('html')
    res.send(`<h1>${req.params.id}</h1>`)
  })
*/

/**
  app.post('/users', (req, res) => {
    const user = {
        name: req.body.name.trim(),
        email: req.body.email.trim().toLowerCase(),
        //password: req.body.password,
    }

    state.users.push(user)

    res.redirect('/users')
})
*/


// Создание нового пользователя
app.post('/users', {
    attachValidation: true,
    schema: {
        body: yup.object({
            name: yup.string().min(2, 'Имя должно быть не меньше двух символов'),
            email: yup.string().email(),
            password: yup.string().min(5, 'Пароль должен быть не меньше пяти символов'),
            passwordConfirmation: yup.string().min(5),
        }),
    },
    validatorCompiler: ({schema, method, url, httpPart}) => (data) => {
        if (data.password != data.passwordConfirmation) {
            return {
                error: Error('Password confirmation is not equal the password'),
            }
        }
        try {
            const result = schema.validateSync(data)
            return {value: result}
        }
        catch (e) {
            return {error: e}
        }
    },
}, (req, res) => {
    const {name, email, password, passwordConfirmation} = req.body

    if(req.validationError) {
        const data = {
            name, email, password, passwordConfirmation,
            error: req.validationError,
            users:state.users
        }

        res.view('../views/users/new.pug', data)
        return
    }

    const user = {
        name,
        email,
        password,
    }

    state.users.push(user)

    res.redirect('/users')
})

app.get('/users', (req, res) => {
    //res.send(state.users)
    res.view('../views/users/new.pug', {users:state.users})
})

app.listen({port}, () => {
    console.log(`Example app listening on port ${port}`)
})
