import { redirect } from "next/navigation";

export async function goToWayf(origin: string) {
  const url = "https://wayf.wayf.dk/saml2/idp/SSOService2.php";
  const params = new URLSearchParams({
    response_type: "id_token",
    response_mode: "form_post",
    scope: "openid",
    client_id: "https://op.discosat.dk",
    nonce: "abcdefghijklmnopqrstuvxyz",
    redirect_uri: "https://op.discosat.dk/wayf/callback",
    state: origin,
  });
  redirect(`${url}?${params.toString()}`);
}
