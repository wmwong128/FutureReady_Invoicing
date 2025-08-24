require('./metadata');
import Resend = require('resend');

const RESEND_API_KEY = process.env['RESEND_API_KEY'] as string;
const RESEND_SENDER_EMAIL_ADDR = process.env[
  'RESEND_SENDER_EMAIL_ADDR'
] as string;

const resend = new Resend.Resend(RESEND_API_KEY);

// Omit not working for index signature: https://stackoverflow.com/questions/76616163/omit-seems-broken-on-type-extending-record.
type OmitForIndexed<T, K extends PropertyKey> = {
  [P in keyof T as Exclude<P, K>]: T[P];
};

interface SendEmailOptions {
  payload: OmitForIndexed<Resend.CreateEmailOptions, 'from'>;
  options?: Resend.CreateEmailRequestOptions;
}

/**
 * Send email.
 *
 * ```
 * sendEmail({
 *  payload:
 *   {
 *      to: 'johnDoe@gmail.com',
 *      subject: 'Hello World',
 *      html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
 *  },
 * });
 * ```
 */
const sendEmail = async ({ payload, options }: SendEmailOptions) => {
  return await resend.emails.send(
    {
      from: RESEND_SENDER_EMAIL_ADDR,
      ...payload,
    },
    options
  );
};

export = {
  sendEmail,
};
