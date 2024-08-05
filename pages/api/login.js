export default function loginAPI(req, res) {
  /*  res.setHeader(
    'Set-Cookie',
    `authorizer-client=;Expires=-1;Secure=true;HttpOnly=true;Path=/`
  )
*/ console.log('logged in successfully')
  res.status(200).json({ message: 'logged in successfully' })
}
