import { Client } from '@neondatabase/serverless'
import { hashSync } from 'bcryptjs';

export default async function Resolver(root, { input }, context) {
  const client = new Client(process.env.DATABASE_URL)
  var result;
  await client.connect()
  console.log("connected");
  client.on('error', (err) => {
    console.error('something bad has happened!', err.stack)
  })
  const { name, email, password, shopType } = input
  const currentTime = new Date();
  const hashedPass = hashSync(password, 10);
  const query = 'INSERT INTO user_tbl(username, pwd, email, shop_typ, created_on) VALUES($1, $2, $3, $4, $5)';
  const values = [name, hashedPass, email.toLowerCase(), shopType, currentTime.toISOString()];

  try {
    result = await client.query(query, values)
    console.log(result.fields.toString())
    console.log(result.rowCount)
    console.log(result.rows.toString())
    return "User registration Successful!";
  } catch (error) {
    console.log(error)
    return error.toString();
  } finally {
    await client.end()
    console.log('client has disconnected')
  }
}