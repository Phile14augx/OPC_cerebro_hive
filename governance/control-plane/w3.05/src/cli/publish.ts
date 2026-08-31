import { Publisher, PublicationRequest, GovernorAuthorizationToken } from '../publication/publisher.js';

export async function runPublishCli() {
  const publisher = new Publisher();
  console.log('Disabled CAS Publisher CLI');
  // It's disabled by default.
  const req: PublicationRequest = {
    targetControlPath: 'unknown',
    canonicalProposalBytes: '',
    expectedPreviousSha256: ''
  };
  const token: GovernorAuthorizationToken = { isValid: false };
  await publisher.publish(req, token);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runPublishCli().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
