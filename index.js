// index.js
require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const port = 3000;

// إعداد Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// Regular Expression للتحقق من صحة البريد الإلكتروني
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// تسجيل مستخدم جديد
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    // التحقق من صحة البريد الإلكتروني
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
    }

    const { user, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    // إذا تم إنشاء المستخدم بنجاح، أضفه إلى جدول المستخدمين
    const { data, insertError } = await supabase
        .from('users')
        .insert([{ id: user.id, email: user.email }]);

    if (insertError) {
        return res.status(400).json({ error: insertError.message });
    }

    res.status(201).json({ user: data });
});

// تسجيل دخول المستخدم
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // التحقق من صحة البريد الإلكتروني
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'البريد الإلكتروني غير صحيح' });
    }

    const { session, error } = await supabase.auth.signIn({
        email,
        password,
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ session });
});

// توثيق المستخدمين باستخدام OAuth
app.post('/oauth', async (req, res) => {
    const { provider } = req.body;
    const { data, error } = await supabase.auth.signIn({
        provider,
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ url: data.url });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
