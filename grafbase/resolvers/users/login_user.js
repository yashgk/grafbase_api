import { Client } from '@neondatabase/serverless'
import { GraphQLError } from 'graphql'
import { hash, getSalt } from 'bcryptjs'
import jsrsasign from 'jsrsasign';

export default async function Resolver(_, { input }, context) {
  const client = new Client(process.env.DATABASE_URL)
  var result;
  await client.connect()
  console.log("connected");
  client.on('error', (err) => {
    console.error('something bad has happened!', err.stack)
  })
  const { email, password } = input
  const query = 'SELECT id, email, pwd FROM user_tbl WHERE email = $1';
  const values = [email.toLowerCase()];
  try {
    result = await client.query(query, values)
    const storedPass = result.rows[0]["pwd"];
    const id = result.rows[0]["id"];
    const salt = getSalt(storedPass)
    const hashedPass = await hash(password, salt);

    const isPasswordMatch = hashedPass === storedPass
    if (isPasswordMatch) {
      const payload = {
        email: email,
        password: hashedPass,
        id: id,
      };
      const header = { alg: 'HS256', typ: 'JWT' };

      // Sign the token
      const token = jsrsasign.jws.JWS.sign('HS256', JSON.stringify(header), JSON.stringify(payload), process.env.JWT_SECRET);
      return {
        token: token,
        id: id
      }
    } else {
      throw new GraphQLError(
        `Password doesn't match.`
      )
    }
  } catch (error) {
    console.log(error)
    return error.toString();
  } finally {
    await client.end()
    console.log('client has disconnected')
  }
}