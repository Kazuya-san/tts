import nextConnect from 'next-connect'
import type { NextApiRequest, NextApiResponse } from 'next'
import {email} from "../../../src/utils/email/mailgun";


// Language: typescript
// Path: pages\api\sendEmail\sendemail.ts

const handler = nextConnect<
  NextApiRequest,
  NextApiResponse
>().post(async (req, res) => {
  


  try {
    await email({
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.text,
      from: req.body.from,
      html: req.body.html,
    })

    res.status(200).json({ success: true })
  } catch (e) {
    res.status(500).json({ success: false, error: (e as Error)?.message })
  }
})

export default handler

