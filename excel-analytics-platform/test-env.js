const result = require('dotenv').config();
if (result.error) {
    console.log('dotenv error:', result.error);
} else {
    console.log('dotenv loaded successfully');
}
console.log('MONGO_URI:', process.env.MONGO_URI);