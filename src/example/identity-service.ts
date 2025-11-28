import z from "zod";

export type JsonWebKey = z.infer<typeof JsonWebKey>;
export const JsonWebKey = z.intersection(
  z.object({
    crv: z.string().optional(),
    d: z.string().optional(),
    dp: z.string().optional(),
    dq: z.string().optional(),
    e: z.string().optional(),
    k: z.string().optional(),
    kty: z.string().optional(),
    n: z.string().optional(),
    p: z.string().optional(),
    q: z.string().optional(),
    qi: z.string().optional(),
    x: z.string().optional(),
    y: z.string().optional(),
  }),
  z.object({
    string: z.any().optional(),
  }),
);

export type SecretCodeResp = z.infer<typeof SecretCodeResp>;
export const SecretCodeResp = z.object({
  secret: z.string(),
  passwordfound: z.union([z.boolean(), z.undefined()]).optional(),
});

export type MethodEnum_email = z.infer<typeof MethodEnum_email>;
export const MethodEnum_email = z.literal("email");

export type MethodEnum_phone = z.infer<typeof MethodEnum_phone>;
export const MethodEnum_phone = z.literal("phone");

export type BrandEnum = z.infer<typeof BrandEnum>;
export const BrandEnum = z.union([z.literal("lebara"), z.literal("yallo"), z.literal("swype")]);

export type LanguageEnum = z.infer<typeof LanguageEnum>;
export const LanguageEnum = z.union([z.literal("de"), z.literal("it"), z.literal("fr"), z.literal("en")]);

export type GdprLoginReq = z.infer<typeof GdprLoginReq>;
export const GdprLoginReq = z.object({
  method: z.union([MethodEnum_email, MethodEnum_phone, z.array(z.union([MethodEnum_email, MethodEnum_phone]))]),
  brand: BrandEnum,
  value: z.string(),
  language: LanguageEnum,
});

export type AccessTokenResp = z.infer<typeof AccessTokenResp>;
export const AccessTokenResp = z.object({
  accessToken: z.string(),
});

export type CodeVerificationReq = z.infer<typeof CodeVerificationReq>;
export const CodeVerificationReq = z.object({
  secret: z.string(),
  code: z.string(),
});

export type PosTokenLoginReq = z.infer<typeof PosTokenLoginReq>;
export const PosTokenLoginReq = z.object({
  token: z.string(),
  brand: BrandEnum,
  agentLastName: z.union([z.string(), z.undefined()]).optional(),
  agentFirstName: z.union([z.string(), z.undefined()]).optional(),
});

export type PosSecretCodeResp = z.infer<typeof PosSecretCodeResp>;
export const PosSecretCodeResp = z.object({
  secret: z.string(),
  mfa: z.boolean(),
  phoneNumber: z.union([z.string(), z.undefined()]).optional(),
});

export type PosCredentialLoginReq = z.infer<typeof PosCredentialLoginReq>;
export const PosCredentialLoginReq = z.object({
  username: z.string(),
  password: z.string(),
  brand: BrandEnum,
  language: z.union([LanguageEnum, z.undefined()]).optional(),
  tempChannel: z.union([z.string(), z.undefined()]).optional(),
});

export type PosCodeVerificationReq = z.infer<typeof PosCodeVerificationReq>;
export const PosCodeVerificationReq = z.object({
  secret: z.string(),
  code: z.union([z.string(), z.undefined()]).optional(),
});

export type MethodEnum = z.infer<typeof MethodEnum>;
export const MethodEnum = z.union([
  z.literal("email"),
  z.literal("phone"),
  z.literal("credential"),
  z.literal("token"),
]);

export type SelfcareLoginReq = z.infer<typeof SelfcareLoginReq>;
export const SelfcareLoginReq = z.object({
  method: MethodEnum,
  brand: BrandEnum,
  value: z.string(),
  password: z.union([z.string(), z.undefined()]).optional(),
  language: LanguageEnum,
});

export type SelfcareTokenLoginReq = z.infer<typeof SelfcareTokenLoginReq>;
export const SelfcareTokenLoginReq = z.object({
  token: z.string(),
  brand: BrandEnum,
});

