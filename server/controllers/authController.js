const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
 try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required"});
    }
    const existingUser = await pool.query(
        "SELECT * FROM users WHERE username = $1 OR email = $2",
        [username, email]
    );

    if (existingUser.rows.length > 0 ) {
        return res.status(400).json({ error: "Username or email already exists"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *`,
        [username, email, hashedPassword]
    );

    res.status(201).json({
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
        role: result.rows[0].role
    });

 } catch (error) {
    res.status(500).json({ error: "Server Error" });
 }   
}

exports.login = async (req, res) => {
    try {
        const {login, password } = req.body;

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1 OR username = $1",
            [login]
        );

        if (existingUser.rows.length === 0) {
            return res.status(404).json({ error: "User not found "})
        }

        const user = existingUser.rows[0];

        const isValidPassword = await bcrypt.compare(
            password, 
            user.password_hash
        );

        if (!isValidPassword) {
            return res.status(401).json({ error: "Invalid credentials, please try again."})
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error "})
    }
}

