import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/connectDB.js';
import userRouter from './Routes/UserRoutes.js';
import productRouter from './Routes/ProductRoutes.js';
import voucherRouter from './Routes/VoucherRouter.js';
import orderRouter from './Routes/OrderRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// connectDB
connectDB();

app.get('/', (req, res) => {
  res.send('API is running...');
});
/* User Router */
app.use('/v4/user', userRouter);
app.use('/v4/product', productRouter);
app.use('/v4/voucher', voucherRouter);
app.use('/v4/order', orderRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});