export type Base64URLString = z.infer<typeof Base64URLString>;
export const Base64URLString = z.string();

export type PublicKeyCredentialType = z.infer<typeof PublicKeyCredentialType>;
export const PublicKeyCredentialType = z.literal("public-key");

export type AuthenticatorTransportFuture = z.infer<typeof AuthenticatorTransportFuture>;
export const AuthenticatorTransportFuture = z.union([
  z.literal("ble"),
  z.literal("cable"),
  z.literal("hybrid"),
  z.literal("internal"),
  z.literal("nfc"),
  z.literal("smart-card"),
  z.literal("usb"),
]);

export type PublicKeyCredentialDescriptorJSON = z.infer<typeof PublicKeyCredentialDescriptorJSON>;
export const PublicKeyCredentialDescriptorJSON = z.object({
  id: Base64URLString,
  type: PublicKeyCredentialType,
  transports: z.union([z.array(AuthenticatorTransportFuture), z.undefined()]).optional(),
});

export type UserVerificationRequirement = z.infer<typeof UserVerificationRequirement>;
export const UserVerificationRequirement = z.union([
  z.literal("discouraged"),
  z.literal("preferred"),
  z.literal("required"),
]);

export type AuthenticationExtensionsClientInputs = z.infer<typeof AuthenticationExtensionsClientInputs>;
export const AuthenticationExtensionsClientInputs = z.object({
  appid: z.string().optional(),
  credProps: z.boolean().optional(),
  hmacCreateSecret: z.boolean().optional(),
});

export type PublicKeyCredentialRequestOptionsJSON = z.infer<typeof PublicKeyCredentialRequestOptionsJSON>;
export const PublicKeyCredentialRequestOptionsJSON = z.object({
  challenge: Base64URLString,
  timeout: z.union([z.number(), z.undefined()]).optional(),
  rpId: z.union([z.string(), z.undefined()]).optional(),
  allowCredentials: z.union([z.array(PublicKeyCredentialDescriptorJSON), z.undefined()]).optional(),
  userVerification: z.union([UserVerificationRequirement, z.undefined()]).optional(),
  extensions: z.union([AuthenticationExtensionsClientInputs, z.undefined()]).optional(),
});

export type LoginPasskeyStartReq = z.infer<typeof LoginPasskeyStartReq>;
export const LoginPasskeyStartReq = z.object({
  username: z.string(),
});

export type VerifyCompleteRes = z.infer<typeof VerifyCompleteRes>;
export const VerifyCompleteRes = z.object({
  accessidToken: z.string(),
});

export type AuthenticatorAssertionResponseJSON = z.infer<typeof AuthenticatorAssertionResponseJSON>;
export const AuthenticatorAssertionResponseJSON = z.object({
  clientDataJSON: Base64URLString,
  authenticatorData: Base64URLString,
  signature: Base64URLString,
  userHandle: z.union([Base64URLString, z.undefined()]).optional(),
});

export type AuthenticatorAttachment = z.infer<typeof AuthenticatorAttachment>;
export const AuthenticatorAttachment = z.union([z.literal("cross-platform"), z.literal("platform")]);

export type CredentialPropertiesOutput = z.infer<typeof CredentialPropertiesOutput>;
export const CredentialPropertiesOutput = z.object({
  rk: z.boolean().optional(),
});

export type AuthenticationExtensionsClientOutputs = z.infer<typeof AuthenticationExtensionsClientOutputs>;
export const AuthenticationExtensionsClientOutputs = z.object({
  appid: z.boolean().optional(),
  credProps: CredentialPropertiesOutput.optional(),
  hmacCreateSecret: z.boolean().optional(),
});

export type AuthenticationResponseJSON = z.infer<typeof AuthenticationResponseJSON>;
export const AuthenticationResponseJSON = z.object({
  id: Base64URLString,
  rawId: Base64URLString,
  response: AuthenticatorAssertionResponseJSON,
  authenticatorAttachment: z.union([AuthenticatorAttachment, z.undefined()]).optional(),
  clientExtensionResults: AuthenticationExtensionsClientOutputs,
  type: PublicKeyCredentialType,
});

