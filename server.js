const express = require('express');
const cors = require('cors');
const app = express();
const nodemailer = require('nodemailer');
const port = process.env.PORT || 5000;
const crypto = require('crypto');

app.use(cors()); // Разрешение запросов с других доменов (для разработки)

app.use(express.json()); // Для работы с JSON

app.use(express.urlencoded({ extended: true }));

const private_key = "sandbox_SksoMN0YVr98god4OEGjSe3Cl71EENvVTgI60XCE";


// Маршрут для получения данных, шифрования и отправки назад
app.post('/api/encrypt', (req, res) => {
    const {data2} = req.body;
    console.log(data2);

    const sign_string = private_key + data2 + private_key;
    console.log(sign_string);

    // Шифрование данных в Base64
    //const encryptedData = Buffer.from(data).toString('base64');
    const signature = crypto.createHash('sha1').update(sign_string).digest('base64');


    console.log('SIGNATURE:', signature);
    // Отправляем обратно зашифрованные данные
    res.json({signature});
});

// Настройка транспортера для отправки почты через Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bravisabright@gmail.com', // Ваша почта
        pass: 'hxqk nbfx vmqs uqir',  // Пароль или специальный "App Password" для Gmail
    },
});

app.post('/send-message', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const mailOptions = {
        from: email, // Адрес отправителя (тот, который ввел пользователь)
        to: 'bravisabright@gmail.com', // Адрес, на который придет письмо
        subject: `Message from ${name} (${email})`, // Тема письма
        text: message, // Тело письма
    };

    // Здесь можно обработать данные (например, отправить на почту или сохранить в базу данных)
    console.log(`Received message from ${name} (${email}): ${message}`);
    // Отправляем письмо
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ error: 'Failed to send email' });
        } else {
            console.log('Email sent: ' + info.response);
            res.status(200).json({ message: 'Server: Message sent successfully!' });
        }
    });

});

let paymentStatus = 'pending'; // Начальный статус

app.post('/api/payment-result', (req, res) => {
    const {data , signature} = req.body;

    console.log('Полученные данные от LiqPay:',  data);
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    console.log('Раскодированные данные от LiqPay:',  decodedData);


    // Проверяем статус платежа
    if (decodedData.status === 'success') {
        // Здесь ты можешь обработать успешный платеж
        // Например, обновить статус заказа в базе данных
        paymentStatus = 'success'; // Обновляем статус
        console.log('Оплата успешна');
    } else {
        paymentStatus = 'failed'; // Обновляем статус
        console.log('Статус оплаты:', decodedData.status);
    }

    // Отправляем ответ LiqPay, чтобы подтвердить получение уведомления
    res.status(200).send('OK');
});

// Эндпоинт для получения статуса
app.get('/api/payment-status', (req, res) => {
    res.json({ status: paymentStatus });
});

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
