const express = require('express');
const {UserModel, TodoModel} = require('./db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "123456";
const app = express();
const mongoose = require('mongoose');
const {z, strictObject} = require('zod');


app.use(express.json());

try {
    mongoose.connect('mongodb+srv://anubhav860102:anubhav9936@cluster0.vfhuo.mongodb.net/todo-app-database')
    console.log("connected");
} catch (error) {
    console.log(error);
    
}

app.post("/signup", async function(req, res) {
    const requiredBody = z.object({
        email: z.string().min(3).max(30).email(),
        name: z.string().min(3).max(50),
        password: z.string().min(8).max(16)
    })
    // const parsedData = requiredBody.parse(req.body);

    // below returns 2 things {success, data}
    const parsedDataWithSuccess = requiredBody.safeParse(req.body);

    if (!parsedDataWithSuccess.success) {
        res.json({
            message: "Incorrect format"
        })
        return;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hasedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
        email: email,
        password: hasedPassword,
        name: name
    });
    
    res.json({
        message: "You are signed up"
    })
});

app.post("/signup", async function(req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const name = req.body.name;
    
        const hasedPassword = await bcrypt.hash(password, 10);
    
        await UserModel.create({
            email: email,
            password: hasedPassword,
            name: name
        });
        
        res.json({
            message: "You are signed up"
        })
    } catch(e) {
        res.status(500).json({
            message: "Error while signing up"            
        })
    }
});


app.post('/todo', auth, async(req,res) => {
    const userId = req.userId;
    const title = req.body.title;
    const done = req.body.done;

    await TodoModel.create({
        userId,
        title,
        done
    });

    res.json({
        message: "Todo created"
    })
});

app.get('/todos', async (req,res) => {
    const userId = req.userId;

    const todos = await TodoModel.find({
        userId
    });

    res.json({
        todos
    });
});


function auth(req, res, next) {
    const token = req.headers.token;
    const decodedData = jwt.verify(token, JWT_SECRET);

    if (decodedData) {
        req.userId = decodedData.id;
        next();
    }
    else {
        return res.status(403).json({
            message: "Incorrect credentials"
        })
    }
}

app.listen(3000);