export type get_GetPublicKeys = typeof get_GetPublicKeys;
export const get_GetPublicKeys = {
  method: z.literal("GET"),
  path: z.literal("/internal/public-key"),
  parameters: z.never(),
  response: z.object({
    keys: z.array(JsonWebKey),
  }),
};

export type get_GetWelKnownPublicKeys = typeof get_GetWelKnownPublicKeys;
export const get_GetWelKnownPublicKeys = {
  method: z.literal("GET"),
  path: z.literal("/internal/.well-known/jwks.json"),
  parameters: z.never(),
  response: z.object({
    keys: z.array(JsonWebKey),
  }),
};

export type get_GenerateKeyPair = typeof get_GenerateKeyPair;
export const get_GenerateKeyPair = {
  method: z.literal("GET"),
  path: z.literal("/internal/generate-keypair"),
  parameters: z.never(),
  response: z.array(JsonWebKey),
};

export type get_RefreshTokenRevoked = typeof get_RefreshTokenRevoked;
export const get_RefreshTokenRevoked = {
  method: z.literal("GET"),
  path: z.literal("/internal/refresh-token-revoked/{id}"),
  parameters: z.object({
    path: z.object({
      id: z.string(),
    }),
  }),
  response: z.object({
    isRevoked: z.boolean(),
  }),
};

export type post_ExpireSession = typeof post_ExpireSession;
export const post_ExpireSession = {
  method: z.literal("POST"),
  path: z.literal("/internal/expire-session/{tokenParentId}"),
  parameters: z.object({
    path: z.object({
      tokenParentId: z.string(),
    }),
  }),
  response: z.unknown(),
};

export type post_ExpireSessionAccount = typeof post_ExpireSessionAccount;
export const post_ExpireSessionAccount = {
  method: z.literal("POST"),
  path: z.literal("/internal/expire-session/account/{tokenSub}"),
  parameters: z.object({
    path: z.object({
      tokenSub: z.string(),
    }),
  }),
  response: z.unknown(),
};

export type post_Login = typeof post_Login;
export const post_Login = {
  method: z.literal("POST"),
  path: z.literal("/public/gdpr/login"),
  parameters: z.object({
    body: GdprLoginReq,
  }),
  response: SecretCodeResp,
};

export type post_Validate = typeof post_Validate;
export const post_Validate = {
  method: z.literal("POST"),
  path: z.literal("/public/gdpr/validate"),
  parameters: z.object({
    body: CodeVerificationReq,
  }),
  response: AccessTokenResp,
};

export type post_Logout = typeof post_Logout;
export const post_Logout = {
  method: z.literal("POST"),
  path: z.literal("/public/gdpr/logout"),
  parameters: z.object({
    body: z.object({
      allDevices: z.boolean().optional(),
    }),
  }),
  response: z.unknown(),
};

export type post_RefreshToken = typeof post_RefreshToken;
export const post_RefreshToken = {
  method: z.literal("POST"),
  path: z.literal("/public/gdpr/refresh-token"),
  parameters: z.never(),
  response: AccessTokenResp,
};

export type post_Token = typeof post_Token;
export const post_Token = {
  method: z.literal("POST"),
  path: z.literal("/public/pos/token"),
  parameters: z.object({
    body: PosTokenLoginReq,
  }),
  response: AccessTokenResp,
};

export type post_PosLogin = typeof post_PosLogin;
export const post_PosLogin = {
  method: z.literal("POST"),
  path: z.literal("/public/pos/login"),
  parameters: z.object({
    body: PosCredentialLoginReq,
  }),
  response: PosSecretCodeResp,
};

export type post_PosValidate = typeof post_PosValidate;
export const post_PosValidate = {
  method: z.literal("POST"),
  path: z.literal("/public/pos/validate"),
  parameters: z.object({
    body: PosCodeVerificationReq,
  }),
  response: AccessTokenResp,
};

