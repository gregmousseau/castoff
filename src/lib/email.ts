import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Cast Off <support@mail.castoff.boats>'

export async function sendVerificationCode(to: string, code: string, businessName: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your Cast Off verification code: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0ea5e9;">⛵ Cast Off</h2>
        <p>You're claiming the page for <strong>${businessName}</strong>.</p>
        <p>Your verification code is:</p>
        <div style="background: #f0f9ff; border: 2px solid #0ea5e9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0c4a6e;">${code}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 15 minutes. If you didn't request this, ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Cast Off — Book direct with local charter operators<br/>castoff.boats</p>
      </div>
    `,
  })
}

export async function sendBookingConfirmation(to: string, booking: {
  customerName: string
  businessName: string
  tripDate: string
  tripType: string
  partySize: number
  totalPrice: number
  depositAmount: number
  operatorEmail?: string
  operatorPhone?: string
  slug: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Booking confirmed — ${booking.businessName} on ${booking.tripDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0ea5e9;">⛵ Cast Off</h2>
        <p>Hi ${booking.customerName},</p>
        <p>Your booking with <strong>${booking.businessName}</strong> has been confirmed! 🎉</p>
        
        <div style="background: #f0f9ff; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #6b7280; padding: 4px 0;">Date</td><td style="text-align: right; font-weight: 600;">${booking.tripDate}</td></tr>
            <tr><td style="color: #6b7280; padding: 4px 0;">Trip</td><td style="text-align: right; font-weight: 600;">${booking.tripType}</td></tr>
            <tr><td style="color: #6b7280; padding: 4px 0;">Party Size</td><td style="text-align: right; font-weight: 600;">${booking.partySize} guests</td></tr>
            <tr><td style="color: #6b7280; padding: 4px 0;">Total</td><td style="text-align: right; font-weight: 600;">$${booking.totalPrice}</td></tr>
            <tr><td style="color: #6b7280; padding: 4px 0;">Deposit Paid</td><td style="text-align: right; font-weight: 600;">$${booking.depositAmount}</td></tr>
          </table>
        </div>

        ${booking.operatorEmail || booking.operatorPhone ? `
        <p style="font-size: 14px;"><strong>Contact your captain:</strong></p>
        <p style="font-size: 14px; color: #6b7280;">
          ${booking.operatorEmail ? `Email: ${booking.operatorEmail}<br/>` : ''}
          ${booking.operatorPhone ? `Phone: ${booking.operatorPhone}` : ''}
        </p>
        ` : ''}

        <a href="https://www.castoff.boats/book/${booking.slug}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">View Booking Details</a>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Cast Off — Book direct with local charter operators<br/>castoff.boats</p>
      </div>
    `,
  })
}

export async function sendOperatorNewBooking(to: string, booking: {
  customerName: string
  customerEmail: string
  customerPhone?: string
  tripDate: string
  tripType: string
  partySize: number
  totalPrice: number
  specialRequests?: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New booking request — ${booking.customerName} on ${booking.tripDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0ea5e9;">⛵ Cast Off</h2>
        <p>You have a new booking request!</p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #6b7280; padding: 4px 0;">Customer</td><td style="text-align: right; font-weight: 600;">${booking.customerName}</td></tr>
            <tr><td style="color: #6b7280; padding: 4px 0;">Email</td><td style="text-align: right;">${booking.customerEmail}</td></tr>
            ${booking.customerPhone ? `<tr><td style="color: #6b7280; padding: 4px 0;">Phone</td><td style="text-align: right;">${booking.customerPhone}</td></tr>` : ''}
            <tr><td style="color: #6b7280; padding: 4px 0;">Date</td><td style="text-align: right; font-weight: 600;">${booking.tripDate}</td></tr>
            <tr><td style="color: #6b7280; padding: 4px 0;">Trip</td><td style="text-align: right; font-weight: 600;">${booking.tripType}</td></tr>
            <tr><td style="color: #6b7280; padding: 4px 0;">Party Size</td><td style="text-align: right; font-weight: 600;">${booking.partySize} guests</td></tr>
            <tr><td style="color: #6b7280; padding: 4px 0;">Total</td><td style="text-align: right; font-weight: 600;">$${booking.totalPrice}</td></tr>
          </table>
          ${booking.specialRequests ? `<p style="margin-top: 12px; font-size: 14px; color: #6b7280;"><strong>Special requests:</strong> ${booking.specialRequests}</p>` : ''}
        </div>

        <a href="https://www.castoff.boats/dashboard/bookings" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Review in Dashboard</a>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Cast Off — Book direct with local charter operators<br/>castoff.boats</p>
      </div>
    `,
  })
}

export async function sendPreTripReminder(to: string, booking: {
  customerName: string
  businessName: string
  tripDate: string
  tripType: string
  operatorPhone?: string
  whatToBring?: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Reminder: Your trip with ${booking.businessName} is tomorrow!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0ea5e9;">⛵ Cast Off</h2>
        <p>Hi ${booking.customerName},</p>
        <p>Just a reminder — your <strong>${booking.tripType}</strong> with <strong>${booking.businessName}</strong> is tomorrow, <strong>${booking.tripDate}</strong>!</p>
        
        ${booking.whatToBring ? `
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="font-weight: 600; margin: 0 0 8px 0;">🎒 What to bring:</p>
          <p style="color: #6b7280; font-size: 14px; margin: 0;">${booking.whatToBring.replace(/\n/g, '<br/>')}</p>
        </div>
        ` : ''}

        ${booking.operatorPhone ? `<p style="font-size: 14px;">Need to reach your captain day-of? Call/text: <strong>${booking.operatorPhone}</strong></p>` : ''}

        <p style="font-size: 14px; color: #6b7280;">Have a great time out on the water! 🌊</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Cast Off — Book direct with local charter operators<br/>castoff.boats</p>
      </div>
    `,
  })
}

export async function sendReviewRequest(to: string, booking: {
  customerName: string
  businessName: string
  slug: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `How was your trip with ${booking.businessName}?`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0ea5e9;">⛵ Cast Off</h2>
        <p>Hi ${booking.customerName},</p>
        <p>We hope you had an amazing time with <strong>${booking.businessName}</strong>! 🎉</p>
        <p>Your review helps other travelers find great experiences and supports local captains.</p>

        <a href="https://www.castoff.boats/book/${booking.slug}#reviews" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">Leave a Review</a>

        <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">It only takes a minute and means the world to your captain.</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">Cast Off — Book direct with local charter operators<br/>castoff.boats</p>
      </div>
    `,
  })
}
