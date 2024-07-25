import { validateExternalWalletUser } from '@marketplaces/data-access';

function getEmailFromEmailVerification(data) {
  const emailVerification = data.validations.find(
    (validation) => validation.type === 'email-verification'
  );
  return emailVerification ? emailVerification.email : null;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const userId = req.query.userId;
      const processId = req.query.processId;

      // Obtener data del usuario

      const responseProcess = await fetch(
        `https://api.identity.truora.com/v1/processes/${processId}/result`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Truora-API-Key':
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiIiwiYWRkaXRpb25hbF9kYXRhIjoie30iLCJjbGllbnRfaWQiOiJUQ0k3YTQ4MmQ3OWE1OWFlOGJkY2M1OGY0ZmViNzQyOWYzOSIsImV4cCI6MzI5Mzg0NzIxNywiZ3JhbnQiOiIiLCJpYXQiOjE3MTcwNDcyMTcsImlzcyI6Imh0dHBzOi8vY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20vdXMtZWFzdC0xX1Jib0NpRXdNZyIsImp0aSI6IjAwZTRmNmU5LTZjOWUtNGIzYS1hZjg4LTgxNmRiMjJlNmNjMCIsImtleV9uYW1lIjoidGVzdCIsImtleV90eXBlIjoiYmFja2VuZCIsInVzZXJuYW1lIjoiVENJN2E0ODJkNzlhNTlhZThiZGNjNThmNGZlYjc0MjlmMzktdGVzdCJ9.p_COkM6bGlnhsaiKzcxhcZElUTpxA_k7G3em6mdyPNk',
          },
        }
      );
      const data = await responseProcess.json();

      if (data?.status) {
        const userEmail = getEmailFromEmailVerification(data);

        if (!userEmail) {
          res.status(405).json({ error: 'Error al obtener el correo validado' });
        }

        const payload = {
          username: userEmail,
          role: 'investor',
          email: userEmail,
          walletId: userId,
        };

        const validationResponse = await validateExternalWalletUser(payload);
        res.status(200).json(validationResponse);
      } else {
        res.status(405).json({ error: 'Error al consultar el proceso' });
      }
    } else {
      res.status(405).json({ error: 'Método no permitido' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ha ocurrido un error' });
  }
}
