import bcrypt from 'bcrypt'
import yup from 'yup'
import formbody from '@fastify/formbody'


export default async function(app, opts) {

const state = {
    users: [
        {   
            id: 1,
            name: 'one',
            email: 'email@mail.com',
            passwordDigest: '<bcrypt-hash>'
        }
    ]
}

let nextUserId = 1

function requireAuth(req, res) {
    if (!req.session || !req.session.userId) {
        res.code(401).send({error: 'Вы не авторизованы'})
        return false
    }
    return true
}

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
                error: Error('Пароли должны совпадать'),
            }
        }
        try {
            const result = schema.validateSync(data)
            return {value: result}
        }
        catch (e) {
            return {error: e}
        }
    }
}, async (req, res) => {
    console.log('POST /users called with body:', req.body);
    const {
        name = '',
        email = '',
        password = '',
        passwordConfirmation = ''
    } = req.body || {}

    if(req.validationError) {
        req.flash('warning', req.validationError.message);
        //console.log('Flash before render:', res.flash('warning', req.validationError.message));
        const data = {
            name, email, password, passwordConfirmation,
            flash: res.flash(),
            users:state.users
        }
        //console.log('Flash before render:', res.flash());
        res.view('users/new.pug', data)
        return
    }

    //проверить, что пользователь с таким email еще не зарегистрирован
    if(state.users.find(u => u.email === email)) {
        res.code(500).send({message:'Пользователь с таким email уже  зарегистрирован'})
        //res.flash('warning', 'Пользователь с таким email уже  зарегистрирован')
        return
    }

    try {
        const passwordDigest = await bcrypt.hash(password, 10);
        const user = {
          id: nextUserId++,
          name,
          email,
          passwordDigest,
        };
    
        state.users.push(user);
        req.session.userId = user.id;
        //console.log('Session after setting userId:', req.session);
    
        // Проверяем тип сообщения
    
       // console.log('Flash message to set:', flashMessage, 'Type:', typeof flashMessage);
       req.flash('success', 'Пользователь зарегистрирован')
        //console.log('Flash messages set:', req.flash('success'));
    
        return res.redirect('/articles')
      } catch (e) {
        console.error('Error in POST /users:', e)
        //req.flash('warning', 'Ошибка регистрации')
        res.code(500).send({message:'Ошибка регистрации'})
        //res.code(500)
        return
      }
    });

//Логин пользователя
app.post('/login', async (req, res) => {
    const {
    email= '', 
    password= ''
    } = req.body || {}
    if (!email || !password) { //если не введены пароль и почта
        req.flash('warning', "Почта и пароль обязательны")
        res.code(400)
        return
    }

    const user = state.users.find(u => u.email === email)
    if (!user) {//поиск пользователя по почте 
        req.flash('warning', "Нет пользователя с такой почтой")
        //res.code(400)
        return
    }

    const ok = await bcrypt.compare(password, user.passwordDigest) //сравнение введенного пароля и пароля в базе
    if (!ok) {
        res.code(401).send({error:'неверный пароль'})
        return
    }

    //Запоминаем пользователя в сессии
    req.session.userId = user.id
    req.flash('success', 'Вы вошли')
    res.redirect('/articles')
})

//Форма входа 
app.get('/login', (req, res) => {
    res.view('users/entry.pug')
})

//Список пользователей
app.get('/users', (req, res) => {
    //res.send(state.users)
    const data = {flash: res.flash(), users:state.users}
    res.view('users/index.pug', data)
})

//Форма регистрации пользователя
app.get('/users/new', (req, res) => {
    const data = {flash: res.flash(),}
    res.view('users/new.pug', data)
})
}
