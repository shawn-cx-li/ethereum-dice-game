import express from 'express'
import {
  buy, listen, transfer, transferToken
} from './src/crowdsale';

const app = express()

process.on('SIGINT', () => {
  console.log('SIGINT');
  process.exit(0);
});
console.log('PID: ', process.pid);

// app.use(listen);
listen();
app.get('/buy', buy);
app.get('/transfer', transfer);
app.get('/transferToken', transferToken);

app.listen(3000, () => console.log('Example app listening on port 3000!'))