export type post_PosLogout = typeof post_PosLogout;
export const post_PosLogout = {
  method: z.literal("POST"),
  path: z.literal("/public/pos/logout"),
  parameters: z.object({
    body: z.object({
      allDevices: z.boolean().optional(),
    }),
  }),
  response: z.unknown(),
};

export type post_PosRefreshToken = typeof post_PosRefreshToken;
export const post_PosRefreshToken = {
  method: z.literal("POST"),
  path: z.literal("/public/pos/refresh-token"),
  parameters: z.never(),
  response: AccessTokenResp,
};

export type get_LoginToken = typeof get_LoginToken;
export const get_LoginToken = {
  method: z.literal("GET"),
  path: z.literal("/public/pos/login/token/{token}"),
  parameters: z.object({
    path: z.object({
      token: z.string(),
    }),
  }),
  response: z.unknown(),
};

export type post_SelfcareLogin = typeof post_SelfcareLogin;
export const post_SelfcareLogin = {
  method: z.literal("POST"),
  path: z.literal("/public/selfcare/login"),
  parameters: z.object({
    body: SelfcareLoginReq,
  }),
  response: SecretCodeResp,
};

export type post_SelfcareToken = typeof post_SelfcareToken;
export const post_SelfcareToken = {
  method: z.literal("POST"),
  path: z.literal("/public/selfcare/token"),
  parameters: z.object({
    body: SelfcareTokenLoginReq,
  }),
  response: AccessTokenResp,
};

export type post_SelfcareValidate = typeof post_SelfcareValidate;
export const post_SelfcareValidate = {
  method: z.literal("POST"),
  path: z.literal("/public/selfcare/validate"),
  parameters: z.object({
    body: CodeVerificationReq,
  }),
  response: AccessTokenResp,
};

export type post_SelfcareLogout = typeof post_SelfcareLogout;
export const post_SelfcareLogout = {
  method: z.literal("POST"),
  path: z.literal("/public/selfcare/logout"),
  parameters: z.object({
    body: z.object({
      allDevices: z.boolean().optional(),
    }),
  }),
  response: z.unknown(),
};

export type post_SelfcareRefreshToken = typeof post_SelfcareRefreshToken;
export const post_SelfcareRefreshToken = {
  method: z.literal("POST"),
  path: z.literal("/public/selfcare/refresh-token"),
  parameters: z.never(),
  response: AccessTokenResp,
};

export type post_LoginPasskeyStart = typeof post_LoginPasskeyStart;
export const post_LoginPasskeyStart = {
  method: z.literal("POST"),
  path: z.literal("/public/selfcare/login/passkey/start"),
  parameters: z.object({
    body: LoginPasskeyStartReq,
  }),
  response: PublicKeyCredentialRequestOptionsJSON,
};

export type post_LoginPasskeyComplete = typeof post_LoginPasskeyComplete;
export const post_LoginPasskeyComplete = {
  method: z.literal("POST"),
  path: z.literal("/public/selfcare/login/passkey/complete"),
  parameters: z.object({
    body: AuthenticationResponseJSON,
  }),
  response: VerifyCompleteRes,
};

export type post_TvLogin = typeof post_TvLogin;
export const post_TvLogin = {
  method: z.literal("POST"),
  path: z.literal("/public/tv/login"),
  parameters: z.object({
    body: SelfcareLoginReq,
  }),
  response: SecretCodeResp,
};

export type post_TvValidate = typeof post_TvValidate;
export const post_TvValidate = {
  method: z.literal("POST"),
  path: z.literal("/public/tv/validate"),
  parameters: z.object({
    body: CodeVerificationReq,
  }),
  response: AccessTokenResp,
};

export type post_TvLogout = typeof post_TvLogout;
export const post_TvLogout = {
  method: z.literal("POST"),
  path: z.literal("/public/tv/logout"),
  parameters: z.object({
    body: z.object({
      allDevices: z.boolean().optional(),
    }),
  }),
  response: z.unknown(),
};

export type get_DoHealthCheck = typeof get_DoHealthCheck;
export const get_DoHealthCheck = {
  method: z.literal("GET"),
  path: z.literal("/internal/healthcheck"),
  parameters: z.never(),
  response: z.unknown(),
};

