import { Client } from '@neondatabase/serverless'
import { GraphQLError } from 'graphql'

export default async function Resolver(_, { email }, context) {
  const client = new Client(process.env.DATABASE_URL)
  await client.connect()
  console.log("connected");
  client.on('error', (err) => {
    console.error('something bad has happened!', err.stack)
  })

  console.log(email)
  // checking if user exist or not
  const checkIfExist = await client.query(`SELECT * from user_tbl WHERE email = '${email.toLowerCase()}'`)

  try {
    if (checkIfExist.rows.length === 0) {
      return "User not Exist!"
    } else {
      throw new GraphQLError(
        `User already Exist!`
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