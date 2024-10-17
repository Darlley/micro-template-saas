'use server';

import {
  loginSchema,
  LoginSchema,
} from '@/components/SigninForm/SigninForm.schemas';
import { DEFAULT_LOGIN_REDIRECT } from '@/constants/public-routes';
import { sendVerificationEmail } from '@/lib/mail';
import { generateVerificationToken } from '@/lib/tokens';
import { signIn } from '@/services/auth';
import { UserNotFoundError } from '@/services/auth/customErrors';
import { prisma } from '@/services/database';
import { AuthError } from 'next-auth';
import { EmailNotVerifiedError } from '../services/auth/customErrors';

export const login = async (values: LoginSchema) => {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      type: 'error',
      status: 401,
      message: 'Invalid fields',
    };
  }

  const { email, password } = validatedFields.data;

  const userExists = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!userExists) {
    return {
      type: 'error',
      status: 401,
      message: 'Usuário não encontrado!',
    };
  }

  if (!userExists.emailVerified) {
    const verificationToken = await generateVerificationToken(userExists.email);

    await sendVerificationEmail({
      name: userExists.name || email,
      from: process.env.EMAIL_FROM,
      to: email,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken.token}`,
      subject: 'Confirme seu e-mail',
    });

    return {
      type: 'success',
      status: 200,
      message: 'Um email de confirmação foi enviado!',
    };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    console.log('ERROR', error);
    if (error instanceof EmailNotVerifiedError) {
      return {
        type: 'error',
        status: 401,
        message: error.message,
      };
    } else if (error instanceof UserNotFoundError) {
      return {
        type: 'error',
        status: 401,
        message: error.message,
      };
    } else if (error instanceof AuthError) {
      if (error.type === 'CredentialsSignin') {
        return {
          type: 'error',
          status: 401,
          message: 'Credenciais inválidas!',
        };
      }
    }

    return {
      type: 'error',
      status: 500,
      message: 'Algo deu errado durante a autenticação.',
    };
  }
};
